"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Pencil,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddEmployeesModalOpen, setIsAddEmployeesModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    group_name: "",
    work_type: "target",
    monthly_target: 0,
    bonus_after_target: 10,
  });

  const [editFormData, setEditFormData] = useState({
    group_name: "",
    work_type: "target",
    monthly_target: 0,
    bonus_after_target: 10,
  });

  useEffect(() => {
    const type = searchParams.get('type');
    const create = searchParams.get('create');
    
    if (type === 'commission' && create === 'true') {
      setIsModalOpen(true);
      setFormData(prev => ({ ...prev, work_type: 'commission' }));
    }
  }, [searchParams]);

  const emptyEmployee = {
    name: "", iqama_number: "", identity_number: "", job_title: "",
    nationality: "", user_code: "", phone: "", email: "",
    basic_salary: 0, housing_allowance: 0, vehicle_plate: "", iban: ""
  };

  const [employees, setEmployees] = useState([{ ...emptyEmployee }]);
  const [addEmployeesData, setAddEmployeesData] = useState([{ ...emptyEmployee }]);

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
    if (isAddModal) {
      setAddEmployeesData([...addEmployeesData, { ...emptyEmployee }]);
    } else {
      setEmployees([...employees, { ...emptyEmployee }]);
    }
  };

  const removeEmployeeRow = (index: number, isAddModal = false) => {
    if (isAddModal) {
      if (addEmployeesData.length === 1) { toast.error(t('mustHaveOneEmployee')); return; }
      setAddEmployeesData(addEmployeesData.filter((_, i) => i !== index));
    } else {
      if (employees.length === 1) { toast.error(t('mustHaveOneEmployee')); return; }
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

  // ===== SUBMIT: Create package (instant state update) =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await createPackageWithEmployees({ 
        ...formData, company_id: companyId,
        employees: employees.filter(emp => emp.name.trim() !== "")
      });
      if (result.success) {
        toast.success(t('packageCreatedSuccess'));
        setIsModalOpen(false);
        setFormData({ group_name: "", work_type: "target", monthly_target: 0, bonus_after_target: 10 });
        setEmployees([{ ...emptyEmployee }]);
        router.refresh();
      } else {
        toast.error(result.error || t('errorOccurred'));
      }
    } catch {
      toast.error(t('unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  // ===== SUBMIT: Add employees to package =====
  const handleAddEmployeesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;
    setIsLoading(true);
    try {
      const employeesToSave = addEmployeesData
        .filter(emp => emp.name.trim() !== "")
        .map(emp => ({ ...emp, company_id: companyId }));
      if (employeesToSave.length === 0) {
        toast.error(t('enterOneEmployeeAtLeast'));
        setIsLoading(false);
        return;
      }
      const { saveEmployees } = await import("@/lib/actions/hr");
      const result = await saveEmployees(selectedPackage.id, employeesToSave);
      if (result.success) {
        toast.success(t('employeesAddedSuccess'));
        setIsAddEmployeesModalOpen(false);
        setAddEmployeesData([{ ...emptyEmployee }]);
        router.refresh();
      } else {
        toast.error(result.error || t('errorOccurred'));
      }
    } catch {
      toast.error(t('unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  // ===== DELETE: Instant state update =====
  const handleDelete = async (id: number) => {
    if (!confirm(t('confirmDeletePackage'))) return;
    try {
      const result = await deleteEmployeePackage(id);
      if (result.success) {
        toast.success(t('packageDeletedSuccess'));
        setPackages(prev => prev.filter(p => p.id !== id));
      } else {
        toast.error(result.error || t('errorOccurred'));
      }
    } catch {
      toast.error(t('unexpectedError'));
    }
  };

  // ===== EDIT: Open edit modal =====
  const openEditModal = (pkg: any) => {
    setEditingPackage(pkg);
    setEditFormData({
      group_name: pkg.group_name,
      work_type: pkg.work_type,
      monthly_target: pkg.monthly_target || 0,
      bonus_after_target: pkg.bonus_after_target || 10,
    });
    setIsEditModalOpen(true);
  };

  // ===== EDIT: Save changes =====
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    setIsLoading(true);
    try {
      const result = await updateEmployeePackage(editingPackage.id, editFormData);
      if (result.success) {
        toast.success(t('packageUpdatedSuccess'));
        setPackages(prev => prev.map(p => 
          p.id === editingPackage.id ? { ...p, ...editFormData } : p
        ));
        setIsEditModalOpen(false);
        setEditingPackage(null);
      } else {
        toast.error(result.error || t('errorOccurred'));
      }
    } catch {
      toast.error(t('unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  // ===== XLSX Template Download =====
  const downloadTemplate = (isAddModal = false) => {
    const workType = isAddModal ? selectedPackage?.work_type : formData.work_type;
    const isSalary = workType === 'salary';
    
    const wb = XLSX.utils.book_new();
    let headers: string[];
    let sampleRow: any[];
    
    if (isSalary) {
      headers = [t('employeeName'), t('identityNumber'), t('jobTitle'), t('nationality'), t('phoneNumber'), t('email'), t('basicSalary'), t('housingAllowance'), t('iban')];
      sampleRow = ["أحمد محمد", "1234567890", "محاسب", "سعودي", "0555555555", "ahmed@example.com", 5000, 1000, "SA0000000000000000000000"];
    } else {
      headers = [t('employeeName'), t('iqamaNumber'), t('nationality'), t('userCode'), t('phoneNumber'), t('email'), t('basicSalary'), t('housingAllowance'), t('vehiclePlate'), t('iban')];
      sampleRow = ["أحمد محمد", "1234567890", "سعودي", "EMP001", "0555555555", "ahmed@example.com", 3000, 1000, "ABC 1234", "SA0000000000000000000000"];
    }
    
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, `template_${workType}.xlsx`);
  };

  // ===== XLSX File Upload with toast notifications =====
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isAddModal = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls') {
      toast.error(t('fileFormatWarning'));
      e.target.value = '';
      return;
    }

    // Show loading toast
    const loadingToastId = toast.loading(
      <div className="flex items-center gap-3">
        <Loader2 className="animate-spin text-blue-500" size={20} />
        <div>
          <p className="font-bold text-sm">{t('excelScanningTitle')}</p>
          <p className="text-xs text-gray-500">{t('excelScanningDesc')}</p>
        </div>
      </div>
    );

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          toast.dismiss(loadingToastId);
          toast.error(t('excelParseError'));
          e.target.value = '';
          return;
        }

        const workType = isAddModal ? selectedPackage?.work_type : formData.work_type;
        const isSalary = workType === 'salary';
        const rows = jsonData.slice(1);
        
        const newEmployees = rows.map((row: any) => {
          const values = Array.isArray(row) ? row : Object.values(row);
          if (!values[0] || String(values[0]).trim() === '') return null;
          
          if (isSalary) {
            return {
              name: String(values[0] || '').trim(),
              identity_number: String(values[1] || '').trim(),
              job_title: String(values[2] || '').trim(),
              nationality: String(values[3] || '').trim(),
              phone: String(values[4] || '').trim(),
              email: String(values[5] || '').trim(),
              basic_salary: parseFloat(values[6]) || 0,
              housing_allowance: parseFloat(values[7]) || 0,
              iban: String(values[8] || '').trim(),
              iqama_number: "", user_code: "", vehicle_plate: ""
            };
          } else {
            return {
              name: String(values[0] || '').trim(),
              iqama_number: String(values[1] || '').trim(),
              nationality: String(values[2] || '').trim(),
              user_code: String(values[3] || '').trim(),
              phone: String(values[4] || '').trim(),
              email: String(values[5] || '').trim(),
              basic_salary: parseFloat(values[6]) || 0,
              housing_allowance: parseFloat(values[7]) || 0,
              vehicle_plate: String(values[8] || '').trim(),
              iban: String(values[9] || '').trim(),
              identity_number: "", job_title: ""
            };
          }
        }).filter(Boolean) as any[];

        toast.dismiss(loadingToastId);

        if (newEmployees.length > 0) {
          if (isAddModal) {
            setAddEmployeesData(newEmployees);
          } else {
            setEmployees(newEmployees);
          }
          toast.success(
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" size={20} />
              <div>
                <p className="font-bold text-sm">{t('excelDoneTitle')}</p>
                <p className="text-xs text-gray-500">{t('uploadSuccess').replace('{count}', newEmployees.length.toString())}</p>
              </div>
            </div>
          );
        } else {
          toast.error(t('excelParseError'));
        }
      } catch {
        toast.dismiss(loadingToastId);
        toast.error(t('excelParseError'));
      }
      e.target.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
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

  // ===== Excel Upload Section Component =====
  const ExcelUploadSection = ({ isAddModal = false }: { isAddModal?: boolean }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentEmployees = isAddModal ? addEmployeesData : employees;
    const employeeCount = currentEmployees.filter(emp => emp.name.trim() !== '').length;
    
    return (
      <div className="space-y-4">
        {/* Premium Excel Upload Box */}
        <div className="relative bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
          {/* Decorative top bar */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500" />
          
          <div className="p-6 space-y-5">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FileSpreadsheet className="text-white" size={22} />
              </div>
              <div>
                <h4 className="text-base font-black text-gray-900">{t('excelImportTitle')}</h4>
                <p className="text-xs font-bold text-gray-500">{t('excelImportDesc')}</p>
              </div>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { num: '١', label: t('step1Download'), icon: Download },
                { num: '٢', label: t('step2Fill'), icon: FileSpreadsheet },
                { num: '٣', label: t('step3Save'), icon: Save },
                { num: '٤', label: t('step4Upload'), icon: Upload },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/80 border border-gray-100">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-black">{step.num}</div>
                  <span className="text-[10px] font-bold text-gray-600 text-center">{step.label}</span>
                </div>
              ))}
            </div>

            {/* Warning Note */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-black text-amber-800">{t('xlsxFormatOnly')}</p>
                <p className="text-[11px] font-bold text-amber-700 mt-0.5">{t('xlsxOnlyNote')}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => downloadTemplate(isAddModal)}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-black hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20"
              >
                <Download size={18} />
                {t('downloadExcelTemplate')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-black hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Upload size={18} />
                {t('uploadExcelFile')}
              </motion.button>
              <input 
                ref={fileInputRef} 
                type="file" 
                className="hidden" 
                accept=".xlsx,.xls" 
                onChange={(e) => handleFileUpload(e, isAddModal)} 
              />
            </div>
          </div>
        </div>

        {/* Employee Count Badge */}
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-purple-500" />
            {isAddModal ? t('addedEmployeesData') : t('employeesData')}
            {!isAddModal && ` (${formData.work_type === 'target' ? t('targetSystemLabel') : formData.work_type === 'salary' ? t('salarySystemLabel') : t('commissionSystemLabel')})`}
          </h4>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-200 rounded-xl">
              <Users size={14} className="text-purple-600" />
              <span className="text-sm font-black text-purple-700">{employeeCount} {t('employeesCount')}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => addEmployeeRow(isAddModal)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-xl text-xs font-black hover:bg-purple-200 transition-all"
            >
              <Plus size={16} />
              {isAddModal ? t('addNewEmployee') : t('addEmployee')}
            </motion.button>
          </div>
        </div>
      </div>
    );
  };

  // ===== Employee Table Component =====
  const EmployeeTable = ({ data, isAddModal = false, workType }: { data: any[]; isAddModal?: boolean; workType: string }) => {
    const isSalary = workType === 'salary';
    return (
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
          <thead className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
            <tr>
              <th className="p-4 text-xs font-black whitespace-nowrap">{t('employeeName')}</th>
              {isSalary ? (
                <>
                  <th className="p-4 text-xs font-black whitespace-nowrap">{t('identityNumber')}</th>
                  <th className="p-4 text-xs font-black whitespace-nowrap">{t('jobTitle')}</th>
                </>
              ) : (
                <>
                  <th className="p-4 text-xs font-black whitespace-nowrap">{t('iqamaNumber')}</th>
                  <th className="p-4 text-xs font-black whitespace-nowrap">{t('userCode')}</th>
                </>
              )}
              <th className="p-4 text-xs font-black whitespace-nowrap">{t('nationality')}</th>
              <th className="p-4 text-xs font-black whitespace-nowrap">{t('phoneNumber')}</th>
              <th className="p-4 text-xs font-black whitespace-nowrap">{t('email')}</th>
              <th className="p-4 text-xs font-black whitespace-nowrap">{t('basicSalary')}</th>
              <th className="p-4 text-xs font-black whitespace-nowrap">{t('housingAllowance')}</th>
              {!isSalary && <th className="p-4 text-xs font-black whitespace-nowrap">{t('vehiclePlate')}</th>}
              <th className="p-4 text-xs font-black whitespace-nowrap">{t('iban')}</th>
              <th className="p-4 text-xs font-black whitespace-nowrap">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((emp, idx) => (
              <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                <td className="p-2">
                  <input type="text" placeholder={t('employeeName')} value={emp.name}
                    onChange={(e) => updateEmployee(idx, "name", e.target.value, isAddModal)}
                    className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50" />
                </td>
                {isSalary ? (
                  <>
                    <td className="p-2">
                      <input type="text" placeholder={t('identityNumber')} value={emp.identity_number}
                        onChange={(e) => updateEmployee(idx, "identity_number", e.target.value, isAddModal)}
                        className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50" />
                    </td>
                    <td className="p-2">
                      <input type="text" placeholder={t('jobTitle')} value={emp.job_title}
                        onChange={(e) => updateEmployee(idx, "job_title", e.target.value, isAddModal)}
                        className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50" />
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2">
                      <input type="text" placeholder={t('iqamaNumber')} value={emp.iqama_number}
                        onChange={(e) => updateEmployee(idx, "iqama_number", e.target.value, isAddModal)}
                        className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50" />
                    </td>
                    <td className="p-2">
                      <input type="text" placeholder={t('userCode')} value={emp.user_code}
                        onChange={(e) => updateEmployee(idx, "user_code", e.target.value, isAddModal)}
                        className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50" />
                    </td>
                  </>
                )}
                <td className="p-2">
                  <input type="text" placeholder={t('nationality')} value={emp.nationality}
                    onChange={(e) => updateEmployee(idx, "nationality", e.target.value, isAddModal)}
                    className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50" />
                </td>
                <td className="p-2">
                  <input type="text" placeholder="966XXXXXXXXX" value={emp.phone}
                    onChange={(e) => updateEmployee(idx, "phone", e.target.value, isAddModal)}
                    className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50" />
                </td>
                <td className="p-2">
                  <input type="email" placeholder="example@mail.com" value={emp.email}
                    onChange={(e) => updateEmployee(idx, "email", e.target.value, isAddModal)}
                    className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50" />
                </td>
                <td className="p-2">
                  <input type="number" placeholder="0.00" value={emp.basic_salary}
                    onChange={(e) => updateEmployee(idx, "basic_salary", parseFloat(e.target.value), isAddModal)}
                    className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50" />
                </td>
                <td className="p-2">
                  <input type="number" placeholder="0.00" value={emp.housing_allowance}
                    onChange={(e) => updateEmployee(idx, "housing_allowance", parseFloat(e.target.value), isAddModal)}
                    className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50" />
                </td>
                {!isSalary && (
                  <td className="p-2">
                    <input type="text" placeholder={t('vehiclePlate')} value={emp.vehicle_plate}
                      onChange={(e) => updateEmployee(idx, "vehicle_plate", e.target.value, isAddModal)}
                      className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50" />
                  </td>
                )}
                <td className="p-2">
                  <input type="text" placeholder="SA..." value={emp.iban}
                    onChange={(e) => updateEmployee(idx, "iban", e.target.value, isAddModal)}
                    className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50" />
                </td>
                <td className="p-4">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    type="button" onClick={() => removeEmployeeRow(idx, isAddModal)}
                    className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                    <Trash2 size={14} />
                  </motion.button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen pb-20">
      <motion.div 
        variants={containerVariants} initial="hidden" animate="visible"
        className="w-full px-2 pt-6"
      >
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
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
                    <span className="text-purple-300">{t('packagesManagement')}</span>
                  </div>
                  <h1 className="text-xl font-black text-white">{t('title')}</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                  <span className="text-xs font-black text-white/80">{packages.length} {t('packagesCount')}</span>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600 transition-all font-black text-sm shadow-lg">
                  <Plus size={18} />
                  {t('createNewPackage')}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 border-b border-white/10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Package, label: t('totalPackages'), value: stats.total, sub: t('allWorkGroups'), badge: t('total'), delay: 0.2 },
                { icon: Target, label: t('targetSystem'), value: stats.targetType, sub: t('targetPackages'), badge: t('targetLabel'), delay: 0.3 },
                { icon: DollarSign, label: t('salarySystem'), value: stats.salaryType, sub: t('salaryPackages'), badge: t('salaryLabel'), delay: 0.4 },
                { icon: Zap, label: t('commissionSystem'), value: stats.commissionType, sub: t('commissionPackages'), badge: t('commissionLabel'), delay: 0.5 },
              ].map((stat, i) => (
                <div key={i} className="relative overflow-hidden rounded-xl bg-white/10 p-5">
                  <div className="flex items-start justify-between">
                    <div className="text-white/90"><stat.icon size={22} /></div>
                    <span className="text-[10px] font-black text-white/70 bg-white/10 px-2 py-0.5 rounded-full">{stat.badge}</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">{stat.label}</p>
                    <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: stat.delay, type: "spring" }}
                      className="text-3xl font-black text-white mt-1">{stat.value}</motion.p>
                    <p className="text-white/60 text-[10px] font-bold mt-1">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search + Filter */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Package className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-black">{t('packagesList')}</h3>
                  <p className="text-slate-400 text-xs font-bold">{filteredPackages.length} {t('packagesInList')}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 sm:min-w-[300px]">
                  <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRTL ? "right-4" : "left-4")} size={18} />
                  <input type="text" placeholder={t('searchByPackageName')}
                    className={cn("w-full py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:bg-white/20 transition-all", isRTL ? "pr-12 pl-4" : "pl-12 pr-4")}
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all font-bold text-xs border border-white/10">
                  <Filter size={16} />
                  {t('filter')}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Package Cards */}
          <div className="p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                {filteredPackages.map((pkg, index) => (
                  <motion.div key={pkg.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.05 }}
                    className={cn(
                      "group rounded-2xl border p-6 hover:shadow-xl transition-all duration-500 relative overflow-hidden",
                      pkg.work_type === 'target' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400'
                        : pkg.work_type === 'salary' ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:border-emerald-400'
                        : 'bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200 hover:border-orange-400'
                    )}>
                    {/* Counter Badge */}
                    <div className={cn(
                      "absolute top-4 z-10 h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-md",
                      pkg.work_type === 'target' ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        : pkg.work_type === 'salary' ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                        : 'bg-gradient-to-br from-amber-500 to-orange-600',
                      isRTL ? "right-4" : "left-4"
                    )}>{index + 1}</div>
                    
                    {/* Action buttons (edit + delete) */}
                    <div className={cn("absolute top-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity", isRTL ? "left-0" : "right-0")}>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => openEditModal(pkg)}
                        className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        <Pencil size={14} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(pkg.id)}
                        className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm">
                        <Trash2 size={14} />
                      </motion.button>
                    </div>

                    <div className="space-y-5">
                      <div className="flex flex-col items-center gap-3">
                        <div className={cn(
                          "h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-md transition-all",
                          pkg.work_type === 'target' ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                            : pkg.work_type === 'salary' ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                            : 'bg-gradient-to-br from-amber-500 to-orange-600'
                        )}>
                          <Package size={28} />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 text-center line-clamp-2">{pkg.group_name}</h3>
                      </div>

                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                          pkg.work_type === 'target' ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                            : pkg.work_type === 'salary' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                            : 'bg-amber-100 text-orange-700 border border-amber-300'
                        }`}>
                          {pkg.work_type === 'target' && <Target size={12} />}
                          {pkg.work_type === 'salary' && <DollarSign size={12} />}
                          {pkg.work_type === 'commission' && <Zap size={12} />}
                          {getWorkTypeLabel(pkg.work_type)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className={cn("rounded-xl p-4 border transition-colors",
                          pkg.work_type === 'target' ? 'bg-blue-100/50 border-blue-300'
                            : pkg.work_type === 'salary' ? 'bg-emerald-100/50 border-emerald-300'
                            : 'bg-amber-100/50 border-amber-300'
                        )}>
                          <div className="flex items-center gap-1.5 text-gray-600 mb-1">
                            <Target size={12} />
                            <span className="text-[9px] font-black uppercase tracking-wider">{t('target')}</span>
                          </div>
                          <div className={cn("text-xl font-black",
                            pkg.work_type === 'target' ? 'text-blue-700'
                              : pkg.work_type === 'salary' ? 'text-emerald-700' : 'text-orange-700'
                          )}>{pkg.monthly_target}</div>
                        </div>
                        <div className={cn("rounded-xl p-4 border transition-colors",
                          pkg.work_type === 'target' ? 'bg-blue-100/50 border-blue-300'
                            : pkg.work_type === 'salary' ? 'bg-emerald-100/50 border-emerald-300'
                            : 'bg-amber-100/50 border-amber-300'
                        )}>
                          <div className="flex items-center gap-1.5 text-gray-600 mb-1">
                            <Trophy size={12} />
                            <span className="text-[9px] font-black uppercase tracking-wider">{t('bonus')}</span>
                          </div>
                          <div className={cn("text-xl font-black",
                            pkg.work_type === 'target' ? 'text-blue-700'
                              : pkg.work_type === 'salary' ? 'text-emerald-700' : 'text-orange-700'
                          )}>{pkg.bonus_after_target}</div>
                        </div>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => { setSelectedPackage(pkg); setIsAddEmployeesModalOpen(true); }}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3.5 rounded-xl text-xs font-black shadow-lg shadow-purple-500/20 hover:from-purple-700 hover:to-violet-700 transition-all">
                          <UserPlus size={16} />
                          <span>{t('addEmployees')}</span>
                        </motion.button>
                        <Link href={`/hr/packages/${pkg.id}`}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3.5 rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-cyan-700 transition-all">
                          <Eye size={16} />
                          <span>{t('viewPackage')}</span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredPackages.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center gap-4">
                  <div className="h-24 w-24 rounded-3xl bg-gray-100 flex items-center justify-center">
                    <Package size={48} className="text-gray-300" />
                  </div>
                  <p className="text-lg font-black text-gray-400">{t('noMatchingPackages')}</p>
                  <p className="text-sm font-bold text-gray-300">{t('tryDifferentSearch')}</p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(true)}
                    className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all font-bold text-sm">
                    <Plus size={16} />
                    {t('createNewPackage')}
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-600 px-6 py-4">
            <div className="flex items-center justify-between text-xs font-bold text-white/70">
              <span>{t('totalPackagesFooter')}: {filteredPackages.length}</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><Target size={14} className="text-blue-300" /> {stats.targetType} {t('targetLabel')}</span>
                <span className="flex items-center gap-1"><DollarSign size={14} className="text-emerald-300" /> {stats.salaryType} {t('salaryLabel')}</span>
                <span className="flex items-center gap-1"><Zap size={14} className="text-amber-300" /> {stats.commissionType} {t('commissionLabel')}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-purple-500" />
            <span>{t('systemManagement')}</span>
          </div>
          <span>{t('allRightsReserved')} &copy; {new Date().getFullYear()}</span>
        </div>
      </motion.div>

      {/* ===== CREATE PACKAGE MODAL ===== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[95vw] h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-6 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Package className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{t('createPackageAndEmployees')}</h3>
                    <p className="text-white/70 font-bold text-xs mt-0.5">{t('defineWorkSystemAndTeam')}</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)}
                  className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 scrollbar-hide">
                <form id="packageForm" onSubmit={handleSubmit} className="space-y-8">
                  {/* Package Info */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                        <Package size={12} className="text-purple-500" /> {t('packageName')}
                      </label>
                      <input type="text" required value={formData.group_name}
                        onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                        placeholder={t('enterPackageName')}
                        className="w-full bg-white border-2 border-purple-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-700 focus:border-purple-400 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                        <Target size={12} className="text-purple-500" /> {t('monthlyTarget')}
                      </label>
                      <input type="number" disabled={formData.work_type === 'salary' || formData.work_type === 'commission'}
                        value={formData.monthly_target}
                        onChange={(e) => setFormData({ ...formData, monthly_target: parseInt(e.target.value) })}
                        placeholder={t('enterMonthlyTarget')}
                        className="w-full bg-white border-2 border-purple-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-700 focus:border-purple-400 outline-none transition-all disabled:opacity-50 disabled:bg-gray-50" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                        <Trophy size={12} className="text-purple-500" /> {t('bonusAfterTarget')}
                      </label>
                      <input type="number" disabled={formData.work_type === 'salary' || formData.work_type === 'commission'}
                        value={formData.bonus_after_target}
                        onChange={(e) => setFormData({ ...formData, bonus_after_target: parseFloat(e.target.value) })}
                        className="w-full bg-white border-2 border-purple-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-700 focus:border-purple-400 outline-none transition-all disabled:opacity-50 disabled:bg-gray-50" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                        <Settings size={12} className="text-purple-500" /> {t('workSystem')}
                      </label>
                      <select value={formData.work_type}
                        onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                        className="w-full bg-white border-2 border-purple-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-700 focus:border-purple-400 outline-none transition-all">
                        <option value="target">{t('targetSystemOption')}</option>
                        <option value="salary">{t('salarySystemOption')}</option>
                        <option value="commission">{t('commissionSystemOption')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Excel Upload Section */}
                  <ExcelUploadSection isAddModal={false} />

                  {/* Employee Table */}
                  <EmployeeTable data={employees} isAddModal={false} workType={formData.work_type} />
                </form>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4 shrink-0">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  type="submit" form="packageForm" disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl text-base font-black shadow-lg shadow-emerald-500/20 disabled:opacity-50 hover:from-emerald-600 hover:to-teal-700 transition-all">
                  {isLoading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                    <><Save size={20} /><span>{t('savePackageAndEmployees')}</span></>
                  )}
                </motion.button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-8 bg-white border-2 border-gray-200 text-gray-500 py-4 rounded-2xl text-base font-black hover:bg-gray-50 hover:border-gray-300 transition-all">
                  {t('cancel')}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ===== ADD EMPLOYEES MODAL ===== */}
        {isAddEmployeesModalOpen && selectedPackage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setIsAddEmployeesModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[95vw] h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-6 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <UserPlus className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{t('addEmployeesToPackage')}: {selectedPackage.group_name}</h3>
                    <p className="text-white/70 font-bold text-xs mt-0.5">{t('workSystemLabel')}: {getWorkTypeShortLabel(selectedPackage.work_type)}</p>
                  </div>
                </div>
                <button onClick={() => setIsAddEmployeesModalOpen(false)}
                  className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 scrollbar-hide">
                <form id="addEmployeesForm" onSubmit={handleAddEmployeesSubmit} className="space-y-8">
                  <ExcelUploadSection isAddModal={true} />
                  <EmployeeTable data={addEmployeesData} isAddModal={true} workType={selectedPackage.work_type} />
                </form>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4 shrink-0">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  type="submit" form="addEmployeesForm" disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl text-base font-black shadow-lg shadow-emerald-500/20 disabled:opacity-50 hover:from-emerald-600 hover:to-teal-700 transition-all">
                  {isLoading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                    <><Save size={20} /><span>{t('addEmployeesToPackageBtn')}</span></>
                  )}
                </motion.button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  type="button" onClick={() => setIsAddEmployeesModalOpen(false)}
                  className="px-8 bg-white border-2 border-gray-200 text-gray-500 py-4 rounded-2xl text-base font-black hover:bg-gray-50 hover:border-gray-300 transition-all">
                  {t('cancel')}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ===== EDIT PACKAGE MODAL ===== */}
        {isEditModalOpen && editingPackage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
              dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Pencil className="text-white" size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">{t('editPackageTitle')}</h3>
                    <p className="text-white/70 font-bold text-xs mt-0.5">{t('editPackageDesc')}</p>
                  </div>
                </div>
                <button onClick={() => setIsEditModalOpen(false)}
                  className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                    <Package size={12} className="text-blue-500" /> {t('packageName')}
                  </label>
                  <input type="text" required value={editFormData.group_name}
                    onChange={(e) => setEditFormData({ ...editFormData, group_name: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-gray-700 focus:border-blue-400 outline-none transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                    <Settings size={12} className="text-blue-500" /> {t('workSystem')}
                  </label>
                  <select value={editFormData.work_type}
                    onChange={(e) => setEditFormData({ ...editFormData, work_type: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-gray-700 focus:border-blue-400 outline-none transition-all">
                    <option value="target">{t('targetSystemOption')}</option>
                    <option value="salary">{t('salarySystemOption')}</option>
                    <option value="commission">{t('commissionSystemOption')}</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                      <Target size={12} className="text-blue-500" /> {t('monthlyTarget')}
                    </label>
                    <input type="number" value={editFormData.monthly_target}
                      disabled={editFormData.work_type === 'salary' || editFormData.work_type === 'commission'}
                      onChange={(e) => setEditFormData({ ...editFormData, monthly_target: parseInt(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-gray-700 focus:border-blue-400 outline-none transition-all disabled:opacity-50 disabled:bg-gray-100" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                      <Trophy size={12} className="text-blue-500" /> {t('bonusAfterTarget')}
                    </label>
                    <input type="number" value={editFormData.bonus_after_target}
                      disabled={editFormData.work_type === 'salary' || editFormData.work_type === 'commission'}
                      onChange={(e) => setEditFormData({ ...editFormData, bonus_after_target: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-gray-700 focus:border-blue-400 outline-none transition-all disabled:opacity-50 disabled:bg-gray-100" />
                  </div>
                </div>

                {/* Info note about employees preserved */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs font-bold text-blue-700">
                    {isRTL ? 'سيتم الحفاظ على جميع الموظفين المرتبطين بالباقة ورقم الباقة بدون تغيير' : 'All employees linked to this package and the package number will be preserved'}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    type="submit" disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3.5 rounded-xl text-sm font-black shadow-lg shadow-blue-500/20 disabled:opacity-50 hover:from-blue-600 hover:to-indigo-700 transition-all">
                    {isLoading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                      <><Save size={18} /><span>{t('saveChanges')}</span></>
                    )}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    type="button" onClick={() => setIsEditModalOpen(false)}
                    className="px-6 bg-white border-2 border-gray-200 text-gray-500 py-3.5 rounded-xl text-sm font-black hover:bg-gray-50 hover:border-gray-300 transition-all">
                    {t('cancel')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
