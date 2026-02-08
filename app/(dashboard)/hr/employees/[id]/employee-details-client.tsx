"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  CreditCard, 
  FileText, 
  AlertOctagon, 
  Mail, 
  BarChart3, 
  Save, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Briefcase,
  Globe,
  Phone,
  Hash,
  Car,
  Calendar,
  Building,
  University,
  ArrowRight,
  IdCard,
  PlusCircle,
  Info,
  Edit3,
  Eye,
  Download,
  Umbrella,
  CheckCircle2,
  ShieldCheck,
  CalendarDays,
  Timer,
  Users,
  Search,
  Check,
  Trash,
  Trash2,
  Sparkles,
  AlertTriangle,
  Upload,
  Plus,
  FilePlus,
  XCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays, parseISO } from "date-fns";
import { toast } from "sonner";
import { 
  updateEmployeePersonalInfo, 
  updateEmployeeBankInfo, 
  toggleEmployeeStatus,
  addViolation,
  addLetter,
  updateIqamaExpiry,
  deleteViolation,
  updateViolation,
  deleteLetter,
  updateLetter,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
  setPrimaryBankAccount,
  updateEmployeeDocument,
  addCustomDocumentType,
  deleteCustomDocumentType,
  upsertEmployeeCustomDocument,
  deleteEmployeeCustomDocument
} from "@/lib/actions/hr";
import Link from "next/link";
import { useRouter } from "next/navigation";

type EmployeeDetailsClientProps = {
  employee: any;
  allEmployees: any[];
  violations: any[];
  letters: any[];
  stats: any;
  monthlyData: any[];
  bankAccounts: any[];
  customDocTypes: any[];
  customDocuments: any[];
};

function getPublicUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  if (path.includes('supabase')) return path;
  if (path.startsWith('employees/')) {
    const sPath = path.replace('employees/', '');
    return `https://xaexoopjqkrzhbochbef.supabase.co/storage/v1/object/public/employees/${sPath}`;
  }
  return `${process.env.NEXT_PUBLIC_APP_URL}/${cleanPath}`;
}

export function EmployeeDetailsClient({ 
  employee, 
  allEmployees, 
  violations, 
  letters, 
  stats, 
  monthlyData,
  bankAccounts,
  customDocTypes: initialDocTypes,
  customDocuments: initialCustomDocs
}: EmployeeDetailsClientProps) {
  const tabConfig: Record<string, any> = {
    general: { icon: User, label: "البيانات الشخصية", bg: "from-blue-600 to-indigo-600", color: "blue", light: "bg-blue-500/10", text: "text-blue-400", glow: "shadow-blue-500/20" },
    bank: { icon: University, label: "البيانات البنكية", bg: "from-emerald-600 to-teal-600", color: "emerald", light: "bg-emerald-500/10", text: "text-emerald-400", glow: "shadow-emerald-500/20" },
    status: { icon: ShieldCheck, label: "حالة الهوية", bg: "from-purple-600 to-violet-600", color: "purple", light: "bg-purple-500/10", text: "text-purple-400", glow: "shadow-purple-500/20" },
    documents: { icon: FileText, label: "المستندات والملفات", bg: "from-indigo-600 to-blue-600", color: "indigo", light: "bg-indigo-500/10", text: "text-indigo-400", glow: "shadow-indigo-500/20" },
    violations: { icon: AlertOctagon, label: "المخالفات المرورية", bg: "from-red-600 to-rose-600", color: "red", light: "bg-red-500/10", text: "text-red-400", glow: "shadow-red-500/20" },
    stats: { icon: BarChart3, label: "الإحصائيات والأداء", bg: "from-slate-700 to-slate-800", color: "slate", light: "bg-slate-500/10", text: "text-slate-400", glow: "shadow-slate-500/20" },
    letters: { icon: Mail, label: "الخطابات والإجازات", bg: "from-rose-600 to-pink-600", color: "rose", light: "bg-rose-500/10", text: "text-rose-400", glow: "shadow-rose-500/20" },
  };

  const [activeTab, setActiveTab] = useState("general");
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showViolationForm, setShowViolationForm] = useState(false);
  const [showLetterForm, setShowLetterForm] = useState(false);
  const [customDocTypes, setCustomDocTypes] = useState(initialDocTypes);
  const [customDocuments, setCustomDocuments] = useState(initialCustomDocs);
  const [newDocTypeName, setNewDocTypeName] = useState("");
  const [showAddDocType, setShowAddDocType] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
    const router = useRouter();

    // Premium Modal System
    type ModalState = 
      | { type: 'idle' }
      | { type: 'delete-confirm'; title: string; description?: string; onConfirm: () => Promise<void> }
      | { type: 'processing'; title: string; description?: string }
      | { type: 'success'; variant: 'delete' | 'update' | 'create' | 'upload' | 'download' | 'vacation' | 'iqama'; title: string; details?: string[] }
      | { type: 'error'; title: string; message: string };
    const [modal, setModal] = useState<ModalState>({ type: 'idle' });
    const [modalLoading, setModalLoading] = useState(false);

  const currentIndex = allEmployees.findIndex(emp => emp.id === employee.id);
  const prevEmployee = currentIndex > 0 ? allEmployees[currentIndex - 1] : null;
  const nextEmployee = currentIndex < allEmployees.length - 1 ? allEmployees[currentIndex + 1] : null;

  const filteredEmployees = useMemo(() => {
    return allEmployees.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.iqama_number?.includes(searchTerm)
    );
  }, [allEmployees, searchTerm]);

  const [personalInfo, setPersonalInfo] = useState({
    iqama_number: employee.iqama_number || "",
    name_en: employee.name_en || "",
    job_title: employee.job_title || "",
    user_code: employee.user_code || "",
    nationality: employee.nationality || "",
    phone: employee.phone || "",
    email: employee.email || "",
    vehicle_plate: employee.vehicle_plate || "",
    birth_date: employee.birth_date ? (() => {
      const d = new Date(employee.birth_date);
      return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : "";
    })() : "",
    passport_number: employee.passport_number || "",
    operation_card_number: employee.operation_card_number || "",
    basic_salary: employee.basic_salary || "",
    housing_allowance: employee.housing_allowance || ""
  });

  const [bankInfo, setBankInfo] = useState({
    bank_account: employee.bank_account || "",
    iban: employee.iban || "",
    bank_name: employee.bank_name || ""
  });

  const [newViolation, setNewViolation] = useState({
    violation_type: "traffic",
    violation_date: format(new Date(), "yyyy-MM-dd"),
    violation_amount: 0,
    deducted_amount: 0,
    status: "pending",
    violation_description: ""
  });

  const [newLetter, setNewLetter] = useState({
    letter_type: "annual_leave",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(new Date(), "yyyy-MM-dd"),
    duration_days: 0,
    violation_amount: 0,
    letter_details: ""
  });

  const [newExpiryDate, setNewExpiryDate] = useState(employee.iqama_expiry || "");
  const [editingViolation, setEditingViolation] = useState<any>(null);
  const [editingLetter, setEditingLetter] = useState<any>(null);
  const [showBankForm, setShowBankForm] = useState(false);
  const [editingBank, setEditingBank] = useState<any>(null);
  const [newBankAccount, setNewBankAccount] = useState({
    bank_name: "",
    account_number: "",
    iban: "",
    is_primary: false
  });

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-100px)] w-full px-2 animate-pulse gap-5">
        <div className="w-80 bg-muted/50 rounded-3xl shrink-0 backdrop-blur-xl" />
        <div className="flex-1 bg-muted/50 rounded-3xl backdrop-blur-xl" />
      </div>
    );
  }

    const handleUpdatePersonal = async (e: React.FormEvent) => {
      e.preventDefault();
      setModal({ type: 'processing', title: 'جاري حفظ البيانات الشخصية...', description: 'يرجى الانتظار' });
      const result = await updateEmployeePersonalInfo(employee.id, personalInfo);
      if (result.success) {
        setModal({ type: 'success', variant: 'update', title: 'تم تحديث البيانات الشخصية', details: [
          `الموظف: ${employee.name}`,
          `رقم الهوية: ${personalInfo.iqama_number}`,
          `المسمى الوظيفي: ${personalInfo.job_title}`
        ]});
        setIsEditing(false);
        router.refresh();
      } else {
        setModal({ type: 'error', title: 'فشل تحديث البيانات', message: result.error || 'حدث خطأ غير متوقع' });
      }
    };

    const handleUpdateBank = async (e: React.FormEvent) => {
      e.preventDefault();
      setModal({ type: 'processing', title: 'جاري حفظ البيانات البنكية...', description: 'يرجى الانتظار' });
      const result = await updateEmployeeBankInfo(employee.id, bankInfo);
      if (result.success) {
        setModal({ type: 'success', variant: 'update', title: 'تم تحديث البيانات البنكية', details: [
          `الموظف: ${employee.name}`,
          `البنك: ${bankInfo.bank_name}`,
          `الآيبان: ${bankInfo.iban}`
        ]});
        setIsEditing(false);
        router.refresh();
      } else {
        setModal({ type: 'error', title: 'فشل تحديث البيانات البنكية', message: result.error || 'حدث خطأ غير متوقع' });
      }
    };

    const handleToggleStatus = async () => {
      const isActive = employee.is_active === 1;
      setModal({ type: 'processing', title: isActive ? 'جاري تعيين الإجازة...' : 'جاري تفعيل الموظف...', description: employee.name });
      const result = await toggleEmployeeStatus(employee.id, employee.is_active);
      if (result.success) {
        setModal({ type: 'success', variant: 'vacation', title: isActive ? 'تم تعيين الموظف في إجازة' : 'تم تفعيل الموظف', details: [
          `الموظف: ${employee.name}`,
          `الحالة الجديدة: ${isActive ? 'في إجازة' : 'نشط'}`,
          `رقم الهوية: ${employee.iqama_number || '---'}`
        ]});
        router.refresh();
      } else {
        setModal({ type: 'error', title: 'فشل تغيير الحالة', message: 'حدث خطأ أثناء تغيير حالة الموظف' });
      }
    };

    const handleAddViolation = async (e: React.FormEvent) => {
      e.preventDefault();
      setModal({ type: 'processing', title: 'جاري إضافة المخالفة...', description: 'يرجى الانتظار' });
      const result = await addViolation({ employee_id: employee.id, ...newViolation });
      if (result.success) {
        setModal({ type: 'success', variant: 'create', title: 'تم إضافة المخالفة بنجاح', details: [
          `الموظف: ${employee.name}`,
          `النوع: ${newViolation.violation_type === 'traffic' ? 'مرورية' : 'عامة'}`,
          `المبلغ: ${newViolation.violation_amount} ر.س`,
          `المخصوم: ${newViolation.deducted_amount} ر.س`,
          newViolation.violation_description ? `الوصف: ${newViolation.violation_description}` : ''
        ].filter(Boolean)});
        setNewViolation({ violation_type: "traffic", violation_date: format(new Date(), "yyyy-MM-dd"), violation_amount: 0, deducted_amount: 0, status: "pending", violation_description: "" });
        setShowViolationForm(false);
        router.refresh();
      } else {
        setModal({ type: 'error', title: 'فشل إضافة المخالفة', message: result.error || 'حدث خطأ غير متوقع' });
      }
    };

    const handleDeleteViolation = async (id: number) => {
      const violation = violations.find(v => v.id === id);
      setModal({
        type: 'delete-confirm',
        title: `المخالفة - ${violation?.violation_type === 'traffic' ? 'مرورية' : 'عامة'}`,
        description: `المبلغ: ${Number(violation?.violation_amount).toLocaleString()} ر.س`,
        onConfirm: async () => {
          setModal({ type: 'processing', title: 'جاري حذف المخالفة...' });
          const result = await deleteViolation(id, employee.id);
          if (result.success) {
            setModal({ type: 'success', variant: 'delete', title: 'تم حذف المخالفة بنجاح', details: [
              `الموظف: ${employee.name}`,
              `المبلغ: ${Number(violation?.violation_amount).toLocaleString()} ر.س`
            ]});
            router.refresh();
          } else {
            setModal({ type: 'error', title: 'فشل حذف المخالفة', message: result.error || 'حدث خطأ غير متوقع' });
          }
        }
      });
    };

    const handleUpdateViolation = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingViolation) return;
      setModal({ type: 'processing', title: 'جاري تحديث المخالفة...' });
      const result = await updateViolation(editingViolation.id, employee.id, editingViolation);
      if (result.success) {
        setModal({ type: 'success', variant: 'update', title: 'تم تحديث المخالفة بنجاح', details: [
          `الموظف: ${employee.name}`,
          `المبلغ: ${editingViolation.violation_amount} ر.س`,
          `المخصوم: ${editingViolation.deducted_amount} ر.س`
        ]});
        setEditingViolation(null);
        router.refresh();
      } else {
        setModal({ type: 'error', title: 'فشل تحديث المخالفة', message: result.error || 'حدث خطأ غير متوقع' });
      }
    };

    const letterTypeLabels: Record<string, string> = {
      annual_leave: 'إجازة سنوية', sick_leave: 'إجازة مرضية', personal_leave: 'إجازة شخصية', absence: 'غياب', other: 'أخرى'
    };

    const handleAddLetter = async (e: React.FormEvent) => {
      e.preventDefault();
      setModal({ type: 'processing', title: 'جاري إضافة الخطاب...', description: 'يرجى الانتظار' });
      const result = await addLetter({ employee_id: employee.id, ...newLetter });
      if (result.success) {
        setModal({ type: 'success', variant: 'create', title: 'تم إضافة الخطاب بنجاح', details: [
          `الموظف: ${employee.name}`,
          `النوع: ${letterTypeLabels[newLetter.letter_type] || newLetter.letter_type}`,
          `المدة: ${newLetter.duration_days} أيام`,
          `من ${newLetter.start_date} إلى ${newLetter.end_date}`,
          newLetter.violation_amount > 0 ? `الخصم: ${newLetter.violation_amount} ر.س` : ''
        ].filter(Boolean)});
        setNewLetter({ letter_type: "annual_leave", start_date: format(new Date(), "yyyy-MM-dd"), end_date: format(new Date(), "yyyy-MM-dd"), duration_days: 0, violation_amount: 0, letter_details: "" });
        setShowLetterForm(false);
        router.refresh();
      } else {
        setModal({ type: 'error', title: 'فشل إضافة الخطاب', message: result.error || 'حدث خطأ غير متوقع' });
      }
    };

    const handleDeleteLetter = async (id: number) => {
      const letter = letters.find(l => l.id === id);
      const lType = letterTypeLabels[letter?.letter_type] || letter?.letter_type || 'خطاب';
      setModal({
        type: 'delete-confirm',
        title: lType,
        description: `${letter?.start_date} - ${letter?.end_date} (${letter?.duration_days} أيام)`,
        onConfirm: async () => {
          setModal({ type: 'processing', title: 'جاري حذف الخطاب...' });
          const result = await deleteLetter(id, employee.id);
          if (result.success) {
            setModal({ type: 'success', variant: 'delete', title: 'تم حذف الخطاب بنجاح', details: [
              `الموظف: ${employee.name}`,
              `النوع: ${lType}`
            ]});
            router.refresh();
          } else {
            setModal({ type: 'error', title: 'فشل حذف الخطاب', message: result.error || 'حدث خطأ غير متوقع' });
          }
        }
      });
    };

    const handleUpdateLetter = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingLetter) return;
      setModal({ type: 'processing', title: 'جاري تحديث الخطاب...' });
      const result = await updateLetter(editingLetter.id, employee.id, editingLetter);
      if (result.success) {
        setModal({ type: 'success', variant: 'update', title: 'تم تحديث الخطاب بنجاح', details: [
          `الموظف: ${employee.name}`,
          `النوع: ${letterTypeLabels[editingLetter.letter_type] || editingLetter.letter_type}`,
          `المدة: ${editingLetter.duration_days} أيام`
        ]});
        setEditingLetter(null);
        router.refresh();
      } else {
        setModal({ type: 'error', title: 'فشل تحديث الخطاب', message: result.error || 'حدث خطأ غير متوقع' });
      }
    };

    const handleUpdateExpiry = async (e: React.FormEvent) => {
      e.preventDefault();
      setModal({ type: 'processing', title: 'جاري تحديث تاريخ الإقامة...' });
      const result = await updateIqamaExpiry(employee.id, newExpiryDate);
      if (result.success) {
        setModal({ type: 'success', variant: 'iqama', title: 'تم تحديث تاريخ انتهاء الهوية', details: [
          `الموظف: ${employee.name}`,
          `التاريخ الجديد: ${newExpiryDate}`,
          `رقم الهوية: ${employee.iqama_number || '---'}`
        ]});
        router.refresh();
      } else {
        setModal({ type: 'error', title: 'فشل تحديث التاريخ', message: result.error || 'حدث خطأ غير متوقع' });
      }
    };

    const handleAddBankAccount = async (e: React.FormEvent) => {
      e.preventDefault();
      setModal({ type: 'processing', title: 'جاري إضافة الحساب البنكي...', description: 'يرجى الانتظار' });
      const result = await addBankAccount({ employee_id: employee.id, ...newBankAccount });
      if (result.success) {
        setModal({ type: 'success', variant: 'create', title: 'تم إضافة الحساب البنكي', details: [
          `الموظف: ${employee.name}`,
          `البنك: ${newBankAccount.bank_name}`,
          `الآيبان: ${newBankAccount.iban}`,
          newBankAccount.is_primary ? 'تم تعيينه كحساب أساسي' : ''
        ].filter(Boolean)});
        setNewBankAccount({ bank_name: "", account_number: "", iban: "", is_primary: false });
        setShowBankForm(false);
        router.refresh();
      } else {
        setModal({ type: 'error', title: 'فشل إضافة الحساب البنكي', message: result.error || 'حدث خطأ غير متوقع' });
      }
    };

    const handleUpdateBankAccount = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingBank) return;
      setModal({ type: 'processing', title: 'جاري تحديث الحساب البنكي...' });
      const result = await updateBankAccount(editingBank.id, employee.id, editingBank);
      if (result.success) {
        setModal({ type: 'success', variant: 'update', title: 'تم تحديث الحساب البنكي', details: [
          `الموظف: ${employee.name}`,
          `البنك: ${editingBank.bank_name}`,
          `الآيبان: ${editingBank.iban}`
        ]});
        setEditingBank(null);
        router.refresh();
      } else {
        setModal({ type: 'error', title: 'فشل تحديث الحساب البنكي', message: result.error || 'حدث خطأ غير متوقع' });
      }
    };

    const handleDeleteBankAccount = async (id: number) => {
      const account = bankAccounts.find((a: any) => a.id === id);
      setModal({
        type: 'delete-confirm',
        title: `الحساب البنكي - ${account?.bank_name || 'بدون اسم'}`,
        description: `الآيبان: ${account?.iban || '---'}`,
        onConfirm: async () => {
          setModal({ type: 'processing', title: 'جاري حذف الحساب البنكي...' });
          const result = await deleteBankAccount(id, employee.id);
          if (result.success) {
            setModal({ type: 'success', variant: 'delete', title: 'تم حذف الحساب البنكي', details: [
              `الموظف: ${employee.name}`,
              `البنك: ${account?.bank_name || '---'}`
            ]});
            router.refresh();
          } else {
            setModal({ type: 'error', title: 'فشل حذف الحساب البنكي', message: result.error || 'حدث خطأ غير متوقع' });
          }
        }
      });
    };

    const handleSetPrimaryBank = async (id: number) => {
      const account = bankAccounts.find((a: any) => a.id === id);
      setModal({ type: 'processing', title: 'جاري تعيين الحساب الأساسي...' });
      const result = await setPrimaryBankAccount(id, employee.id);
      if (result.success) {
        setModal({ type: 'success', variant: 'update', title: 'تم تعيين الحساب كأساسي', details: [
          `الموظف: ${employee.name}`,
          `البنك: ${account?.bank_name || '---'}`
        ]});
        router.refresh();
      } else {
        setModal({ type: 'error', title: 'فشل تعيين الحساب', message: result.error || 'حدث خطأ غير متوقع' });
      }
    };

  const activeConfig = tabConfig[activeTab] || tabConfig.general;

  let iqamaStatus = { text: "غير محددة", color: "gray", days: null as number | null };
  if (employee.iqama_expiry) {
    const days = differenceInDays(parseISO(employee.iqama_expiry), new Date());
    if (days < 0) { iqamaStatus = { text: `منتهية منذ ${Math.abs(days)} يوم`, color: "red", days }; }
    else if (days <= 30) { iqamaStatus = { text: `تنتهي خلال ${days} يوم`, color: "orange", days }; }
    else { iqamaStatus = { text: `سارية (${days} يوم متبقي)`, color: "green", days }; }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
        className="flex h-[calc(100vh-100px)] w-full px-2 gap-5 overflow-hidden"
      >
        <div className="w-[320px] shrink-0 flex flex-col gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            
            <div className="relative z-10 p-6">
              <div className="flex flex-col items-center text-center mb-5">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="relative mb-4"
                >
                  <div className="h-32 w-32 rounded-3xl border-4 border-white/20 overflow-hidden bg-white/10 shadow-2xl backdrop-blur-md">
                    {getPublicUrl(employee.personal_photo) ? (
                      <img src={getPublicUrl(employee.personal_photo)!} alt={employee.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-white/50"><User size={48} /></div>
                    )}
                  </div>
                  <div className={`absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-indigo-700 dark:border-slate-900 ${employee.is_active === 1 ? 'bg-emerald-400' : 'bg-orange-400'} shadow-lg animate-pulse`} />
                </motion.div>
                
                <h1 className="text-xl font-black text-white mb-1 leading-tight">{employee.name}</h1>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white/60 bg-white/10 px-3 py-1 rounded-full">#{employee.user_code || '---'}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white`}>
                    {employee.is_active === 1 ? 'نشط' : 'إجازة'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 hover:border-white/20 transition-all">
                  <span className="text-white/60 flex items-center gap-2"><Briefcase size={14} className="text-white/80" /> الباقة</span>
                  <span className="text-white font-bold truncate max-w-[140px]">{employee.group_name}</span>
                </div>
                <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 hover:border-white/20 transition-all">
                  <span className="text-white/60 flex items-center gap-2"><IdCard size={14} className="text-white/80" /> الهوية</span>
                  <span className="text-white font-bold font-mono">{employee.iqama_number || '---'}</span>
                </div>
                <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 hover:border-white/20 transition-all">
                  <span className="text-white/60 flex items-center gap-2"><Globe size={14} className="text-white/80" /> الجنسية</span>
                  <span className="text-white font-bold">{employee.nationality || '---'}</span>
                </div>
              </div>


            <div className="flex gap-2 mt-5">
              <Link href={`/hr/packages/${employee.package_id}`} className="flex-1">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                  <ArrowRight size={14} />
                  عرض الباقة
                </motion.button>
              </Link>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleToggleStatus}
                className={`flex-1 px-4 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg ${
                  employee.is_active === 1 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-orange-500/20' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/20'
                }`}
              >
                {employee.is_active === 1 ? <Umbrella size={14} /> : <CheckCircle2 size={14} />}
                {employee.is_active === 1 ? 'إجازة' : 'تفعيل'}
              </motion.button>
            </div>
          </div>
        </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-slate-200 dark:border-white/10 flex-1 overflow-auto shadow-xl shadow-slate-200/50 dark:shadow-none"
          >
            <p className="text-xs font-black text-slate-500 dark:text-white/60 mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-blue-500 dark:text-yellow-400" />
              الأقسام والتبويبات
            </p>
            <div className="space-y-2">
              {Object.entries(tabConfig).map(([id, config]: [string, any], index) => (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all text-right ${
                    activeTab === id 
                      ? `bg-gradient-to-r ${config.bg} text-white shadow-lg ${config.glow}` 
                      : 'bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${activeTab === id ? 'bg-white/20' : config.light}`}>
                    <config.icon size={18} className={activeTab === id ? 'text-white' : config.text} />
                  </div>
                  <span className="text-sm font-black flex-1">{config.label}</span>
                  {id === 'status' && (
                    <span className={`text-[9px] font-black px-2 py-1 rounded-full ${
                      iqamaStatus.color === 'red' ? 'bg-red-500/20 text-red-400' :
                      iqamaStatus.color === 'orange' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {iqamaStatus.color === 'green' ? 'سارية' : iqamaStatus.color === 'orange' ? 'على وشك' : 'منتهية'}
                    </span>
                  )}
                  {activeTab === id && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="h-2.5 w-2.5 rounded-full bg-white shadow-lg shadow-white/50"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>



      </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col min-w-0 shadow-2xl shadow-slate-200/50 dark:shadow-none"
        >
          <div className={`bg-gradient-to-r ${activeConfig.bg} px-6 py-6 flex items-center justify-between shrink-0`}>
            <div className="flex items-center gap-4 text-white">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-inner">
                <activeConfig.icon size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">{activeConfig.label}</h3>
                <p className="text-xs font-bold opacity-80">عرض وتعديل كافة التفاصيل والمستندات</p>
              </div>
            </div>
            <div className="flex gap-2">
{(activeTab === "general" || activeTab === "documents") && (
                    <motion.button 
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                        isEditing 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-gradient-to-l from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white'
                      }`}
                    >
                      {isEditing ? <X size={15} /> : <Edit3 size={15} />}
                      <span>{isEditing ? 'إلغاء التعديل' : 'تعديل البيانات'}</span>
                    </motion.button>
                  )}
                    {activeTab === "documents" && (
                      <motion.button 
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddDocType(!showAddDocType)}
                        className="bg-gradient-to-l from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all"
                      >
                        <FilePlus size={15} />
                        <span>إضافة نوع مستند جديد</span>
                      </motion.button>
                    )}

            {activeTab === "violations" && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowViolationForm(!showViolationForm)}
                className="relative bg-white/90 hover:bg-white text-gray-900 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg group overflow-visible"
              >
                <span className="absolute -inset-0.5 rounded-xl opacity-75 blur-sm -z-10" style={{ background: 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)', backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }} />
                <PlusCircle size={14} className="relative z-10" />
                <span className="relative z-10">{showViolationForm ? 'إلغاء' : 'إضافة مخالفة'}</span>
              </motion.button>
            )}
            {activeTab === "letters" && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLetterForm(!showLetterForm)}
                className="relative bg-white/90 hover:bg-white text-gray-900 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg group overflow-visible"
              >
                <span className="absolute -inset-0.5 rounded-xl opacity-75 blur-sm -z-10" style={{ background: 'linear-gradient(90deg, #ec4899, #f472b6, #ec4899)', backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }} />
                <PlusCircle size={14} className="relative z-10" />
                <span className="relative z-10">{showLetterForm ? 'إلغاء' : 'إضافة خطاب'}</span>
              </motion.button>
            )}
            {activeTab === "bank" && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBankForm(!showBankForm)}
                className="relative bg-white/90 hover:bg-white text-gray-900 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg group overflow-visible"
              >
                <span className="absolute -inset-0.5 rounded-xl opacity-75 blur-sm -z-10" style={{ background: 'linear-gradient(90deg, #10b981, #34d399, #10b981)', backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }} />
                <PlusCircle size={14} className="relative z-10" />
                <span className="relative z-10">{showBankForm ? 'إلغاء' : 'إضافة حساب'}</span>
              </motion.button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === "general" && (
                <form onSubmit={handleUpdatePersonal}>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <GlassField label="رقم الهوية" value={personalInfo.iqama_number} onChange={(v: string) => setPersonalInfo({...personalInfo, iqama_number: v})} editable={isEditing} icon={<IdCard size={14} />} />
                    <GlassField label="الاسم بالإنجليزية" value={personalInfo.name_en} onChange={(v: string) => setPersonalInfo({...personalInfo, name_en: v})} editable={isEditing} icon={<User size={14} />} />
                    <GlassField label="رقم المستخدم" value={personalInfo.user_code} onChange={(v: string) => setPersonalInfo({...personalInfo, user_code: v})} editable={isEditing} icon={<Hash size={14} />} />
                    <GlassField label="المسمى الوظيفي" value={personalInfo.job_title} onChange={(v: string) => setPersonalInfo({...personalInfo, job_title: v})} editable={isEditing} icon={<Briefcase size={14} />} />
                    <GlassField label="الجنسية" value={personalInfo.nationality} onChange={(v: string) => setPersonalInfo({...personalInfo, nationality: v})} editable={isEditing} icon={<Globe size={14} />} />
                    <GlassField label="رقم الهاتف" value={personalInfo.phone} onChange={(v: string) => setPersonalInfo({...personalInfo, phone: v})} editable={isEditing} icon={<Phone size={14} />} />
                    <GlassField label="البريد الإلكتروني" value={personalInfo.email} onChange={(v: string) => setPersonalInfo({...personalInfo, email: v})} editable={isEditing} type="email" icon={<Mail size={14} />} />
                    <GlassField label="لوحة المركبة" value={personalInfo.vehicle_plate} onChange={(v: string) => setPersonalInfo({...personalInfo, vehicle_plate: v})} editable={isEditing} icon={<Car size={14} />} />
                    <GlassField label="تاريخ الميلاد" value={personalInfo.birth_date} onChange={(v: string) => setPersonalInfo({...personalInfo, birth_date: v})} editable={isEditing} type="date" icon={<Calendar size={14} />} />
                    <GlassField label="رقم الجواز" value={personalInfo.passport_number} onChange={(v: string) => setPersonalInfo({...personalInfo, passport_number: v})} editable={isEditing} icon={<FileText size={14} />} />
                    <GlassField label="كرت التشغيل" value={personalInfo.operation_card_number} onChange={(v: string) => setPersonalInfo({...personalInfo, operation_card_number: v})} editable={isEditing} icon={<IdCard size={14} />} />
                    <GlassField label="الراتب الأساسي" value={personalInfo.basic_salary} onChange={(v: string) => setPersonalInfo({...personalInfo, basic_salary: v})} editable={isEditing} icon={<CreditCard size={14} />} />
                    <GlassField label="بدل السكن" value={personalInfo.housing_allowance} onChange={(v: string) => setPersonalInfo({...personalInfo, housing_allowance: v})} editable={isEditing} icon={<Building size={14} />} />
                  </div>
                  {isEditing && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 flex justify-center"
                    >
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit" 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-10 py-3 rounded-xl font-black text-sm flex items-center gap-3 shadow-lg shadow-blue-500/30"
                      >
                        <Save size={18} />
                        حفظ جميع التغييرات
                      </motion.button>
                    </motion.div>
                  )}
                </form>
              )}

              {activeTab === "bank" && (
                <div className="space-y-5">
                  <AnimatePresence>
                    {(showBankForm || editingBank) && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
className="bg-slate-100 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 overflow-hidden"
                        >
                          <form onSubmit={editingBank ? handleUpdateBankAccount : handleAddBankAccount} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input 
                              type="text" 
                              placeholder="اسم البنك" 
                              value={editingBank ? editingBank.bank_name : newBankAccount.bank_name} 
                              onChange={(e) => editingBank ? setEditingBank({...editingBank, bank_name: e.target.value}) : setNewBankAccount({...newBankAccount, bank_name: e.target.value})} 
                              className="bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-emerald-500 outline-none" 
                              required 
                            />
                            <input 
                              type="text" 
                              placeholder="رقم الحساب" 
                              value={editingBank ? editingBank.account_number : newBankAccount.account_number} 
                              onChange={(e) => editingBank ? setEditingBank({...editingBank, account_number: e.target.value}) : setNewBankAccount({...newBankAccount, account_number: e.target.value})} 
                              className="bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-emerald-500 outline-none" 
                            />
                            <input 
                              type="text" 
                              placeholder="رقم الآيبان" 
                              value={editingBank ? editingBank.iban : newBankAccount.iban} 
                              onChange={(e) => editingBank ? setEditingBank({...editingBank, iban: e.target.value}) : setNewBankAccount({...newBankAccount, iban: e.target.value})} 
                              className="bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-emerald-500 outline-none" 
                            />
                            <div className="flex gap-3">
                              <label className="flex items-center gap-2 text-sm font-black text-slate-700 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={editingBank ? editingBank.is_primary : newBankAccount.is_primary} 
                                  onChange={(e) => editingBank ? setEditingBank({...editingBank, is_primary: e.target.checked}) : setNewBankAccount({...newBankAccount, is_primary: e.target.checked})} 
                                  className="w-4 h-4 rounded accent-emerald-500"
                                />
                                أساسي
                              </label>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl text-sm font-black shadow-lg shadow-emerald-500/30">{editingBank ? 'تحديث' : 'إضافة'}</motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => {setEditingBank(null); setShowBankForm(false);}} className="px-4 bg-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-300">✕</motion.button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

{bankAccounts.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {bankAccounts.map((account: any, idx: number) => (
                          <motion.div 
                            key={account.id} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.01 }}
                            className={`p-5 rounded-2xl backdrop-blur-xl border transition-all group relative overflow-hidden ${
                              account.is_primary 
                                ? 'bg-emerald-50 border-emerald-500/30' 
                                : 'bg-slate-50 border-slate-200 hover:border-emerald-500/30'
                            }`}
                          >
                            {account.is_primary && (
                              <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-500 rounded-r-xl" />
                            )}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${account.is_primary ? 'bg-emerald-500/20 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>
                                  <University size={22} />
                                </div>
                                <div>
                                  <h4 className="text-base font-black text-slate-900">{account.bank_name || 'بدون اسم'}</h4>
                                  {account.is_primary && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600">الحساب الأساسي</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {!account.is_primary && (
                                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleSetPrimaryBank(account.id)} className="p-2 text-emerald-600 hover:bg-emerald-500/20 rounded-lg" title="تعيين كأساسي"><Check size={14} /></motion.button>
                                )}
                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setEditingBank(account)} className="p-2 text-blue-600 hover:bg-blue-500/20 rounded-lg"><Edit3 size={14} /></motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDeleteBankAccount(account.id)} className="p-2 text-red-600 hover:bg-red-500/20 rounded-lg"><Trash size={14} /></motion.button>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between bg-slate-100 rounded-xl px-4 py-3">
                                <span className="text-xs font-bold text-slate-600 flex items-center gap-2"><Hash size={12} /> رقم الحساب</span>
                                <span className="text-sm font-black text-slate-900 font-mono">{account.account_number || '---'}</span>
                              </div>
                              <div className="flex items-center justify-between bg-slate-100 rounded-xl px-4 py-3">
                                <span className="text-xs font-bold text-slate-600 flex items-center gap-2"><CreditCard size={12} /> رقم الآيبان</span>
                                <span className="text-sm font-black text-slate-900 font-mono">{account.iban || '---'}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-16 text-center text-slate-600 font-black bg-slate-100 backdrop-blur-xl rounded-2xl border-2 border-dashed border-slate-300">
                        <University size={40} className="mx-auto mb-3 opacity-50" />
                        لا توجد حسابات بنكية مسجلة
                        <p className="text-sm mt-2 text-slate-500">اضغط على "إضافة حساب" لإضافة حساب بنكي جديد</p>
                      </div>
                    )}
                </div>
              )}

{activeTab === "documents" && (
                  <div className="space-y-6">
                    {/* Built-in Documents */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      <GlassDocCard label="الصورة الشخصية" path={employee.personal_photo} field="personal_photo" editable={isEditing} employeeId={employee.id} router={router} setCustomDocuments={setCustomDocuments} setCustomDocTypes={setCustomDocTypes} />
                      <GlassDocCard label="صورة الهوية" path={employee.iqama_file} field="iqama_file" editable={isEditing} employeeId={employee.id} router={router} setCustomDocuments={setCustomDocuments} setCustomDocTypes={setCustomDocTypes} />
                      <GlassDocCard label="رخصة القيادة" path={employee.license_file} field="license_file" editable={isEditing} employeeId={employee.id} router={router} setCustomDocuments={setCustomDocuments} setCustomDocTypes={setCustomDocTypes} />
                      <GlassDocCard label="استمارة المركبة" path={employee.vehicle_file} field="vehicle_file" editable={isEditing} employeeId={employee.id} router={router} setCustomDocuments={setCustomDocuments} setCustomDocTypes={setCustomDocTypes} />
                      <GlassDocCard label="تصريح أجير" path={employee.agir_permit_file} field="agir_permit_file" editable={isEditing} employeeId={employee.id} router={router} setCustomDocuments={setCustomDocuments} setCustomDocTypes={setCustomDocTypes} />
                      <GlassDocCard label="عقد العمل" path={employee.work_contract_file} field="work_contract_file" editable={isEditing} employeeId={employee.id} router={router} setCustomDocuments={setCustomDocuments} setCustomDocTypes={setCustomDocTypes} />
                      <GlassDocCard label="بطاقة التشغيل" path={employee.vehicle_operation_card} field="vehicle_operation_card" editable={isEditing} employeeId={employee.id} router={router} setCustomDocuments={setCustomDocuments} setCustomDocTypes={setCustomDocTypes} />
                      <GlassDocCard label="بطاقة السائق" path={employee.driver_card} field="driver_card" editable={isEditing} employeeId={employee.id} router={router} setCustomDocuments={setCustomDocuments} setCustomDocTypes={setCustomDocTypes} />
                    </div>

                    {/* Custom Documents */}
                    {customDocTypes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                          <FileText size={16} className="text-indigo-500" />
                          مستندات مخصصة
                        </h4>
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                          {customDocTypes.map((dt: any) => {
                            const doc = customDocuments.find((d: any) => d.document_name === dt.name);
                            return (
                                <GlassDocCard 
                                  key={dt.id} 
                                  label={dt.name} 
                                  path={doc?.file_path || null} 
                                  editable={isEditing} 
                                  employeeId={employee.id}
                                  isCustom={true}
                                  customDocTypeId={dt.id}
                                  expiryDate={doc?.expiry_date || null}
                                  router={router}
                                  setCustomDocuments={setCustomDocuments}
                                  setCustomDocTypes={setCustomDocTypes}
                                />
                            );
                          })}
                        </div>
                      </div>
                    )}

                      {/* Add new document type */}
                      {showAddDocType && (
                        <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl p-5">
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={newDocTypeName}
                              onChange={(e) => setNewDocTypeName(e.target.value)}
                              placeholder="اسم نوع المستند الجديد..."
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={async () => {
                                if (!newDocTypeName.trim()) return;
                                const res = await addCustomDocumentType(newDocTypeName.trim());
                                if (res.success) {
                                  setCustomDocTypes([...customDocTypes, { id: res.id, name: newDocTypeName.trim() }]);
                                  setNewDocTypeName("");
                                  setShowAddDocType(false);
                                  toast.success("تم إضافة نوع المستند بنجاح");
                                  router.refresh();
                                } else {
                                  toast.error("فشل إضافة نوع المستند");
                                }
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl text-xs font-black flex items-center gap-2"
                            >
                              <Check size={14} />
                              حفظ
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => { setShowAddDocType(false); setNewDocTypeName(""); }}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-3 rounded-xl text-xs font-black"
                            >
                              إلغاء
                            </motion.button>
                          </div>
                        </div>
                      )}
                  </div>
                )}

              {activeTab === "status" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`p-6 rounded-2xl border backdrop-blur-xl ${
                        iqamaStatus.color === 'red' ? 'bg-red-500/10 border-red-500/20' :
                        iqamaStatus.color === 'orange' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-xl ${
                          iqamaStatus.color === 'red' ? 'bg-red-500/20 text-red-400' :
                          iqamaStatus.color === 'orange' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}><Timer size={22} /></div>
                        <span className="text-xs font-black text-slate-700 uppercase">الأيام المتبقية</span>
                      </div>
                      <div className={`text-5xl font-black text-center ${
                        iqamaStatus.color === 'red' ? 'text-red-400' :
                        iqamaStatus.color === 'orange' ? 'text-orange-400' : 'text-emerald-400'
                      }`}>{iqamaStatus.days !== null ? Math.abs(iqamaStatus.days) : '--'}</div>
                      <p className={`text-sm font-bold text-center mt-3 ${
                        iqamaStatus.color === 'red' ? 'text-red-400/70' :
                        iqamaStatus.color === 'orange' ? 'text-orange-400/70' : 'text-emerald-400/70'
                      }`}>{iqamaStatus.text}</p>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 backdrop-blur-xl"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400"><ShieldCheck size={22} /></div>
                        <span className="text-xs font-black text-slate-700 uppercase">حالة الصلاحية</span>
                      </div>
                      <div className="text-2xl font-black text-blue-400 text-center">
                        {iqamaStatus.days !== null && iqamaStatus.days < 0 ? 'منتهية' : 'سارية'}
                      </div>
                      <div className="flex justify-center mt-3">
                        <span className={`flex items-center gap-2 text-xs font-bold ${iqamaStatus.days !== null && iqamaStatus.days < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          <div className={`h-2 w-2 rounded-full ${iqamaStatus.days !== null && iqamaStatus.days < 0 ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
                          مراقب تلقائياً
                        </span>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-6 rounded-2xl border border-purple-500/20 bg-purple-500/10 backdrop-blur-xl"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400"><CalendarDays size={22} /></div>
<span className="text-xs font-black text-slate-700 uppercase">تحديث التاريخ</span>
                        </div>
                        <form onSubmit={handleUpdateExpiry} className="space-y-3">
                          <input 
                            type="date" 
                            value={newExpiryDate}
                            onChange={(e) => setNewExpiryDate(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:border-purple-500 outline-none transition-all"
                            required
                          />
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit" 
                          className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                        >
                          <Save size={16} />
                          حفظ التاريخ الجديد
                        </motion.button>
                      </form>
                    </motion.div>
                  </div>

                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-2xl text-white flex items-center gap-6 border border-white/10"
                  >
                    <div className="bg-yellow-500/20 p-4 rounded-xl text-yellow-400"><Info size={28} /></div>
                    <div className="flex-1">
                      <h4 className="text-base font-black mb-1">نظام مراقبة الهوية الذكي</h4>
                      <p className="text-sm text-white/50">يتم إرسال تنبيهات قبل 30 يوماً من انتهاء الصلاحية عبر البريد والتطبيق</p>
                    </div>
                    <div className="bg-white/5 px-5 py-3 rounded-xl text-center border border-white/10">
                      <span className="text-2xl font-black text-yellow-400">30</span>
                      <p className="text-[10px] text-white/40 font-bold">يوم تنبيه</p>
                    </div>
                  </motion.div>
                </div>
              )}

              {activeTab === "violations" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-4">
                    <GlassStatBox label="إجمالي المخالفات" value={violations.reduce((acc, v) => acc + Number(v.violation_amount), 0)} color="red" />
                    <GlassStatBox label="تم خصمه" value={violations.reduce((acc, v) => acc + Number(v.deducted_amount), 0)} color="green" />
                    <GlassStatBox label="المتبقي" value={violations.reduce((acc, v) => acc + Number(v.remaining_amount), 0)} color="blue" />
                  </div>

                  <AnimatePresence>
                    {(showViolationForm || editingViolation) && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
className="bg-slate-100 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 overflow-hidden"
                          >
                            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                              <AlertTriangle size={20} className="text-red-500" />
                              {editingViolation ? 'تعديل مخالفة' : 'إضافة مخالفة جديدة'}
                            </h3>
                            <form onSubmit={editingViolation ? handleUpdateViolation : handleAddViolation} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-black text-slate-700 mb-2">نوع المخالفة</label>
                                  <select value={editingViolation ? editingViolation.violation_type : newViolation.violation_type} onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, violation_type: e.target.value}) : setNewViolation({...newViolation, violation_type: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:border-red-500 outline-none">
                                    <option value="traffic" className="bg-white">مرورية</option>
                                    <option value="general" className="bg-white">عامة</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-black text-slate-700 mb-2">تاريخ المخالفة</label>
                                  <input type="date" value={editingViolation ? editingViolation.violation_date : newViolation.violation_date} onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, violation_date: e.target.value}) : setNewViolation({...newViolation, violation_date: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:border-red-500 outline-none" required />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-black text-slate-700 mb-2">مبلغ المخالفة (ر.س)</label>
                                  <input type="number" placeholder="أدخل مبلغ المخالفة الكامل" value={editingViolation ? editingViolation.violation_amount : newViolation.violation_amount} onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, violation_amount: Number(e.target.value)}) : setNewViolation({...newViolation, violation_amount: Number(e.target.value)})} className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-red-500 outline-none" required />
                                </div>
                                <div>
                                  <label className="block text-sm font-black text-slate-700 mb-2">المبلغ المخصوم من الراتب (ر.س)</label>
                                  <input type="number" placeholder="المبلغ الذي سيخصم من الراتب" value={editingViolation ? editingViolation.deducted_amount : newViolation.deducted_amount} onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, deducted_amount: Number(e.target.value)}) : setNewViolation({...newViolation, deducted_amount: Number(e.target.value)})} className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-red-500 outline-none" required />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2">وصف المخالفة</label>
                                <input type="text" placeholder="وصف تفصيلي للمخالفة (اختياري)" value={editingViolation ? editingViolation.violation_description : newViolation.violation_description} onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, violation_description: e.target.value}) : setNewViolation({...newViolation, violation_description: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-red-500 outline-none" />
                              </div>
                              <div className="flex gap-3 pt-2">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 rounded-xl text-sm font-black shadow-lg shadow-red-500/30">{editingViolation ? 'تحديث المخالفة' : 'إضافة المخالفة'}</motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => {setEditingViolation(null); setShowViolationForm(false);}} className="px-6 bg-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-300">إلغاء</motion.button>
                              </div>
                            </form>
                          </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 backdrop-blur-xl">
                      <table className="w-full text-right text-sm">
                        <thead className="bg-slate-100 border-b border-slate-200">
                            <tr>
                              <th className="px-5 py-4 text-xs font-black text-slate-700 uppercase">التاريخ</th>
                              <th className="px-5 py-4 text-xs font-black text-slate-700 uppercase">النوع</th>
                              <th className="px-5 py-4 text-xs font-black text-slate-700 uppercase">المبلغ</th>
                              <th className="px-5 py-4 text-xs font-black text-slate-700 uppercase">المخصوم</th>
                              <th className="px-5 py-4 text-xs font-black text-slate-700 uppercase">المتبقي</th>
                              <th className="px-5 py-4 text-xs font-black text-slate-700 uppercase">الوصف</th>
                              <th className="px-5 py-4 text-xs font-black text-slate-700 uppercase text-center">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {violations.map((v, idx) => (
                              <motion.tr 
                                key={v.id} 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="hover:bg-slate-100 transition-all"
                              >
                                <td className="px-5 py-4 font-bold text-slate-700">{v.violation_date}</td>
                                <td className="px-5 py-4"><span className={`px-3 py-1 rounded-lg text-xs font-black ${v.violation_type === 'traffic' ? 'bg-red-500/20 text-red-600' : 'bg-orange-500/20 text-orange-600'}`}>{v.violation_type === 'traffic' ? 'مرورية' : 'عامة'}</span></td>
                                <td className="px-5 py-4 font-black text-red-600">{Number(v.violation_amount).toLocaleString()} ر.س</td>
                                <td className="px-5 py-4 font-black text-emerald-600">{Number(v.deducted_amount).toLocaleString()} ر.س</td>
                                <td className="px-5 py-4 font-black text-blue-600">{Number(v.remaining_amount).toLocaleString()} ر.س</td>
                                <td className="px-5 py-4 text-xs text-slate-500 font-bold max-w-[200px] truncate" title={v.violation_description}>{v.violation_description || "-"}</td>
                                <td className="px-5 py-4">
                                  <div className="flex justify-center gap-2">
                                    {v.violation_type !== 'traffic_expense' && (
                                      <>
                                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => setEditingViolation(v)} className="p-2 text-blue-500 hover:bg-blue-500/20 rounded-lg"><Edit3 size={14} /></motion.button>
                                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDeleteViolation(v.id)} className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg"><Trash size={14} /></motion.button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                          ))}
                          {violations.length === 0 && (
                            <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500 font-black">لا توجد مخالفات مسجلة</td></tr>
                          )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "stats" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <GlassStatBox label="إجمالي الطلبات" value={stats.total_orders} color="blue" />
                    <GlassStatBox label="إجمالي الرواتب" value={stats.total_salary} color="green" unit="ر.س" />
                    <GlassStatBox label="متوسط الطلبات" value={Math.round(stats.avg_orders)} color="purple" />
                    <GlassStatBox label="عدد الشهور" value={stats.total_months} color="orange" />
                  </div>

<div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 backdrop-blur-xl">
                      <table className="w-full text-right text-sm">
                        <thead className="bg-slate-100 border-b border-slate-200">
                          <tr>
                            <th className="px-5 py-4 text-xs font-black text-slate-700 uppercase">الشهر</th>
                            <th className="px-5 py-4 text-xs font-black text-slate-700 uppercase">الطلبات</th>
                            <th className="px-5 py-4 text-xs font-black text-slate-700 uppercase">التارجت</th>
                            <th className="px-5 py-4 text-xs font-black text-slate-700 uppercase">البونص</th>
                            <th className="px-5 py-4 text-xs font-black text-slate-700 uppercase">الخصومات</th>
                            <th className="px-5 py-4 text-xs font-black text-slate-700 uppercase">صافي الراتب</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {monthlyData.map((m, idx) => (
                            <motion.tr 
                              key={idx} 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="hover:bg-slate-100"
                            >
                              <td className="px-5 py-4 font-black text-slate-900">{m.payroll_month}</td>
                              <td className="px-5 py-4 font-black text-blue-600">{m.successful_orders}</td>
                              <td className="px-5 py-4 font-bold text-slate-600">{m.target}</td>
                              <td className="px-5 py-4 font-black text-emerald-600">+{m.bonus}</td>
                              <td className="px-5 py-4 font-black text-red-600">-{m.total_deduction}</td>
                              <td className="px-5 py-4 font-black text-slate-900 bg-slate-100">{Number(m.net_salary).toLocaleString()} ر.س</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
              )}

              {activeTab === "letters" && (
                <div className="space-y-5">
                  <AnimatePresence>
                    {(showLetterForm || editingLetter) && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
className="bg-slate-100 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 overflow-hidden"
                          >
                            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                              <Mail size={20} className="text-rose-500" />
                              {editingLetter ? 'تعديل خطاب / إجازة' : 'إضافة خطاب / إجازة جديدة'}
                            </h3>
                            <form onSubmit={editingLetter ? handleUpdateLetter : handleAddLetter} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-black text-slate-700 mb-2">نوع الخطاب / الإجازة</label>
                                  <select value={editingLetter ? editingLetter.letter_type : newLetter.letter_type} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, letter_type: e.target.value}) : setNewLetter({...newLetter, letter_type: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:border-rose-500 outline-none">
                                    <option value="annual_leave" className="bg-white">إجازة سنوية</option>
                                    <option value="sick_leave" className="bg-white">إجازة مرضية</option>
                                    <option value="personal_leave" className="bg-white">إجازة شخصية</option>
                                    <option value="absence" className="bg-white">غياب</option>
                                    <option value="other" className="bg-white">أخرى</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-black text-slate-700 mb-2">عدد الأيام</label>
                                  <input type="number" placeholder="أدخل عدد أيام الإجازة" value={editingLetter ? editingLetter.duration_days : newLetter.duration_days} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, duration_days: Number(e.target.value)}) : setNewLetter({...newLetter, duration_days: Number(e.target.value)})} className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-rose-500 outline-none" required />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-black text-slate-700 mb-2">تاريخ البداية</label>
                                  <input type="date" value={editingLetter ? editingLetter.start_date : newLetter.start_date} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, start_date: e.target.value}) : setNewLetter({...newLetter, start_date: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:border-rose-500 outline-none" required />
                                </div>
                                <div>
                                  <label className="block text-sm font-black text-slate-700 mb-2">تاريخ النهاية</label>
                                  <input type="date" value={editingLetter ? editingLetter.end_date : newLetter.end_date} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, end_date: e.target.value}) : setNewLetter({...newLetter, end_date: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:border-rose-500 outline-none" required />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2">مبلغ الخصم / المخالفة (ر.س) - اختياري</label>
                                <input type="number" placeholder="المبلغ الذي سيخصم بسبب هذا الخطاب (إن وجد)" value={editingLetter ? editingLetter.violation_amount : newLetter.violation_amount} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, violation_amount: Number(e.target.value)}) : setNewLetter({...newLetter, violation_amount: Number(e.target.value)})} className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-rose-500 outline-none" />
                              </div>
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2">التفاصيل والملاحظات</label>
                                <textarea placeholder="أدخل تفاصيل إضافية أو ملاحظات (اختياري)" value={editingLetter ? editingLetter.letter_details : newLetter.letter_details} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, letter_details: e.target.value}) : setNewLetter({...newLetter, letter_details: e.target.value})} rows={2} className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-rose-500 outline-none" />
                              </div>
                              <div className="flex gap-3 pt-2">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3 rounded-xl text-sm font-black shadow-lg shadow-rose-500/30">{editingLetter ? 'تحديث الخطاب' : 'إضافة الخطاب'}</motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => {setEditingLetter(null); setShowLetterForm(false);}} className="px-6 bg-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-300">إلغاء</motion.button>
                              </div>
                            </form>
                          </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {letters.map((l, idx) => (
                        <motion.div 
                          key={l.id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                          className="p-5 rounded-2xl bg-slate-50 backdrop-blur-xl border border-slate-200 hover:border-rose-500/30 transition-all group relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-rose-500 to-pink-500 rounded-r-xl" />
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-500"><Mail size={18} /></div>
                              <div>
                                <h4 className="text-base font-black text-slate-900">
                                  {l.letter_type === 'annual_leave' ? 'إجازة سنوية' : l.letter_type === 'sick_leave' ? 'إجازة مرضية' : l.letter_type === 'personal_leave' ? 'إجازة شخصية' : l.letter_type === 'absence' ? 'غياب' : 'أخرى'}
                                </h4>
                                <span className="text-[11px] font-bold text-slate-500">{l.created_at}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <motion.button whileHover={{ scale: 1.1 }} onClick={() => setEditingLetter(l)} className="p-2 text-blue-500 hover:bg-blue-500/20 rounded-lg"><Edit3 size={14} /></motion.button>
                              <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDeleteLetter(l.id)} className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg"><Trash size={14} /></motion.button>
                            </div>
                          </div>
                          {l.letter_details && <p className="text-xs font-bold text-slate-600 mb-3 bg-slate-100 p-3 rounded-xl">{l.letter_details}</p>}
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-slate-600"><Calendar size={14} className="text-rose-500" /> {l.start_date} - {l.end_date} ({l.duration_days} أيام)</span>
                            {l.violation_amount > 0 && <span className="text-rose-600 font-bold bg-rose-500/10 px-3 py-1 rounded-lg">مخالفة: {Number(l.violation_amount).toLocaleString()} ر.س</span>}
                          </div>
                        </motion.div>
                      ))}
                      {letters.length === 0 && (
                        <div className="col-span-full py-16 text-center text-slate-600 font-black bg-slate-100 backdrop-blur-xl rounded-2xl border-2 border-dashed border-slate-300">
                          <Mail size={40} className="mx-auto mb-3 opacity-50" />
                          لا يوجد خطابات مسجلة
                        </div>
                      )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {isPopupOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPopupOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-xl bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] border border-white/10">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 text-white">
                  <Users size={20} />
                  <span className="text-base font-black">قائمة الموظفين ({allEmployees.length})</span>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsPopupOpen(false)} className="text-white/60 hover:text-white bg-white/10 p-2 rounded-lg"><X size={18} /></motion.button>
              </div>
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input type="text" placeholder="بحث بالاسم أو رقم الهوية..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-11 pl-4 text-sm font-bold text-white placeholder-white/30 focus:border-blue-400 outline-none" />
                </div>
              </div>
              <div className="flex-1 overflow-auto p-3 space-y-2">
                {filteredEmployees.map((emp, idx) => (
                  <Link key={emp.id} href={`/hr/employees/${emp.id}`} onClick={() => setIsPopupOpen(false)}>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      whileHover={{ scale: 1.01, x: 5 }}
                      className={`p-4 rounded-xl flex items-center justify-between transition-all ${emp.id === employee.id ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${emp.id === employee.id ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/50'}`}><User size={16} /></div>
                        <div>
                          <p className="text-sm font-black text-white">{emp.name}</p>
                          <p className="text-xs font-bold text-white/40">#{emp.user_code || '---'}</p>
                        </div>
                      </div>
                      {emp.id === employee.id && <Check size={16} className="text-blue-400" />}
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>

      {/* Premium Modal System */}
      <AnimatePresence>
        {modal.type !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md"
            onClick={() => { if (modal.type === 'success' || modal.type === 'error') setModal({ type: 'idle' }); }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 w-[90%] max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Delete Confirm */}
              {modal.type === 'delete-confirm' && (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-5"
                  >
                    <Trash2 size={36} className="text-red-500" />
                  </motion.div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">تأكيد الحذف</h3>
                  <p className="text-sm font-bold text-slate-500 dark:text-white/60 mb-1">{modal.title}</p>
                  {modal.description && <p className="text-xs text-slate-400 dark:text-white/40 mb-6">{modal.description}</p>}
                  <div className="flex gap-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setModal({ type: 'idle' })}
                      className="flex-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-white/70 py-3.5 rounded-xl text-sm font-black transition-all"
                    >
                      إلغاء
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        if (modal.type === 'delete-confirm') {
                          await modal.onConfirm();
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white py-3.5 rounded-xl text-sm font-black shadow-lg shadow-red-500/20 transition-all"
                    >
                      حذف نهائي
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Processing */}
              {modal.type === 'processing' && (
                <div className="p-10 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="mx-auto w-16 h-16 rounded-full border-4 border-slate-200 dark:border-white/10 border-t-blue-500 mb-5"
                  />
                  <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">{modal.title}</h3>
                  {modal.description && <p className="text-xs text-slate-400 dark:text-white/50">{modal.description}</p>}
                </div>
              )}

              {/* Success */}
              {modal.type === 'success' && (() => {
                const variantConfig: Record<string, { icon: any; color: string; bg: string; glow: string }> = {
                  delete: { icon: Trash2, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-500/20', glow: 'shadow-red-500/20' },
                  update: { icon: Save, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20', glow: 'shadow-blue-500/20' },
                  create: { icon: PlusCircle, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/20', glow: 'shadow-emerald-500/20' },
                  upload: { icon: Upload, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-500/20', glow: 'shadow-indigo-500/20' },
                  download: { icon: Download, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-500/20', glow: 'shadow-cyan-500/20' },
                  vacation: { icon: Umbrella, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-500/20', glow: 'shadow-orange-500/20' },
                  iqama: { icon: IdCard, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20', glow: 'shadow-purple-500/20' },
                };
                const vc = variantConfig[modal.variant] || variantConfig.update;
                const Icon = vc.icon;
                return (
                  <div className="p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className={`mx-auto w-20 h-20 rounded-full ${vc.bg} flex items-center justify-center mb-5 shadow-lg ${vc.glow}`}
                    >
                      <Icon size={36} className={vc.color} />
                    </motion.div>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15 }}>
                      <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-3" />
                    </motion.div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3">{modal.title}</h3>
                    {modal.details && modal.details.length > 0 && (
                      <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 mb-5 space-y-1.5 border border-slate-100 dark:border-white/10">
                        {modal.details.map((d, i) => (
                          <p key={i} className="text-xs font-bold text-slate-500 dark:text-white/50 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            {d}
                          </p>
                        ))}
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setModal({ type: 'idle' })}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3.5 rounded-xl text-sm font-black shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      تم
                    </motion.button>
                  </div>
                );
              })()}

              {/* Error */}
              {modal.type === 'error' && (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-5"
                  >
                    <XCircle size={36} className="text-red-500" />
                  </motion.div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">{modal.title}</h3>
                  <p className="text-sm text-red-400 font-bold mb-6">{modal.message}</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setModal({ type: 'idle' })}
                    className="w-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-white py-3.5 rounded-xl text-sm font-black transition-all"
                  >
                    إغلاق
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function GlassField({ label, value, onChange, editable, type = "text", icon }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="bg-white/60 dark:bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-blue-500/30 transition-all group shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="text-slate-400 dark:text-white/40 group-hover:text-blue-500 transition-colors">{icon}</div>
        <label className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-wide">{label}</label>
      </div>
      {editable ? (
        <input 
          type={type} 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full bg-slate-100/50 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg py-2.5 px-3 text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
        />
      ) : (
        <div className="text-sm font-bold text-slate-900 dark:text-white min-h-[38px] flex items-center">{value || '---'}</div>
      )}
    </motion.div>
  );
}

  function GlassDocCard({ label, path, field, editable, employeeId, isCustom, customDocTypeId, expiryDate, router, setCustomDocuments, setCustomDocTypes }: any) {
    const imageUrl = getPublicUrl(path);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [localExpiry, setLocalExpiry] = useState(expiryDate || "");
  
    const handleUpload = async (file: File) => {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "employees");
        
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);
        
        if (isCustom) {
          await upsertEmployeeCustomDocument({
            employee_id: employeeId,
            document_name: label,
            file_path: data.url,
          });
          setCustomDocuments((prev: any[]) => {
            const idx = prev.findIndex((d: any) => d.document_name === label);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], file_path: data.url };
              return updated;
            }
            return [...prev, { employee_id: employeeId, document_name: label, file_path: data.url }];
          });
        } else {
          await updateEmployeeDocument(employeeId, field, data.url);
        }
        
        toast.success(`تم رفع ${label} بنجاح`);
        router.refresh();
      } catch (error: any) {
        toast.error("فشل رفع الملف: " + error.message);
      } finally {
        setIsUploading(false);
      }
    };

    const handleSaveExpiry = async () => {
      const res = await upsertEmployeeCustomDocument({
        employee_id: employeeId,
        document_name: label,
        expiry_date: localExpiry || undefined,
      });
      if (res.success) {
        toast.success("تم حفظ تاريخ الانتهاء");
        router.refresh();
      } else {
        toast.error("فشل الحفظ");
      }
    };

    const handleDeleteType = async () => {
      if (!confirm(`هل أنت متأكد من حذف نوع المستند "${label}"؟ سيتم حذف جميع الملفات المرتبطة.`)) return;
      const res = await deleteCustomDocumentType(customDocTypeId);
      if (res.success) {
        setCustomDocTypes((prev: any[]) => prev.filter((t: any) => t.id !== customDocTypeId));
        setCustomDocuments((prev: any[]) => prev.filter((d: any) => d.document_name !== label));
        toast.success("تم حذف نوع المستند");
        router.refresh();
      } else {
        toast.error("فشل حذف نوع المستند");
      }
    };

    const handleDownload = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!imageUrl) return;
      try {
        const extension = path?.split('.').pop() || 'jpg';
        const filename = `${label}.${extension}`;
        const downloadUrl = `/api/download?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("تم بدء التحميل");
      } catch (error) {
        toast.error("فشل تحميل الملف");
      }
    };

    return (
      <motion.div whileHover={{ scale: 1.02 }} className="group">
        <div 
          onClick={() => !editable && imageUrl && window.open(imageUrl, '_blank')}
          className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl aspect-video cursor-pointer hover:border-indigo-500/30 transition-all shadow-sm hover:shadow-lg"
        >
          {isUploading ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-indigo-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
              <span className="text-[11px] font-bold mt-2">جاري الرفع...</span>
            </div>
          ) : imageUrl ? (
            <>
              <img src={imageUrl} alt={label} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
              {!editable && (
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <div className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md transition-all border border-white/30">
                    <Eye size={24} className="text-white" />
                  </div>
                </div>
              )}
              {editable && (
                <div 
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                >
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-md border border-white/30">
                    <Upload size={24} className="text-white" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div 
              className={`h-full w-full flex flex-col items-center justify-center ${editable ? 'text-indigo-400 hover:text-indigo-600' : 'text-slate-400 dark:text-white/30'}`}
              onClick={(e) => { if (editable) { e.stopPropagation(); fileInputRef.current?.click(); } }}
            >
              {editable ? (
                <>
                  <Upload size={28} className="opacity-60" />
                  <span className="text-[11px] font-bold mt-2">اضغط لرفع ملف</span>
                </>
              ) : (
                <>
                  <FileText size={28} className="opacity-30" />
                  <span className="text-[11px] font-bold mt-2">لم يُرفع بعد</span>
                </>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-xs font-black text-slate-600 dark:text-white/70 text-center">{label}</p>
          {isCustom && editable && (
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={localExpiry}
                onChange={(e) => setLocalExpiry(e.target.value)}
                className="flex-1 text-[10px] font-bold bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="تاريخ الانتهاء"
              />
              {localExpiry !== (expiryDate || "") && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveExpiry}
                  className="bg-indigo-500 text-white p-1.5 rounded-lg"
                >
                  <Check size={12} />
                </motion.button>
              )}
            </div>
          )}
          {isCustom && !editable && expiryDate && (
            <p className="text-[10px] font-bold text-slate-500 text-center">
              ينتهي: {expiryDate}
            </p>
          )}
          <div className="flex gap-1">
            {imageUrl && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 border border-blue-500/20 transition-all"
              >
                <Download size={14} />
                تحميل
              </motion.button>
            )}
            {isCustom && editable && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDeleteType}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-600 py-2.5 px-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 border border-red-500/20 transition-all"
              >
                <Trash size={12} />
                حذف
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

function GlassStatBox({ label, value, color, unit = "" }: any) {
  const colors: any = {
    blue: "from-blue-600/10 to-indigo-600/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
    green: "from-emerald-600/10 to-teal-600/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    red: "from-red-600/10 to-rose-600/10 border-red-500/20 text-red-600 dark:text-red-400",
    purple: "from-purple-600/10 to-violet-600/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
    orange: "from-orange-600/10 to-amber-600/10 border-orange-500/20 text-orange-600 dark:text-orange-400"
  };
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`p-5 rounded-2xl border bg-gradient-to-br backdrop-blur-xl text-center shadow-sm ${colors[color]}`}
    >
      <p className="text-[10px] font-black uppercase tracking-wide opacity-70 mb-2">{label}</p>
      <div className="text-2xl font-black">{value.toLocaleString()}{unit && <span className="text-sm mr-1 font-bold opacity-70">{unit}</span>}</div>
    </motion.div>
  );
}
