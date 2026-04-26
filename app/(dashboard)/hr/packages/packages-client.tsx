"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Users, 
  Trash2, 
  X, 
  Save, 
  Package,
  Target,
  Trophy,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  Download,
  Upload,
  DollarSign,
  Sparkles,
  Search,
  Filter,
  Eye,
  Settings,
  Zap,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  ScanLine,
  Pencil,
  Info,
  Crown,
  Gem,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { createPackageWithEmployees, deleteEmployeePackage, updateEmployeePackage } from "@/lib/actions/hr";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

interface PackagesClientProps {
  initialPackages: any[];
  companyId: number;
}

export function PackagesClient({ initialPackages, companyId }: PackagesClientProps) {
  const { isRTL } = useLocale();
  const t = useTranslations('packages');
  
  const [packages, setPackages] = useState(initialPackages);
  const [isDark, setIsDark] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddEmployeesModalOpen, setIsAddEmployeesModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; item: any | null }>({ isOpen: false, item: null });
    const [successModal, setSuccessModal] = useState<{ isOpen: boolean; type: 'delete' | 'create' | null; title: string }>({ isOpen: false, type: null, title: '' });
    const [excelScanModal, setExcelScanModal] = useState<{ isOpen: boolean; phase: 'scanning' | 'found' | 'done'; count: number; isAddModal: boolean }>({ isOpen: false, phase: 'scanning', count: 0, isAddModal: false });
    const [editModal, setEditModal] = useState<{ isOpen: boolean; pkg: any | null }>({ isOpen: false, pkg: null });
    const [editFormData, setEditFormData] = useState({ group_name: '', work_type: 'target', monthly_target: 0, bonus_after_target: 10 });
    const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    group_name: "",
    work_type: "target",
    monthly_target: 0,
    bonus_after_target: 10,
  });

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains('dark'));
    const observer = new MutationObserver(() => setIsDark(root.classList.contains('dark')));
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const type = searchParams.get('type');
    const create = searchParams.get('create');
    
    if (type === 'commission' && create === 'true') {
      setIsModalOpen(true);
      setFormData(prev => ({ ...prev, work_type: 'commission' }));
    }
  }, [searchParams]);

  const [employees, setEmployees] = useState([
    {
      name: "",
      name_en: "",
      iqama_number: "",
      job_title: "",
      nationality: "",
      user_code: "",
      phone: "",
      email: "",
      basic_salary: 0,
      housing_allowance: 0,
      vehicle_plate: "",
      iban: ""
    }
  ]);

  const [addEmployeesData, setAddEmployeesData] = useState([
    {
      name: "",
      name_en: "",
      iqama_number: "",
      job_title: "",
      nationality: "",
      user_code: "",
      phone: "",
      email: "",
      basic_salary: 0,
      housing_allowance: 0,
      vehicle_plate: "",
      iban: ""
    }
  ]);

  const filteredPackages = packages.filter(pkg =>
    pkg.group_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: packages.length,
    targetType: packages.filter(p => p.work_type === 'target').length,
    salaryType: packages.filter(p => p.work_type === 'salary').length,
    commissionType: packages.filter(p => p.work_type === 'commission').length,
  };

  const addEmployeeRow = (isAddModal = false) => {
    const newRow = {
      name: "",
      name_en: "",
      iqama_number: "",
      job_title: "",
      nationality: "",
      user_code: "",
      phone: "",
      email: "",
      basic_salary: 0,
      housing_allowance: 0,
      vehicle_plate: "",
      iban: ""
    };
    if (isAddModal) {
      setAddEmployeesData([...addEmployeesData, newRow]);
    } else {
      setEmployees([...employees, newRow]);
    }
  };

  const removeEmployeeRow = (index: number, isAddModal = false) => {
    if (isAddModal) {
      if (addEmployeesData.length === 1) {
        toast.error(t('mustHaveOneEmployee'));
        return;
      }
      setAddEmployeesData(addEmployeesData.filter((_, i) => i !== index));
    } else {
      if (employees.length === 1) {
        toast.error(t('mustHaveOneEmployee'));
        return;
      }
      setEmployees(employees.filter((_, i) => i !== index));
    }
  };

  const updateEmployee = (index: number, field: string, value: any, isAddModal = false) => {
    if (isAddModal) {
      const newEmployees = [...addEmployeesData];
      newEmployees[index] = { ...newEmployees[index], [field]: value };
      setAddEmployeesData(newEmployees);
    } else {
      const newEmployees = [...employees];
      newEmployees[index] = { ...newEmployees[index], [field]: value };
      setEmployees(newEmployees);
    }
  };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // Validation: package name required
      if (!formData.group_name.trim()) {
        toast.error(t('validationPackageNameRequired'), { duration: 5000 });
        return;
      }

      // Validation: work type required
      if (!formData.work_type) {
        toast.error(t('validationWorkTypeRequired'), { duration: 5000 });
        return;
      }

      // Validation: if target system, target and bonus are required
      if (formData.work_type === 'target') {
        if (!formData.monthly_target || formData.monthly_target <= 0) {
          toast.error(t('validationTargetRequired'), { duration: 5000 });
          return;
        }
        if (!formData.bonus_after_target || formData.bonus_after_target <= 0) {
          toast.error(t('validationBonusRequired'), { duration: 5000 });
          return;
        }
      }

      // Validation: at least one employee with name filled
      const validEmployees = employees.filter(emp => emp.name.trim() !== "");
      if (validEmployees.length === 0) {
        toast.error(t('validationNoEmployees'), { duration: 5000 });
        return;
      }

      // Validation: check each employee's mandatory fields
      for (let i = 0; i < validEmployees.length; i++) {
        const emp = validEmployees[i];
        const missingFields: string[] = [];
        
        if (!emp.name.trim()) missingFields.push(t('validationEmployeeName'));
        if (!emp.iqama_number.trim()) missingFields.push(t('validationIqamaNumber'));
        if (!emp.nationality.trim()) missingFields.push(t('validationNationality'));
        if (!emp.basic_salary || emp.basic_salary <= 0) missingFields.push(t('validationBasicSalary'));

        if (missingFields.length > 0) {
          toast.error(
            `${t('validationEmployeeIncomplete')} #${i + 1} (${emp.name || '---'})\n${t('validationMissingFields')} ${missingFields.join('، ')}`,
            { duration: 7000 }
          );
          return;
        }
      }

    setIsLoading(true);

    try {
      const result = await createPackageWithEmployees({ 
        ...formData, 
        company_id: companyId,
        employees: validEmployees
      });

      if (result.success) {
            toast.success(t('packageCreatedSuccess'));
            // Fetch fresh data
            const res = await fetch(`/api/hr/packages?company_id=${companyId}`);
            if (res.ok) {
              const data = await res.json();
              setPackages(data);
            } else {
              router.refresh();
            }
            setIsModalOpen(false);
            const createdName = formData.group_name;
          setFormData({
            group_name: "",
            work_type: "target",
            monthly_target: 0,
            bonus_after_target: 10,
          });
          setEmployees([{
              name: "", name_en: "", iqama_number: "", job_title: "",
              nationality: "", user_code: "", phone: "", email: "",
              basic_salary: 0, housing_allowance: 0, vehicle_plate: "", iban: ""
            }]);
            setSuccessModal({ isOpen: true, type: 'create', title: createdName });
      } else {
        toast.error(result.error || t('errorOccurred'));
      }
    } catch {
      toast.error(t('unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployeesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;
    setIsLoading(true);

    try {
      const validAddEmployees = addEmployeesData.filter(emp => emp.name.trim() !== "");
      
      if (validAddEmployees.length === 0) {
        toast.error(t('enterOneEmployeeAtLeast'));
        setIsLoading(false);
        return;
      }

      const invalidAddEmployees = validAddEmployees.filter(emp => {
        const missingName = !emp.name.trim();
        const missingIqama = !emp.iqama_number.trim();
        const missingNationality = !emp.nationality.trim();
        const missingSalary = !emp.basic_salary || emp.basic_salary <= 0;
        return missingName || missingIqama || missingNationality || missingSalary;
      });

      if (invalidAddEmployees.length > 0) {
        toast.error(t('requiredFieldsMissing'));
        setIsLoading(false);
        return;
      }

      const employeesToSave = validAddEmployees.map(emp => ({ ...emp, company_id: companyId }));

      const { saveEmployees } = await import("@/lib/actions/hr");
      const result = await saveEmployees(selectedPackage.id, employeesToSave);

      if (result.success) {
          toast.success(t('employeesAddedSuccess'));
          const res = await fetch(`/api/hr/packages?company_id=${companyId}`);
          if (res.ok) {
            const data = await res.json();
            setPackages(data);
          } else {
            router.refresh();
          }
          setIsAddEmployeesModalOpen(false);
        setAddEmployeesData([{
          name: "", name_en: "", iqama_number: "", job_title: "",
          nationality: "", user_code: "", phone: "", email: "",
          basic_salary: 0, housing_allowance: 0, vehicle_plate: "", iban: ""
        }]);
      } else {
        toast.error(result.error || t('errorOccurred'));
      }
    } catch {
      toast.error(t('unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

    const handleDelete = (pkg: any) => {
      setDeleteConfirmModal({ isOpen: true, item: pkg });
    };

    const confirmDelete = async () => {
      const item = deleteConfirmModal.item;
      if (!item) return;
      setIsLoading(true);

      try {
        const result = await deleteEmployeePackage(item.id);
        if (result.success) {
          setPackages(prev => prev.filter(p => p.id !== item.id));
          setDeleteConfirmModal({ isOpen: false, item: null });
          setSuccessModal({ isOpen: true, type: 'delete', title: item.group_name });
        } else {
          toast.error(result.error || t('errorOccurred'));
        }
      } catch {
        toast.error(t('unexpectedError'));
      } finally {
        setIsLoading(false);
      }
    };

  const openEditModal = (pkg: any) => {
    setEditFormData({
      group_name: pkg.group_name || '',
      work_type: pkg.work_type || 'target',
      monthly_target: pkg.monthly_target || 0,
      bonus_after_target: pkg.bonus_after_target || 10,
    });
    setEditModal({ isOpen: true, pkg });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.pkg) return;
    setIsLoading(true);

    try {
      const result = await updateEmployeePackage(editModal.pkg.id, {
        group_name: editFormData.group_name,
        work_type: editFormData.work_type,
        monthly_target: editFormData.monthly_target,
        bonus_after_target: editFormData.bonus_after_target,
      });

      if (result.success) {
        setPackages(prev => prev.map(p => 
          p.id === editModal.pkg.id 
            ? { ...p, ...editFormData }
            : p
        ));
        setEditModal({ isOpen: false, pkg: null });
        toast.success(t('packageUpdatedSuccess'));
      } else {
        toast.error(result.error || t('errorOccurred'));
      }
    } catch {
      toast.error(t('unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Column header mappings: Arabic + English aliases -> field key
  const columnAliases: Record<string, string[]> = {
    employee_name: ['اسم الموظف', 'Employee Name', 'الاسم', 'Name', 'اسم', 'employee name', 'employee_name'],
    name_en: ['اسم الموظف بالإنجليزية', 'Employee Name EN', 'Name EN', 'الاسم بالإنجليزية', 'name_en', 'English Name'],
    iqama_number: ['رقم الهوية', 'رقم الإقامة', 'Iqama Number', 'Identity Number', 'رقم الاقامة', 'الإقامة', 'الاقامة', 'الهوية', 'Iqama', 'ID Number', 'iqama_number', 'iqama number', 'identity_number', 'identity number', 'Iqama No', 'رقم الهويه'],
    user_code: ['رقم المستخدم', 'User Code', 'كود المستخدم', 'Employee Code', 'user_code', 'user code', 'Code', 'الكود'],
    job_title: ['المسمى الوظيفي', 'Job Title', 'الوظيفة', 'المسمي الوظيفي', 'job_title', 'job title', 'Title', 'الوظيفه'],
    nationality: ['الجنسية', 'Nationality', 'الجنسيه', 'nationality'],
    phone: ['رقم الهاتف', 'Phone Number', 'الهاتف', 'الجوال', 'رقم الجوال', 'Phone', 'phone', 'phone_number', 'Mobile'],
    email: ['البريد الإلكتروني', 'Email', 'البريد', 'الايميل', 'الإيميل', 'email', 'Email Address', 'البريد الالكتروني'],
    basic_salary: ['الراتب الأساسي', 'Basic Salary', 'الراتب', 'الراتب الاساسي', 'Salary', 'basic_salary', 'basic salary'],
    housing_allowance: ['بدل السكن', 'Housing Allowance', 'السكن', 'بدل سكن', 'Housing', 'housing_allowance', 'housing allowance'],
    vehicle_plate: ['لوحة المركبة', 'Vehicle Plate', 'المركبة', 'لوحة السيارة', 'رقم اللوحة', 'Plate', 'vehicle_plate', 'vehicle plate', 'Car Plate'],
    iban: ['الآيبان', 'IBAN', 'آيبان', 'iban', 'الايبان', 'Bank IBAN'],
  };

  const resolveColumnField = (header: string): string | null => {
    const normalized = header.trim().toLowerCase();
    for (const [field, aliases] of Object.entries(columnAliases)) {
      if (aliases.some(alias => alias.toLowerCase() === normalized)) return field;
    }
    return null;
  };

  const downloadTemplate = (isAddModal = false) => {
    const workType = isAddModal ? selectedPackage?.work_type : formData.work_type;
    const isSalary = workType === 'salary';

    // Bilingual headers: Arabic | English
    let headers: string[];
    let sampleRowAr: (string | number)[];
    let sampleRowEn: (string | number)[];
    if (isSalary) {
      headers = ['اسم الموظف\nEmployee Name', 'اسم الموظف بالإنجليزية\nName EN', 'رقم الهوية\nID Number', 'المسمى الوظيفي\nJob Title', 'الجنسية\nNationality', 'رقم الهاتف\nPhone Number', 'البريد الإلكتروني\nEmail', 'الراتب الأساسي\nBasic Salary', 'بدل السكن\nHousing Allowance', 'الآيبان\nIBAN'];
      sampleRowAr = ["أحمد محمد", "Ahmed Mohammed", "1234567890", "محاسب", "سعودي", "0555555555", "ahmed@example.com", 5000, 1000, "SA0000000000000000000000"];
      sampleRowEn = ["Ahmed Mohammed", "Ahmed Mohammed", "1234567890", "Accountant", "Saudi", "0555555555", "ahmed@example.com", 5000, 1000, "SA0000000000000000000000"];
    } else {
      headers = ['اسم الموظف\nEmployee Name', 'اسم الموظف بالإنجليزية\nName EN', 'رقم الهوية\nID Number', 'الجنسية\nNationality', 'رقم المستخدم\nUser Code', 'رقم الهاتف\nPhone Number', 'البريد الإلكتروني\nEmail', 'الراتب الأساسي\nBasic Salary', 'بدل السكن\nHousing Allowance', 'لوحة المركبة\nVehicle Plate', 'الآيبان\nIBAN'];
      sampleRowAr = ["أحمد محمد", "Ahmed Mohammed", "1234567890", "سعودي", "EMP001", "0555555555", "ahmed@example.com", 3000, 1000, "أ ب ج 1234", "SA0000000000000000000000"];
      sampleRowEn = ["Ahmed Mohammed", "Ahmed Mohammed", "1234567890", "Saudi", "EMP001", "0555555555", "ahmed@example.com", 3000, 1000, "ABC 1234", "SA0000000000000000000000"];
    }

    const wsData = [headers, sampleRowAr, sampleRowEn];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths and header row height for bilingual text
    ws['!cols'] = headers.map(() => ({ wch: 26 }));
    ws['!rows'] = [{ hpt: 40 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, `employee_template_${workType}.xlsx`);
  };

  const parseWorkbook = (file: File, isAddModal: boolean) => {
    const workType = isAddModal ? selectedPackage?.work_type : formData.work_type;
    const isSalary = workType === 'salary';
    const isCSV = file.name.toLowerCase().endsWith('.csv');

    const processData = (workbook: XLSX.WorkBook) => {
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false, defval: '' });

      if (rawRows.length < 2) {
        setExcelScanModal({ isOpen: false, phase: 'scanning', count: 0, isAddModal: false });
        toast.error(t('excelParseError'));
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

      const newEmployees = rawRows.slice(1).map(values => {
        if (!values || values.every((v: any) => !v || String(v).trim() === '')) return null;

        const getValue = (fieldName: string): string => {
          const idx = columnFieldMap.indexOf(fieldName);
          if (idx === -1) return '';
          const v = values[idx];
          return v != null ? String(v).trim() : '';
        };
        const getNum = (fieldName: string): number => {
          const v = getValue(fieldName);
          return parseFloat(v) || 0;
        };

        const emp = {
          name: getValue('employee_name'),
          name_en: getValue('name_en'),
          iqama_number: getValue('iqama_number'),
          job_title: getValue('job_title'),
          nationality: getValue('nationality'),
          user_code: getValue('user_code'),
          phone: getValue('phone'),
          email: getValue('email'),
          basic_salary: getNum('basic_salary'),
          housing_allowance: getNum('housing_allowance'),
          vehicle_plate: getValue('vehicle_plate'),
          iban: getValue('iban'),
        };

        return emp.name ? emp : null;
      }).filter(Boolean) as any[];

      setTimeout(() => {
        setExcelScanModal(prev => ({ ...prev, phase: 'found', count: newEmployees.length }));
        setTimeout(() => {
          if (newEmployees.length > 0) {
            if (isAddModal) {
              setAddEmployeesData(newEmployees);
            } else {
              setEmployees(newEmployees);
            }
          }
          setExcelScanModal(prev => ({ ...prev, phase: 'done' }));
          setTimeout(() => {
            setExcelScanModal({ isOpen: false, phase: 'scanning', count: 0, isAddModal: false });
          }, 2000);
        }, 1200);
      }, 1500);
    };

    if (isCSV) {
        // Read CSV as ArrayBuffer for encoding detection + XLSX parsing
        const binaryReader = new FileReader();
        binaryReader.onload = (event) => {
          try {
            const buffer = event.target?.result as ArrayBuffer;
            const bytes = new Uint8Array(buffer);

            // Detect encoding from raw bytes
            let codepage = 65001; // UTF-8 default
            const hasUtf8Bom = bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF;
            if (!hasUtf8Bom) {
              // Check if bytes are valid UTF-8
              let isValidUtf8 = true;
              let hasHighBytes = false;
              for (let i = 0; i < Math.min(bytes.length, 4096); i++) {
                const b = bytes[i];
                if (b < 0x80) continue;
                hasHighBytes = true;
                if (b >= 0xC2 && b <= 0xDF) {
                  if (i + 1 >= bytes.length || (bytes[++i] & 0xC0) !== 0x80) { isValidUtf8 = false; break; }
                } else if (b >= 0xE0 && b <= 0xEF) {
                  if (i + 2 >= bytes.length || (bytes[++i] & 0xC0) !== 0x80 || (bytes[++i] & 0xC0) !== 0x80) { isValidUtf8 = false; break; }
                } else if (b >= 0xF0 && b <= 0xF4) {
                  if (i + 3 >= bytes.length || (bytes[++i] & 0xC0) !== 0x80 || (bytes[++i] & 0xC0) !== 0x80 || (bytes[++i] & 0xC0) !== 0x80) { isValidUtf8 = false; break; }
                } else { isValidUtf8 = false; break; }
              }
              if (hasHighBytes && !isValidUtf8) codepage = 1256; // windows-1256
            }

            // Decode text using detected encoding
            const decoder = new TextDecoder(codepage === 1256 ? 'windows-1256' : 'utf-8');
            let csvText = decoder.decode(bytes);
            // Remove BOM if present
            if (csvText.charCodeAt(0) === 0xFEFF) csvText = csvText.slice(1);

            // Detect separator: count ; vs , outside quotes in full text
            let semiCount = 0, commaCount = 0, inQ = false;
            for (let i = 0; i < Math.min(csvText.length, 2000); i++) {
              const c = csvText[i];
              if (c === '"') inQ = !inQ;
              else if (!inQ) { if (c === ';') semiCount++; else if (c === ',') commaCount++; }
            }
            const sep = semiCount > commaCount ? ';' : ',';

            // Parse using XLSX with detected separator
            const workbook = XLSX.read(csvText, { type: 'string', FS: sep });
            processData(workbook);
          } catch {
            setExcelScanModal({ isOpen: false, phase: 'scanning', count: 0, isAddModal: false });
            toast.error(t('excelParseError'));
          }
        };
        binaryReader.readAsArrayBuffer(file);
      } else {
      // Read XLSX/XLS as binary
      const binaryReader = new FileReader();
      binaryReader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', codepage: 65001 });
          processData(workbook);
        } catch {
          setExcelScanModal({ isOpen: false, phase: 'scanning', count: 0, isAddModal: false });
          toast.error(t('excelParseError'));
        }
      };
      binaryReader.readAsArrayBuffer(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isAddModal = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    // Show scanning modal
    setExcelScanModal({ isOpen: true, phase: 'scanning', count: 0, isAddModal });
    parseWorkbook(file, isAddModal);
  };

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
      case 'target': return t('targetSystemOption');
      case 'salary': return t('salarySystemOption');
      case 'commission': return t('commissionSystemOption');
      default: return workType;
    }
  };

  const getWorkTypeShortLabel = (workType: string) => {
    switch (workType) {
      case 'target': return t('targetLabel');
      case 'salary': return t('salaryLabel');
      case 'commission': return t('commissionLabel');
      default: return workType;
    }
  };

  // Per work-type card theme colors
  const cardTheme = {
    target: {
      lightBg: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #4338ca 100%)',
      darkBg:  'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #4338ca 100%)',
      glow1: '#3b82f6',
      glow2: '#6366f1',
    },
    salary: {
      lightBg: 'linear-gradient(135deg, #047857 0%, #059669 50%, #0d9488 100%)',
      darkBg:  'linear-gradient(135deg, #065f46 0%, #047857 50%, #0d9488 100%)',
      glow1: '#10b981',
      glow2: '#34d399',
    },
    commission: {
      lightBg: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #c2410c 100%)',
      darkBg:  'linear-gradient(135deg, #92400e 0%, #b45309 50%, #d97706 100%)',
      glow1: '#f59e0b',
      glow2: '#fb923c',
    },
  } as const;

  type WorkType = keyof typeof cardTheme;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen pb-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full px-3 md:px-6 pt-6 space-y-5"
      >
        {/* ══════════════════ CARD 1 — HEADER ══════════════════ */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-violet-900 border border-white/10 shadow-2xl shadow-violet-500/10"
        >
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
          <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} w-64 h-64 bg-violet-600/15 rounded-full blur-3xl -translate-y-1/2 ${isRTL ? '-translate-x-1/3' : 'translate-x-1/3'}`} />
          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white/40">
                  <Link href="/hr" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                    <LayoutDashboard size={12} />
                    {t('hrAffairs')}
                  </Link>
                  {isRTL ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                  <span className="text-purple-400 font-black">{t('packagesManagement')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Package className="text-white" size={20} />
                  </div>
                  <h1 className="text-2xl font-black text-white">{t('title')}</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/8 border border-white/10 rounded-xl backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                  <span className="text-sm font-black text-white/70">{packages.length} {t('packagesCount')}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700 transition-all font-black text-sm shadow-xl shadow-purple-500/30"
                >
                  <Plus size={18} />
                  {t('createNewPackage')}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════ CARD 2 — STATS GRID ══════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { gradient: "from-purple-500 to-violet-600", glow: "bg-purple-500/10", icon: <Package size={18} className="text-white" />, badgeColor: "text-purple-300 bg-purple-500/20 border-purple-500/30", badge: t('total'), label: t('totalPackages'), value: stats.total, sub: t('allWorkGroups'), delay: 0.2 },
            { gradient: "from-blue-500 to-indigo-600", glow: "bg-blue-500/10", icon: <Target size={18} className="text-white" />, badgeColor: "text-blue-300 bg-blue-500/20 border-blue-500/30", badge: t('targetLabel'), label: t('targetSystem'), value: stats.targetType, sub: t('targetPackages'), delay: 0.3 },
            { gradient: "from-emerald-500 to-teal-600", glow: "bg-emerald-500/10", icon: <DollarSign size={18} className="text-white" />, badgeColor: "text-emerald-300 bg-emerald-500/20 border-emerald-500/30", badge: t('salaryLabel'), label: t('salarySystem'), value: stats.salaryType, sub: t('salaryPackages'), delay: 0.4 },
            { gradient: "from-amber-500 to-orange-600", glow: "bg-amber-500/10", icon: <Zap size={18} className="text-white" />, badgeColor: "text-amber-300 bg-amber-500/20 border-amber-500/30", badge: t('commissionLabel'), label: t('commissionSystem'), value: stats.commissionType, sub: t('commissionPackages'), delay: 0.5 },
          ].map((stat, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-5 shadow-xl border border-white/10 hover:-translate-y-1 transition-all`}>
                <div className={`absolute top-0 right-0 w-20 h-20 ${stat.glow} rounded-full -translate-y-8 translate-x-8 blur-xl`} />
                <div className="relative z-10 flex items-start justify-between">
                  <div className="p-2 bg-white/15 rounded-xl">{stat.icon}</div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${stat.badgeColor}`}>{stat.badge}</span>
                </div>
                <div className="mt-4 relative z-10">
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-wider">{stat.label}</p>
                  <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: stat.delay, type: "spring" }} className="text-3xl font-black text-white mt-1">{stat.value}</motion.p>
                  <p className="text-white/40 text-[10px] font-bold mt-1">{stat.sub}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ══════════════════ CARD 3 — PACKAGES LIST ══════════════════ */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-slate-800/95 border border-slate-600/40 shadow-xl"
        >
          {/* Search/filter bar */}
          <div className="px-6 py-4 border-b border-white/8 bg-slate-900/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <Package className="text-white" size={18} />
                </div>
                <div>
                  <h3 className="text-white font-black text-sm">{t('packagesList')}</h3>
                  <p className="text-white/40 text-[11px] font-bold">{filteredPackages.length} {t('packagesInList')}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 sm:min-w-[280px]">
                  <Search className={cn("absolute top-1/2 -translate-y-1/2 text-white/30", isRTL ? "right-4" : "left-4")} size={16} />
                  <input
                    type="text"
                    placeholder={t('searchByPackageName')}
                    className={cn(
                      "w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/40 transition-all",
                      isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                    )}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-all font-bold text-xs border border-white/10"
                >
                  <Filter size={14} />
                  {t('filter')}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Packages grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                    {filteredPackages.map((pkg, index) => (
                        <motion.div
                          key={pkg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.05 }}
                          className="group"
                        >
                          {/* Single Card - vibrant colored gradient per work type */}
                          <div data-pkg-card="true" data-work-type={pkg.work_type} className={cn(
                            "shadow-2xl pkg-card",
                            pkg.work_type === 'target'
                              ? "pkg-card-target"
                              : pkg.work_type === 'salary'
                              ? "pkg-card-salary"
                              : "pkg-card-commission"
                          )} style={{
                            borderRadius: '2rem',
                            position: 'relative',
                            overflow: 'hidden',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                          }}>
                            {/* Glowing overlay */}
                            <div className={cn(
                              "absolute inset-0 opacity-20",
                              pkg.work_type === 'target'
                                ? "bg-[radial-gradient(ellipse_at_top_right,#3b82f6_0%,transparent_60%)]"
                                : pkg.work_type === 'salary'
                                ? "bg-[radial-gradient(ellipse_at_top_right,#10b981_0%,transparent_60%)]"
                                : "bg-[radial-gradient(ellipse_at_top_right,#f59e0b_0%,transparent_60%)]"
                            )} />
                            {/* Bottom glow */}
                            <div className={cn(
                              "absolute inset-0 opacity-15",
                              pkg.work_type === 'target'
                                ? "bg-[radial-gradient(ellipse_at_bottom_left,#6366f1_0%,transparent_60%)]"
                                : pkg.work_type === 'salary'
                                ? "bg-[radial-gradient(ellipse_at_bottom_left,#34d399_0%,transparent_60%)]"
                                : "bg-[radial-gradient(ellipse_at_bottom_left,#fbbf24_0%,transparent_60%)]"
                            )} />

                            {/* Package Counter Badge */}
                            <div className={cn(
                              "absolute top-4 z-10 h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-xl border-2",
                              pkg.work_type === 'target'
                                ? "bg-gradient-to-br from-blue-400 to-indigo-600 border-blue-300/50 shadow-blue-500/40"
                                : pkg.work_type === 'salary'
                                ? "bg-gradient-to-br from-emerald-400 to-teal-600 border-emerald-300/50 shadow-emerald-500/40"
                                : "bg-gradient-to-br from-amber-400 to-orange-600 border-amber-300/50 shadow-amber-500/40",
                              isRTL ? "right-4" : "left-4"
                            )}>
                              {index + 1}
                            </div>

                            <div className="relative z-10 space-y-5 flex flex-col h-full">
                              {/* Header - Centered */}
                              <div className="flex flex-col items-center gap-3 pt-4">
                                <div className={cn(
                                  "h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all border border-white/20",
                                  pkg.work_type === 'target'
                                    ? "bg-gradient-to-br from-blue-400/40 to-indigo-600/40 shadow-blue-500/30"
                                    : pkg.work_type === 'salary'
                                    ? "bg-gradient-to-br from-emerald-400/40 to-teal-600/40 shadow-emerald-500/30"
                                    : "bg-gradient-to-br from-amber-400/40 to-orange-600/40 shadow-amber-500/30"
                                )}>
                                  {pkg.work_type === 'target' && <Shield size={28} />}
                                  {pkg.work_type === 'salary' && <Crown size={28} />}
                                  {pkg.work_type === 'commission' && <Gem size={28} />}
                                </div>
                                <h3 className="text-lg font-black text-white text-center line-clamp-2 drop-shadow-sm">{pkg.group_name}</h3>
                              </div>

                              {/* Work Type Badge */}
                              <div className="flex justify-center">
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border",
                                  pkg.work_type === 'target'
                                    ? "bg-blue-500/25 text-blue-200 border-blue-400/30"
                                    : pkg.work_type === 'salary'
                                    ? "bg-emerald-500/25 text-emerald-200 border-emerald-400/30"
                                    : "bg-amber-500/25 text-amber-200 border-amber-400/30"
                                )}>
                                  {pkg.work_type === 'target' && <Target size={12} />}
                                  {pkg.work_type === 'salary' && <DollarSign size={12} />}
                                  {pkg.work_type === 'commission' && <Zap size={12} />}
                                  {getWorkTypeLabel(pkg.work_type)}
                                </span>
                              </div>

                              {/* Stats Grid */}
                              <div className={cn("grid gap-3", pkg.work_type === 'target' ? "grid-cols-3" : "grid-cols-1")}>
                                {/* Employees count - always shown */}
                                <div className="rounded-xl p-4 border transition-colors bg-white/10 border-white/20 backdrop-blur-sm">
                                  <div className="flex items-center gap-1.5 text-white/70 mb-1">
                                    <Users size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-wider">{t('employeesCountInPackage')}</span>
                                  </div>
                                  <div className="text-xl font-black text-white">{pkg.employees_count ?? 0}</div>
                                </div>

                                {/* Target & Bonus - only for target type */}
                                {pkg.work_type === 'target' && (
                                  <>
                                    <div className="rounded-xl p-4 border transition-colors bg-white/10 border-white/20 backdrop-blur-sm">
                                      <div className="flex items-center gap-1.5 text-white/70 mb-1">
                                        <Target size={12} />
                                        <span className="text-[9px] font-black uppercase tracking-wider">{t('target')}</span>
                                      </div>
                                      <div className="text-xl font-black text-white">{pkg.monthly_target}</div>
                                    </div>
                                    <div className="rounded-xl p-4 border transition-colors bg-white/10 border-white/20 backdrop-blur-sm">
                                      <div className="flex items-center gap-1.5 text-white/70 mb-1">
                                        <Trophy size={12} />
                                        <span className="text-[9px] font-black uppercase tracking-wider">{t('bonus')}</span>
                                      </div>
                                      <div className="text-xl font-black text-white">{pkg.bonus_after_target}</div>
                                    </div>
                                  </>
                                )}

                                {/* Info note for salary/commission */}
                                {pkg.work_type !== 'target' && (
                                  <div className="rounded-xl p-3 border transition-colors flex items-center gap-2 bg-white/10 border-white/20">
                                    <Info size={14} className="text-white/80" />
                                    <span className="text-[10px] font-bold text-white/90">
                                      {pkg.work_type === 'salary' ? t('salaryPackageInfo') : t('commissionPackageInfo')}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons - Always 2x2 grid */}
                              <div className="pt-2 mt-auto space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                      setSelectedPackage(pkg);
                                      setIsAddEmployeesModalOpen(true);
                                    }}
                                    className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white py-3 rounded-xl text-xs font-black shadow-lg transition-all backdrop-blur-sm"
                                  >
                                    <UserPlus size={14} />
                                    <span>{t('addEmployees')}</span>
                                  </motion.button>
                                  <Link
                                    href={`/hr/packages/${pkg.id}`}
                                    className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white py-3 rounded-xl text-xs font-black shadow-lg transition-all backdrop-blur-sm"
                                  >
                                    <Eye size={14} />
                                    <span>{t('viewPackage')}</span>
                                  </Link>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => openEditModal(pkg)}
                                    className="flex items-center justify-center gap-2 bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-300/30 text-white py-3 rounded-xl text-xs font-black shadow-lg transition-all"
                                  >
                                    <Pencil size={14} />
                                    <span>{t('editPackage')}</span>
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleDelete(pkg)}
                                    className="flex items-center justify-center gap-2 bg-red-500/30 hover:bg-red-500/50 border border-red-300/30 text-white py-3 rounded-xl text-xs font-black shadow-lg transition-all"
                                  >
                                    <Trash2 size={14} />
                                    <span>{t('deletePackage')}</span>
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                    ))}
              </AnimatePresence>

              {filteredPackages.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center gap-4">
                  <div className="h-24 w-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Package size={48} className="text-white/20" />
                  </div>
                  <p className="text-lg font-black text-white/40">{t('noMatchingPackages')}</p>
                  <p className="text-sm font-bold text-white/30">{t('tryDifferentSearch')}</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(true)}
                    className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600 transition-all font-bold text-sm shadow-lg"
                  >
                    <Plus size={16} />
                    {t('createNewPackage')}
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Packages card footer */}
          <div className="px-6 py-4 border-t border-white/8 bg-slate-900/30 flex items-center justify-between text-xs font-bold text-white/40">
            <span>{t('totalPackagesFooter')}: {filteredPackages.length}</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Target size={13} className="text-blue-400" />
                {stats.targetType} {t('targetLabel')}
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign size={13} className="text-emerald-400" />
                {stats.salaryType} {t('salaryLabel')}
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={13} className="text-amber-400" />
                {stats.commissionType} {t('commissionLabel')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════ FOOTER ══════════════════ */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-between items-center gap-3 py-4 px-5 rounded-2xl bg-slate-800/50 border border-slate-700/30 text-[10px] font-black text-white/30 uppercase tracking-widest"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-purple-400" />
            <span>{t('systemManagement')}</span>
          </div>
          <span>{t('allRightsReserved')} © {new Date().getFullYear()}</span>
        </motion.div>

      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-md" 
              onClick={() => setIsModalOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-[95vw] h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/10"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <div className="relative z-10 bg-gradient-to-r from-purple-600 to-violet-600 p-6 text-white flex items-center justify-between shrink-0">
                  <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Package className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black">{t('createPackageAndEmployees')}</h3>
                      <p className="text-white/70 font-bold text-xs mt-0.5">{t('defineWorkSystemAndTeam')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="relative z-10 flex-1 overflow-auto p-6 scrollbar-hide">
                <form id="packageForm" onSubmit={handleSubmit} className="space-y-8">
                    <div className={cn(
                      "grid gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10",
                      formData.work_type === 'target' ? "grid-cols-1 md:grid-cols-4" : "grid-cols-1 md:grid-cols-2"
                    )}>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-white/50 flex items-center gap-1.5 uppercase tracking-wider">
                          <Package size={12} className="text-purple-400" />
                          {t('packageName')} <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.group_name}
                          onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                          placeholder={t('enterPackageName')}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder-white/20 focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-white/50 flex items-center gap-1.5 uppercase tracking-wider">
                          <Settings size={12} className="text-purple-400" />
                          {t('workSystem')} <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={formData.work_type}
                          onChange={(e) => {
                            const wt = e.target.value;
                            setFormData({ ...formData, work_type: wt, monthly_target: wt === 'target' ? formData.monthly_target : 0, bonus_after_target: wt === 'target' ? formData.bonus_after_target : 0 });
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-purple-500/40 outline-none transition-all"
                        >
                          <option value="target" className="bg-slate-800">{t('targetSystemOption')}</option>
                          <option value="salary" className="bg-slate-800">{t('salarySystemOption')}</option>
                          <option value="commission" className="bg-slate-800">{t('commissionSystemOption')}</option>
                        </select>
                      </div>

                      {formData.work_type === 'target' && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-white/50 flex items-center gap-1.5 uppercase tracking-wider">
                              <Target size={12} className="text-blue-400" />
                              {t('monthlyTarget')} <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="number"
                              value={formData.monthly_target}
                              onChange={(e) => setFormData({ ...formData, monthly_target: parseInt(e.target.value) || 0 })}
                              placeholder={t('enterMonthlyTarget')}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder-white/20 focus:border-blue-500/40 outline-none transition-all"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-white/50 flex items-center gap-1.5 uppercase tracking-wider">
                              <Trophy size={12} className="text-amber-400" />
                              {t('bonusAfterTarget')} <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="number"
                              value={formData.bonus_after_target}
                              onChange={(e) => setFormData({ ...formData, bonus_after_target: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-amber-500/40 outline-none transition-all"
                            />
                          </div>
                        </>
                      )}

                      {formData.work_type !== 'target' && (
                        <div className="md:col-span-2 flex items-center gap-3 bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                          <Info size={18} className="text-blue-400 shrink-0" />
                          <p className="text-xs font-bold text-blue-300">
                            {formData.work_type === 'salary' ? t('salaryPackageInfo') : t('commissionPackageInfo')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Premium Excel Import Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500"></div>
                      <div className="flex items-start gap-4 mb-5">
                        <div className="shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                          <FileSpreadsheet size={26} className="text-white" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="text-base font-black text-white">{t('excelImportTitle')}</h4>
                          <p className="text-xs font-bold text-white/50 leading-relaxed">{t('excelImportDesc')}</p>
                        </div>
                      </div>

                      <div className="bg-indigo-500/10 rounded-xl p-4 mb-5 border border-indigo-500/20">
                        <p className="text-xs font-black text-indigo-300 text-center tracking-wide">{t('excelImportSteps')}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => downloadTemplate(false)}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-black hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20"
                        >
                          <Download size={18} />
                          {t('downloadExcelTemplate')}
                        </motion.button>
                        <label className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-black hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer">
                          <Upload size={18} />
                          {t('uploadExcelFile')}
                          <input type="file" className="hidden" accept=".xlsx,.xls" onChange={(e) => handleFileUpload(e, false)} />
                        </label>
                      </div>

                      <div className="flex items-start gap-2.5 bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
                        <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-bold text-amber-300 leading-relaxed">{t('excelImportWarning')}</p>
                      </div>
                    </motion.div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black text-white flex items-center gap-2">
                          <Users size={20} className="text-purple-400" />
                          {t('employeesData')} ({formData.work_type === 'target' ? t('targetSystemLabel') : formData.work_type === 'salary' ? t('salarySystemLabel') : t('commissionSystemLabel')})
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-500/15 text-purple-300 border border-purple-500/20">
                            <Users size={14} />
                            {employees.filter(e => e.name.trim()).length || employees.length} {t('employeesCount')}
                          </span>
                        </h4>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => addEmployeeRow(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/15 text-purple-300 rounded-xl text-xs font-black hover:bg-purple-500/25 border border-purple-500/20 transition-all"
                      >
                        <Plus size={16} />
                        {t('addEmployee')}
                      </motion.button>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/50 shadow-sm">
                      <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
                          <thead className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
                            <tr>
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('employeeName')} <span className="text-red-300">*</span></th>
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('nameEn')}</th>
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('identityNumber')} <span className="text-red-300">*</span></th>
                              {formData.work_type === 'salary' ? (
                                <th className="p-4 text-xs font-black whitespace-nowrap">{t('jobTitle')}</th>
                              ) : (
                                <th className="p-4 text-xs font-black whitespace-nowrap">{t('userCode')}</th>
                              )}
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('nationality')} <span className="text-red-300">*</span></th>
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('phoneNumber')}</th>
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('email')}</th>
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('basicSalary')} <span className="text-red-300">*</span></th>
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('housingAllowance')}</th>
                              {formData.work_type !== 'salary' && (
                                <th className="p-4 text-xs font-black whitespace-nowrap">{t('vehiclePlate')}</th>
                              )}
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('iban')}</th>
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('actions')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {employees.map((emp, idx) => (
                              <tr key={idx} className="hover:bg-white/5 transition-colors border-b border-white/5">
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder={t('employeeName')}
                                  value={emp.name}
                                  onChange={(e) => updateEmployee(idx, "name", e.target.value, false)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder={t('nameEn')}
                                  value={emp.name_en}
                                  onChange={(e) => updateEmployee(idx, "name_en", e.target.value, false)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder={t('identityNumber')}
                                  value={emp.iqama_number}
                                  onChange={(e) => updateEmployee(idx, "iqama_number", e.target.value, false)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              {formData.work_type === 'salary' ? (
                                <td className="p-2">
                                  <input
                                    type="text"
                                    placeholder={t('jobTitle')}
                                    value={emp.job_title}
                                    onChange={(e) => updateEmployee(idx, "job_title", e.target.value, false)}
                                    className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                  />
                                </td>
                              ) : (
                                <td className="p-2">
                                  <input
                                    type="text"
                                    placeholder={t('userCode')}
                                    value={emp.user_code}
                                    onChange={(e) => updateEmployee(idx, "user_code", e.target.value, false)}
                                    className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                  />
                                </td>
                              )}
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder={t('nationality')}
                                  value={emp.nationality}
                                  onChange={(e) => updateEmployee(idx, "nationality", e.target.value, false)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="966XXXXXXXXX"
                                  value={emp.phone}
                                  onChange={(e) => updateEmployee(idx, "phone", e.target.value, false)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="email"
                                  placeholder="example@mail.com"
                                  value={emp.email}
                                  onChange={(e) => updateEmployee(idx, "email", e.target.value, false)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={emp.basic_salary}
                                  onChange={(e) => updateEmployee(idx, "basic_salary", parseFloat(e.target.value), false)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={emp.housing_allowance}
                                  onChange={(e) => updateEmployee(idx, "housing_allowance", parseFloat(e.target.value), false)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              {formData.work_type !== 'salary' && (
                                <td className="p-2">
                                  <input
                                    type="text"
                                    placeholder={t('vehiclePlate')}
                                    value={emp.vehicle_plate}
                                    onChange={(e) => updateEmployee(idx, "vehicle_plate", e.target.value, false)}
                                    className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                  />
                                </td>
                              )}
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="SA..."
                                  value={emp.iban}
                                  onChange={(e) => updateEmployee(idx, "iban", e.target.value, false)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              <td className="p-4">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  type="button"
                                  onClick={() => removeEmployeeRow(idx, false)}
                                  className="h-8 w-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/50 hover:text-white transition-all border border-red-500/20"
                                >
                                  <Trash2 size={14} />
                                </motion.button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>

                      {/* Fancy note about completing employee data */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-400"></div>
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Sparkles size={22} className="text-white" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-amber-300">{t('employeeDataNoteTitle')}</h4>
                            <p className="text-xs font-bold text-amber-400/70 leading-relaxed">{t('employeeDataNoteDesc')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-[10px] font-black text-amber-400/70 uppercase tracking-widest">
                          <span className="text-red-500">*</span> {t('requiredFieldsIndicator')}
                        </div>
                      </motion.div>
                    </div>
                  </form>
                </div>

                  <div className="relative z-10 p-6 bg-slate-900/80 border-t border-white/10 flex gap-4 shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      form="packageForm"
                    disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-black shadow-lg disabled:opacity-50 transition-all"
                      style={{ background: 'linear-gradient(to right, #10b981, #0d9488)', color: '#fff', boxShadow: '0 10px 15px -3px rgba(16,185,129,0.2)' }}
                    >
                      {isLoading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save size={20} />
                          <span>{t('savePackageAndEmployees')}</span>
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-8 py-4 rounded-2xl text-base font-black transition-all border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                  >
                    {t('cancel')}
                  </motion.button>
                </div>
            </motion.div>
          </div>
        )}

        {isAddEmployeesModalOpen && selectedPackage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-md" 
              onClick={() => setIsAddEmployeesModalOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-[95vw] h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/10"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <div className="relative z-10 bg-gradient-to-r from-purple-600 to-violet-600 p-6 text-white flex items-center justify-between shrink-0">
                  <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <UserPlus className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black">{t('addEmployeesToPackage')}: {selectedPackage.group_name}</h3>
                      <p className="text-white/70 font-bold text-xs mt-0.5">{t('workSystemLabel')}: {getWorkTypeShortLabel(selectedPackage.work_type)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAddEmployeesModalOpen(false)}
                    className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                  <div className="relative z-10 flex-1 overflow-auto p-6 scrollbar-hide">
                  <form id="addEmployeesForm" onSubmit={handleAddEmployeesSubmit} className="space-y-8">
                    {/* Premium Excel Import Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500"></div>
                      <div className="flex items-start gap-4 mb-5">
                        <div className="shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                          <FileSpreadsheet size={26} className="text-white" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="text-base font-black text-white">{t('excelImportTitle')}</h4>
                          <p className="text-xs font-bold text-white/50 leading-relaxed">{t('excelImportDesc')}</p>
                        </div>
                      </div>

                      <div className="bg-indigo-500/10 rounded-xl p-4 mb-5 border border-indigo-500/20">
                        <p className="text-xs font-black text-indigo-300 text-center tracking-wide">{t('excelImportSteps')}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => downloadTemplate(true)}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-black hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20"
                        >
                          <Download size={18} />
                          {t('downloadExcelTemplate')}
                        </motion.button>
                        <label className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-black hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer">
                          <Upload size={18} />
                          {t('uploadExcelFile')}
                          <input type="file" className="hidden" accept=".xlsx,.xls" onChange={(e) => handleFileUpload(e, true)} />
                        </label>
                      </div>

                      <div className="flex items-start gap-2.5 bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
                        <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-bold text-amber-300 leading-relaxed">{t('excelImportWarning')}</p>
                      </div>
                    </motion.div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black text-white flex items-center gap-2">
                          <Users size={20} className="text-purple-400" />
                          {t('addedEmployeesData')}
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-500/15 text-purple-300 border border-purple-500/20">
                            <Users size={14} />
                            {addEmployeesData.filter(e => e.name.trim()).length || addEmployeesData.length} {t('employeesCount')}
                          </span>
                        </h4>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => addEmployeeRow(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/15 text-purple-300 rounded-xl text-xs font-black hover:bg-purple-500/25 border border-purple-500/20 transition-all"
                      >
                        <Plus size={16} />
                        {t('addNewEmployee')}
                      </motion.button>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/50 shadow-sm">
                      <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
                          <thead className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
                            <tr>
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('employeeName')} <span className="text-red-300">*</span></th>
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('nameEn')}</th>
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('identityNumber')} <span className="text-red-300">*</span></th>
                              {selectedPackage.work_type === 'salary' ? (
                                <th className="p-4 text-xs font-black whitespace-nowrap">{t('jobTitle')}</th>
                              ) : (
                                <th className="p-4 text-xs font-black whitespace-nowrap">{t('userCode')}</th>
                              )}
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('nationality')} <span className="text-red-300">*</span></th>
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('phoneNumber')}</th>
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('email')}</th>
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('basicSalary')} <span className="text-red-300">*</span></th>
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('housingAllowance')}</th>
                              {selectedPackage.work_type !== 'salary' && (
                                <th className="p-4 text-xs font-black whitespace-nowrap">{t('vehiclePlate')}</th>
                              )}
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('iban')}</th>
                              <th className="p-4 text-xs font-black whitespace-nowrap">{t('actions')}</th>
                            </tr>
                          </thead>
                        <tbody className="divide-y divide-white/5">
                          {addEmployeesData.map((emp, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors border-b border-white/5">
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder={t('employeeName')}
                                  value={emp.name}
                                  onChange={(e) => updateEmployee(idx, "name", e.target.value, true)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder={t('nameEn')}
                                  value={emp.name_en}
                                  onChange={(e) => updateEmployee(idx, "name_en", e.target.value, true)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder={t('identityNumber')}
                                  value={emp.iqama_number}
                                  onChange={(e) => updateEmployee(idx, "iqama_number", e.target.value, true)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              {selectedPackage.work_type === 'salary' ? (
                                <td className="p-2">
                                  <input
                                    type="text"
                                    placeholder={t('jobTitle')}
                                    value={emp.job_title}
                                    onChange={(e) => updateEmployee(idx, "job_title", e.target.value, true)}
                                    className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                  />
                                </td>
                              ) : (
                                <td className="p-2">
                                  <input
                                    type="text"
                                    placeholder={t('userCode')}
                                    value={emp.user_code}
                                    onChange={(e) => updateEmployee(idx, "user_code", e.target.value, true)}
                                    className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                  />
                                </td>
                              )}
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder={t('nationality')}
                                  value={emp.nationality}
                                  onChange={(e) => updateEmployee(idx, "nationality", e.target.value, true)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="966XXXXXXXXX"
                                  value={emp.phone}
                                  onChange={(e) => updateEmployee(idx, "phone", e.target.value, true)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="email"
                                  placeholder="example@mail.com"
                                  value={emp.email}
                                  onChange={(e) => updateEmployee(idx, "email", e.target.value, true)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={emp.basic_salary}
                                  onChange={(e) => updateEmployee(idx, "basic_salary", parseFloat(e.target.value), true)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={emp.housing_allowance}
                                  onChange={(e) => updateEmployee(idx, "housing_allowance", parseFloat(e.target.value), true)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              {selectedPackage.work_type !== 'salary' && (
                                <td className="p-2">
                                  <input
                                    type="text"
                                    placeholder={t('vehiclePlate')}
                                    value={emp.vehicle_plate}
                                    onChange={(e) => updateEmployee(idx, "vehicle_plate", e.target.value, true)}
                                    className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                  />
                                </td>
                              )}
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="SA..."
                                  value={emp.iban}
                                  onChange={(e) => updateEmployee(idx, "iban", e.target.value, true)}
                                  className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/30 text-sm font-black text-white px-3 py-2 rounded-lg hover:bg-white/8 focus:border-purple-500/40 placeholder:text-white/20 placeholder:font-medium transition-all outline-none"
                                />
                              </td>
                              <td className="p-4">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  type="button"
                                  onClick={() => removeEmployeeRow(idx, true)}
                                  className="h-8 w-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/50 hover:text-white transition-all border border-red-500/20"
                                >
                                  <Trash2 size={14} />
                                </motion.button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>

                      {/* Fancy note about completing employee data */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-400"></div>
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Sparkles size={22} className="text-white" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-amber-300">{t('employeeDataNoteTitle')}</h4>
                            <p className="text-xs font-bold text-amber-400/70 leading-relaxed">{t('employeeDataNoteDesc')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-[10px] font-black text-amber-400/70 uppercase tracking-widest">
                          <span className="text-red-500">*</span> {t('requiredFieldsIndicator')}
                        </div>
                      </motion.div>
                    </div>
                  </form>
                </div>

                  <div className="relative z-10 p-6 bg-slate-900/80 border-t border-white/10 flex gap-4 shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      form="addEmployeesForm"
                    disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-black shadow-lg disabled:opacity-50 transition-all"
                      style={{ background: 'linear-gradient(to right, #10b981, #0d9488)', color: '#fff', boxShadow: '0 10px 15px -3px rgba(16,185,129,0.2)' }}
                    >
                      {isLoading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save size={20} />
                          <span>{t('addEmployeesToPackageBtn')}</span>
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => setIsAddEmployeesModalOpen(false)}
                      className="px-8 py-4 rounded-2xl text-base font-black transition-all border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                  >
                    {t('cancel')}
                  </motion.button>
                </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
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
                  className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.3)] overflow-hidden border border-red-500/20"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <div className="relative z-10 bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center overflow-hidden">
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
                    {t('confirmDeleteTitle')}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/80 font-bold mt-2 relative z-10"
                  >
                    {t('cannotUndo')}
                  </motion.p>
                </div>

                  <div className="relative z-10 p-8 text-center space-y-6">
                    <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/20">
                    <p className="text-white/80 font-bold text-lg leading-relaxed">
                      {t('confirmDeleteQuestion')}
                    </p>
                    <p className="text-red-400 font-black text-xl mt-2 truncate">
                      &quot;{deleteConfirmModal.item?.group_name}&quot;
                    </p>
                  </div>

                  <p className="text-white/50 font-bold text-sm">
                    {t('permanentDeleteWarning')}
                  </p>

                  <div className="flex gap-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDeleteConfirmModal({ isOpen: false, item: null })}
                      className="flex-1 flex items-center justify-center gap-3 bg-white/5 text-white/70 py-4 rounded-2xl font-black text-lg hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <X size={20} />
                      {t('cancel')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(239, 68, 68, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={confirmDelete}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-500/30 disabled:opacity-50 border-b-4 border-red-700/50"
                    >
                      {isLoading ? (
                        <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Trash2 size={20} />
                          {t('yesDelete')}
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
          {successModal.isOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSuccessModal({ isOpen: false, type: null, title: '' })}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className={cn(
                    "relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border",
                    successModal.type === 'delete'
                      ? "border-emerald-500/20 shadow-[0_0_100px_rgba(16,185,129,0.3)]"
                      : "border-blue-500/20 shadow-[0_0_100px_rgba(59,130,246,0.3)]"
                  )}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <div className={cn(
                    "relative z-10 p-10 text-white text-center overflow-hidden",
                  successModal.type === 'delete'
                    ? "bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700"
                    : "bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700"
                )}>
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
                    {successModal.type === 'delete' ? t('deletedSuccessfully') : t('createdSuccessfully')}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/80 font-bold mt-2 relative z-10"
                  >
                    {successModal.type === 'delete' ? t('removedFromSystem') : t('addedToSystem')}
                  </motion.p>
                </div>

                  <div className="relative z-10 p-8 text-center space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className={cn(
                        "rounded-2xl p-6 border",
                        successModal.type === 'delete'
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : "bg-blue-500/10 border-blue-500/20"
                      )}
                  >
                    <p className="text-white/50 font-bold text-sm mb-2">
                      {successModal.type === 'delete' ? t('deletedItem') : t('createdItem')}
                    </p>
                    <p className={cn(
                      "font-black text-xl truncate",
                      successModal.type === 'delete' ? "text-emerald-400" : "text-blue-400"
                    )}>
                      &quot;{successModal.title}&quot;
                    </p>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSuccessModal({ isOpen: false, type: null, title: '' })}
                    className={cn(
                      "w-full flex items-center justify-center gap-3 text-white py-5 rounded-2xl font-black text-xl shadow-xl border-b-4",
                      successModal.type === 'delete'
                        ? "bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 shadow-emerald-500/30 border-emerald-700/50"
                        : "bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-600 shadow-blue-500/30 border-blue-700/50"
                    )}
                  >
                    <CheckCircle2 size={24} />
                    {t('ok')}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
          {/* Edit Package Modal */}
          <AnimatePresence>
            {editModal.isOpen && editModal.pkg && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEditModal({ isOpen: false, pkg: null })}
                  className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 50 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] shadow-[0_0_100px_rgba(99,102,241,0.3)] overflow-hidden border border-indigo-500/20"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <div className="relative z-10 bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 p-8 text-white text-center overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: 80, opacity: 0 }}
                          animate={{ y: -80, opacity: [0, 0.5, 0], x: Math.random() * 60 - 30 }}
                          transition={{ delay: i * 0.3, duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                          className="absolute"
                          style={{ left: `${20 + i * 20}%` }}
                        >
                          <Sparkles size={16} className="text-white/30" />
                        </motion.div>
                      ))}
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", damping: 15 }}
                      className="relative z-10 mx-auto w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-4 shadow-2xl border-4 border-white/30"
                    >
                      <Pencil size={36} className="text-white drop-shadow-lg" />
                    </motion.div>
                    <h3 className="text-2xl font-black relative z-10">{t('editPackageTitle')}</h3>
                    <p className="text-white/70 font-bold text-sm mt-1 relative z-10">{t('editPackageDesc')}</p>
                  </div>

                    <form onSubmit={handleEditSubmit} className="relative z-10 p-8 space-y-5">
                    {/* Package number info */}
                    <div className="flex items-center gap-3 bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/20">
                      <Info size={18} className="text-indigo-400 shrink-0" />
                      <p className="text-xs font-bold text-indigo-300">{t('editPackageNote')} <span className="font-black">#{editModal.pkg.id}</span></p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-white/50 flex items-center gap-1.5 uppercase tracking-wider">
                        <Package size={12} className="text-indigo-400" />
                        {t('packageName')}
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.group_name}
                        onChange={(e) => setEditFormData({ ...editFormData, group_name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder-white/20 focus:border-indigo-500/40 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-white/50 flex items-center gap-1.5 uppercase tracking-wider">
                          <Settings size={12} className="text-indigo-400" />
                          {t('workSystem')}
                        </label>
                        <select
                          value={editFormData.work_type}
                          onChange={(e) => {
                            const wt = e.target.value;
                            setEditFormData({ ...editFormData, work_type: wt, monthly_target: wt === 'target' ? editFormData.monthly_target : 0, bonus_after_target: wt === 'target' ? editFormData.bonus_after_target : 0 });
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-indigo-500/40 outline-none transition-all"
                        >
                          <option value="target" className="bg-slate-800">{t('targetSystemOption')}</option>
                          <option value="salary" className="bg-slate-800">{t('salarySystemOption')}</option>
                          <option value="commission" className="bg-slate-800">{t('commissionSystemOption')}</option>
                        </select>
                      </div>

                      {editFormData.work_type === 'target' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-white/50 flex items-center gap-1.5 uppercase tracking-wider">
                              <Target size={12} className="text-blue-400" />
                              {t('monthlyTarget')} <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="number"
                              value={editFormData.monthly_target}
                              onChange={(e) => setEditFormData({ ...editFormData, monthly_target: parseInt(e.target.value) || 0 })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-blue-500/40 outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-white/50 flex items-center gap-1.5 uppercase tracking-wider">
                              <Trophy size={12} className="text-amber-400" />
                              {t('bonusAfterTarget')} <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="number"
                              value={editFormData.bonus_after_target}
                              onChange={(e) => setEditFormData({ ...editFormData, bonus_after_target: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-amber-500/40 outline-none transition-all"
                            />
                          </div>
                        </div>
                      )}

                      {editFormData.work_type !== 'target' && (
                        <div className="flex items-center gap-3 bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                          <Info size={18} className="text-blue-400 shrink-0" />
                          <p className="text-xs font-bold text-blue-300">
                            {editFormData.work_type === 'salary' ? t('salaryPackageInfo') : t('commissionPackageInfo')}
                          </p>
                        </div>
                      )}

                    <div className="flex gap-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setEditModal({ isOpen: false, pkg: null })}
                        className="flex-1 flex items-center justify-center gap-2 bg-white/5 text-white/60 py-4 rounded-2xl font-black text-base hover:bg-white/10 border border-white/10 transition-all"
                      >
                        <X size={18} />
                        {t('cancel')}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)" }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-600 to-violet-600 text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-indigo-500/30 disabled:opacity-50 border-b-4 border-indigo-700/50"
                      >
                        {isLoading ? (
                          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save size={18} />
                            {t('saveChanges')}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Excel Scan Modal */}
          <AnimatePresence>
            {excelScanModal.isOpen && (
              <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 50 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className={cn(
                      "relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border",
                      excelScanModal.phase === 'scanning'
                        ? "border-blue-500/20 shadow-[0_0_100px_rgba(59,130,246,0.3)]"
                        : excelScanModal.phase === 'found'
                        ? "border-purple-500/20 shadow-[0_0_100px_rgba(147,51,234,0.3)]"
                        : "border-emerald-500/20 shadow-[0_0_100px_rgba(16,185,129,0.3)]"
                    )}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {/* Header */}
                    <div className={cn(
                      "relative z-10 p-10 text-white text-center overflow-hidden transition-all duration-700",
                    excelScanModal.phase === 'scanning'
                      ? "bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700"
                      : excelScanModal.phase === 'found'
                      ? "bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700"
                      : "bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700"
                  )}>
                    {/* Animated background particles */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: 100, opacity: 0 }}
                          animate={{ 
                            y: -100, 
                            opacity: [0, 0.6, 0],
                            x: Math.random() * 80 - 40
                          }}
                          transition={{ 
                            delay: i * 0.15, 
                            duration: 2.5,
                            repeat: Infinity,
                            repeatDelay: 0.5
                          }}
                          className="absolute"
                          style={{ left: `${10 + i * 11}%` }}
                        >
                          <Sparkles size={16} className="text-white/30" />
                        </motion.div>
                      ))}
                    </div>

                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1, type: "spring", damping: 12 }}
                      className="relative z-10 mx-auto w-28 h-28 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                    >
                      {excelScanModal.phase === 'scanning' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        >
                          <ScanLine size={52} className="text-white drop-shadow-lg" />
                        </motion.div>
                      ) : excelScanModal.phase === 'found' ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.3, 1] }}
                          transition={{ duration: 0.5 }}
                        >
                          <FileSpreadsheet size={52} className="text-white drop-shadow-lg" />
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.2, 1] }}
                          transition={{ duration: 0.5 }}
                        >
                          <CheckCircle2 size={56} className="text-white drop-shadow-lg" />
                        </motion.div>
                      )}
                    </motion.div>
                    
                    {/* Title */}
                    <motion.h3
                      key={excelScanModal.phase}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-3xl font-black tracking-tight relative z-10"
                    >
                      {excelScanModal.phase === 'scanning' 
                        ? t('excelScanningTitle')
                        : excelScanModal.phase === 'found'
                        ? t('excelFoundTitle')
                        : t('excelDoneTitle')
                      }
                    </motion.h3>
                    <motion.p
                      key={`desc-${excelScanModal.phase}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-white/80 font-bold mt-2 relative z-10"
                    >
                      {excelScanModal.phase === 'scanning' 
                        ? t('excelScanningDesc')
                        : excelScanModal.phase === 'found'
                        ? t('excelFoundDesc').replace('{count}', String(excelScanModal.count))
                        : t('excelDoneDesc')
                      }
                    </motion.p>
                  </div>

                    {/* Body */}
                    <div className="relative z-10 p-8 space-y-6">
                    {/* Progress Steps */}
                    <div className="space-y-4">
                      {[
                        { key: 'reading', label: t('excelReading'), active: excelScanModal.phase === 'scanning', done: excelScanModal.phase !== 'scanning' },
                        { key: 'analyzing', label: t('excelAnalyzing'), active: excelScanModal.phase === 'scanning', done: excelScanModal.phase === 'found' || excelScanModal.phase === 'done' },
                        { key: 'mapping', label: t('excelMapping'), active: excelScanModal.phase === 'found', done: excelScanModal.phase === 'done' },
                      ].map((step, i) => (
                        <motion.div
                          key={step.key}
                          initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.2 }}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500",
                            step.done
                              ? "bg-emerald-500/10 border-emerald-500/20"
                              : step.active
                              ? "bg-blue-500/10 border-blue-500/20"
                              : "bg-white/5 border-white/10"
                          )}
                        >
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500",
                            step.done
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                              : step.active
                              ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                              : "bg-white/10 border border-white/10"
                          )}>
                            {step.done ? (
                              <CheckCircle2 size={20} className="text-white" />
                            ) : step.active ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                              >
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                              </motion.div>
                            ) : (
                              <div className="h-3 w-3 rounded-full bg-white/20" />
                            )}
                          </div>
                          <span className={cn(
                            "font-black text-sm transition-all duration-500",
                            step.done ? "text-emerald-300" : step.active ? "text-blue-300" : "text-white/30"
                          )}>
                            {step.label}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Employee count badge */}
                    {(excelScanModal.phase === 'found' || excelScanModal.phase === 'done') && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center"
                      >
                        <div className={cn(
                          "inline-flex items-center gap-3 px-8 py-4 rounded-2xl border",
                          excelScanModal.phase === 'done'
                            ? "bg-emerald-500/10 border-emerald-500/20"
                            : "bg-purple-500/10 border-purple-500/20"
                        )}>
                          <Users size={24} className={excelScanModal.phase === 'done' ? "text-emerald-400" : "text-purple-400"} />
                          <span className={cn(
                            "text-4xl font-black",
                            excelScanModal.phase === 'done' ? "text-emerald-300" : "text-purple-300"
                          )}>
                            {excelScanModal.count}
                          </span>
                          <span className={cn(
                            "text-sm font-black",
                            excelScanModal.phase === 'done' ? "text-emerald-400" : "text-purple-400"
                          )}>
                            {t('excelEmployeesFound')}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      );
    }
