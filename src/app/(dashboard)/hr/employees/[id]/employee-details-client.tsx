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
  Umbrella,
  CheckCircle2,
  ShieldCheck,
  CalendarDays,
  Timer,
  Users,
  Search,
  Check,
  Trash,
  Sparkles
} from "lucide-react";
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
  updateLetter
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
  return `https://accounts.zoolspeed.com/${cleanPath}`;
}

export function EmployeeDetailsClient({ 
  employee, 
  allEmployees, 
  violations, 
  letters, 
  stats, 
  monthlyData 
}: EmployeeDetailsClientProps) {
  const tabConfig: Record<string, any> = {
    general: { icon: User, label: "البيانات الشخصية", bg: "from-blue-600 to-indigo-600", color: "blue", light: "bg-blue-500/10", text: "text-blue-400", glow: "shadow-blue-500/20" },
    bank: { icon: University, label: "البيانات البنكية", bg: "from-emerald-600 to-teal-600", color: "emerald", light: "bg-emerald-500/10", text: "text-emerald-400", glow: "shadow-emerald-500/20" },
    status: { icon: ShieldCheck, label: "حالة الإقامة", bg: "from-purple-600 to-violet-600", color: "purple", light: "bg-purple-500/10", text: "text-purple-400", glow: "shadow-purple-500/20" },
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
  const router = useRouter();

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
    identity_number: employee.identity_number || "",
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

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-100px)] max-w-[94%] mx-auto animate-pulse gap-5">
        <div className="w-80 bg-muted/50 rounded-3xl shrink-0 backdrop-blur-xl" />
        <div className="flex-1 bg-muted/50 rounded-3xl backdrop-blur-xl" />
      </div>
    );
  }

  const handleUpdatePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateEmployeePersonalInfo(employee.id, personalInfo);
    if (result.success) {
      toast.success("تم تحديث المعلومات الشخصية");
      setIsEditing(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleUpdateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateEmployeeBankInfo(employee.id, bankInfo);
    if (result.success) {
      toast.success("تم تحديث معلومات البنك");
      setIsEditing(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleToggleStatus = async () => {
    const result = await toggleEmployeeStatus(employee.id, employee.is_active);
    if (result.success) {
      toast.success(employee.is_active === 1 ? "تم تعيين الموظف في إجازة" : "تم تفعيل الموظف");
      router.refresh();
    }
  };

  const handleAddViolation = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addViolation({ employee_id: employee.id, ...newViolation });
    if (result.success) {
      toast.success("تم إضافة المخالفة بنجاح");
      setNewViolation({ violation_type: "traffic", violation_date: format(new Date(), "yyyy-MM-dd"), violation_amount: 0, deducted_amount: 0, status: "pending", violation_description: "" });
      setShowViolationForm(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleDeleteViolation = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه المخالفة؟")) {
      const result = await deleteViolation(id, employee.id);
      if (result.success) { toast.success("تم حذف المخالفة"); router.refresh(); } else { toast.error(result.error); }
    }
  };

  const handleUpdateViolation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingViolation) return;
    const result = await updateViolation(editingViolation.id, employee.id, editingViolation);
    if (result.success) { toast.success("تم تحديث المخالفة"); setEditingViolation(null); router.refresh(); } else { toast.error(result.error); }
  };

  const handleAddLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addLetter({ employee_id: employee.id, ...newLetter });
    if (result.success) {
      toast.success("تم إضافة الخطاب بنجاح");
      setNewLetter({ letter_type: "annual_leave", start_date: format(new Date(), "yyyy-MM-dd"), end_date: format(new Date(), "yyyy-MM-dd"), duration_days: 0, violation_amount: 0, letter_details: "" });
      setShowLetterForm(false);
      router.refresh();
    } else { toast.error(result.error); }
  };

  const handleDeleteLetter = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الخطاب؟")) {
      const result = await deleteLetter(id, employee.id);
      if (result.success) { toast.success("تم حذف الخطاب"); router.refresh(); } else { toast.error(result.error); }
    }
  };

  const handleUpdateLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLetter) return;
    const result = await updateLetter(editingLetter.id, employee.id, editingLetter);
    if (result.success) { toast.success("تم تحديث الخطاب"); setEditingLetter(null); router.refresh(); } else { toast.error(result.error); }
  };

  const handleUpdateExpiry = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateIqamaExpiry(employee.id, newExpiryDate);
    if (result.success) { toast.success("تم تحديث تاريخ انتهاء الإقامة"); router.refresh(); } else { toast.error(result.error); }
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
        className="flex h-[calc(100vh-100px)] max-w-[94%] mx-auto gap-5 overflow-hidden"
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
                  <span className="text-white/60 flex items-center gap-2"><IdCard size={14} className="text-white/80" /> الإقامة</span>
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
              {(activeTab === "general" || activeTab === "bank") && (
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/95 hover:bg-white text-slate-900 px-6 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-xl shadow-black/10"
                >
                  <Edit3 size={15} />
                  {isEditing ? 'إلغاء التعديل' : 'تعديل البيانات'}
                </motion.button>
              )}

            {activeTab === "violations" && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowViolationForm(!showViolationForm)}
                className="bg-white/90 hover:bg-white text-gray-900 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg"
              >
                <PlusCircle size={14} />
                {showViolationForm ? 'إلغاء' : 'إضافة مخالفة'}
              </motion.button>
            )}
            {activeTab === "letters" && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLetterForm(!showLetterForm)}
                className="bg-white/90 hover:bg-white text-gray-900 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg"
              >
                <PlusCircle size={14} />
                {showLetterForm ? 'إلغاء' : 'إضافة خطاب'}
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
                    <GlassField label="رقم الإقامة" value={personalInfo.iqama_number} onChange={(v: string) => setPersonalInfo({...personalInfo, iqama_number: v})} editable={isEditing} icon={<IdCard size={14} />} />
                    <GlassField label="رقم الهوية" value={personalInfo.identity_number} onChange={(v: string) => setPersonalInfo({...personalInfo, identity_number: v})} editable={isEditing} icon={<IdCard size={14} />} />
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
                <form onSubmit={handleUpdateBank}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl">
                    <GlassField label="اسم البنك" value={bankInfo.bank_name} onChange={(v: string) => setBankInfo({...bankInfo, bank_name: v})} editable={isEditing} icon={<Building size={14} />} />
                    <GlassField label="رقم الحساب" value={bankInfo.bank_account} onChange={(v: string) => setBankInfo({...bankInfo, bank_account: v})} editable={isEditing} icon={<Hash size={14} />} />
                    <GlassField label="رقم الآيبان" value={bankInfo.iban} onChange={(v: string) => setBankInfo({...bankInfo, iban: v})} editable={isEditing} icon={<CreditCard size={14} />} />
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
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-10 py-3 rounded-xl font-black text-sm flex items-center gap-3 shadow-lg shadow-emerald-500/30"
                      >
                        <Save size={18} />
                        حفظ بيانات البنك
                      </motion.button>
                    </motion.div>
                  )}
                </form>
              )}

              {activeTab === "documents" && (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  <GlassDocCard label="الصورة الشخصية" path={employee.personal_photo} />
                  <GlassDocCard label="صورة الإقامة" path={employee.iqama_file} />
                  <GlassDocCard label="رخصة القيادة" path={employee.license_file} />
                  <GlassDocCard label="استمارة المركبة" path={employee.vehicle_file} />
                  <GlassDocCard label="تصريح أجير" path={employee.agir_permit_file} />
                  <GlassDocCard label="عقد العمل" path={employee.work_contract_file} />
                  <GlassDocCard label="بطاقة التشغيل" path={employee.vehicle_operation_card} />
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
                        <span className="text-xs font-black text-white/70 uppercase">الأيام المتبقية</span>
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
                        <span className="text-xs font-black text-white/70 uppercase">حالة الصلاحية</span>
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
                        <span className="text-xs font-black text-white/70 uppercase">تحديث التاريخ</span>
                      </div>
                      <form onSubmit={handleUpdateExpiry} className="space-y-3">
                        <input 
                          type="date" 
                          value={newExpiryDate}
                          onChange={(e) => setNewExpiryDate(e.target.value)}
                          className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-purple-400 outline-none transition-all"
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
                      <h4 className="text-base font-black mb-1">نظام مراقبة الإقامة الذكي</h4>
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
                        className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 overflow-hidden"
                      >
                        <form onSubmit={editingViolation ? handleUpdateViolation : handleAddViolation} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <select value={editingViolation ? editingViolation.violation_type : newViolation.violation_type} onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, violation_type: e.target.value}) : setNewViolation({...newViolation, violation_type: e.target.value})} className="bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-red-400 outline-none">
                            <option value="traffic" className="bg-slate-800">مرورية</option>
                            <option value="general" className="bg-slate-800">عامة</option>
                          </select>
                          <input type="date" value={editingViolation ? editingViolation.violation_date : newViolation.violation_date} onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, violation_date: e.target.value}) : setNewViolation({...newViolation, violation_date: e.target.value})} className="bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-red-400 outline-none" required />
                          <input type="number" placeholder="المبلغ" value={editingViolation ? editingViolation.violation_amount : newViolation.violation_amount} onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, violation_amount: Number(e.target.value)}) : setNewViolation({...newViolation, violation_amount: Number(e.target.value)})} className="bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder-white/30 focus:border-red-400 outline-none" required />
                          <input type="number" placeholder="المخصوم" value={editingViolation ? editingViolation.deducted_amount : newViolation.deducted_amount} onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, deducted_amount: Number(e.target.value)}) : setNewViolation({...newViolation, deducted_amount: Number(e.target.value)})} className="bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder-white/30 focus:border-red-400 outline-none" required />
                          <input type="text" placeholder="الوصف" value={editingViolation ? editingViolation.violation_description : newViolation.violation_description} onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, violation_description: e.target.value}) : setNewViolation({...newViolation, violation_description: e.target.value})} className="bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder-white/30 focus:border-red-400 outline-none col-span-2 md:col-span-3" />
                          <div className="flex gap-3">
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 rounded-xl text-sm font-black shadow-lg shadow-red-500/30">{editingViolation ? 'تحديث' : 'إضافة'}</motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => {setEditingViolation(null); setShowViolationForm(false);}} className="px-4 bg-white/10 rounded-xl text-sm font-bold text-white/70 hover:bg-white/20">✕</motion.button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="px-5 py-4 text-xs font-black text-white/50 uppercase">التاريخ</th>
                          <th className="px-5 py-4 text-xs font-black text-white/50 uppercase">النوع</th>
                          <th className="px-5 py-4 text-xs font-black text-white/50 uppercase">المبلغ</th>
                          <th className="px-5 py-4 text-xs font-black text-white/50 uppercase">المخصوم</th>
                          <th className="px-5 py-4 text-xs font-black text-white/50 uppercase">المتبقي</th>
                          <th className="px-5 py-4 text-xs font-black text-white/50 uppercase text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {violations.map((v, idx) => (
                          <motion.tr 
                            key={v.id} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="hover:bg-white/5 transition-all"
                          >
                            <td className="px-5 py-4 font-bold text-white/80">{v.violation_date}</td>
                            <td className="px-5 py-4"><span className={`px-3 py-1 rounded-lg text-xs font-black ${v.violation_type === 'traffic' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>{v.violation_type === 'traffic' ? 'مرورية' : 'عامة'}</span></td>
                            <td className="px-5 py-4 font-black text-red-400">{Number(v.violation_amount).toLocaleString()} ر.س</td>
                            <td className="px-5 py-4 font-black text-emerald-400">{Number(v.deducted_amount).toLocaleString()} ر.س</td>
                            <td className="px-5 py-4 font-black text-blue-400">{Number(v.remaining_amount).toLocaleString()} ر.س</td>
                            <td className="px-5 py-4">
                              <div className="flex justify-center gap-2">
                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setEditingViolation(v)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg"><Edit3 size={14} /></motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDeleteViolation(v.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash size={14} /></motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                        {violations.length === 0 && (
                          <tr><td colSpan={6} className="px-5 py-12 text-center text-white/30 font-bold">لا توجد مخالفات مسجلة</td></tr>
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

                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="px-5 py-4 text-xs font-black text-white/50 uppercase">الشهر</th>
                          <th className="px-5 py-4 text-xs font-black text-white/50 uppercase">الطلبات</th>
                          <th className="px-5 py-4 text-xs font-black text-white/50 uppercase">التارجت</th>
                          <th className="px-5 py-4 text-xs font-black text-white/50 uppercase">البونص</th>
                          <th className="px-5 py-4 text-xs font-black text-white/50 uppercase">الخصومات</th>
                          <th className="px-5 py-4 text-xs font-black text-white/50 uppercase">صافي الراتب</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {monthlyData.map((m, idx) => (
                          <motion.tr 
                            key={idx} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="hover:bg-white/5"
                          >
                            <td className="px-5 py-4 font-black text-white">{m.payroll_month}</td>
                            <td className="px-5 py-4 font-black text-blue-400">{m.successful_orders}</td>
                            <td className="px-5 py-4 font-bold text-white/50">{m.target}</td>
                            <td className="px-5 py-4 font-black text-emerald-400">+{m.bonus}</td>
                            <td className="px-5 py-4 font-black text-red-400">-{m.total_deduction}</td>
                            <td className="px-5 py-4 font-black text-white bg-white/5">{Number(m.net_salary).toLocaleString()} ر.س</td>
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
                        className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 overflow-hidden"
                      >
                        <form onSubmit={editingLetter ? handleUpdateLetter : handleAddLetter} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <select value={editingLetter ? editingLetter.letter_type : newLetter.letter_type} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, letter_type: e.target.value}) : setNewLetter({...newLetter, letter_type: e.target.value})} className="bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-rose-400 outline-none">
                            <option value="annual_leave" className="bg-slate-800">إجازة سنوية</option>
                            <option value="sick_leave" className="bg-slate-800">إجازة مرضية</option>
                            <option value="personal_leave" className="bg-slate-800">إجازة شخصية</option>
                            <option value="absence" className="bg-slate-800">غياب</option>
                            <option value="other" className="bg-slate-800">أخرى</option>
                          </select>
                          <input type="date" placeholder="البداية" value={editingLetter ? editingLetter.start_date : newLetter.start_date} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, start_date: e.target.value}) : setNewLetter({...newLetter, start_date: e.target.value})} className="bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-rose-400 outline-none" required />
                          <input type="date" placeholder="النهاية" value={editingLetter ? editingLetter.end_date : newLetter.end_date} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, end_date: e.target.value}) : setNewLetter({...newLetter, end_date: e.target.value})} className="bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-rose-400 outline-none" required />
                          <input type="number" placeholder="المدة (أيام)" value={editingLetter ? editingLetter.duration_days : newLetter.duration_days} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, duration_days: Number(e.target.value)}) : setNewLetter({...newLetter, duration_days: Number(e.target.value)})} className="bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder-white/30 focus:border-rose-400 outline-none" required />
                          <input type="number" placeholder="مبلغ المخالفة" value={editingLetter ? editingLetter.violation_amount : newLetter.violation_amount} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, violation_amount: Number(e.target.value)}) : setNewLetter({...newLetter, violation_amount: Number(e.target.value)})} className="bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder-white/30 focus:border-rose-400 outline-none" />
                          <textarea placeholder="التفاصيل" value={editingLetter ? editingLetter.letter_details : newLetter.letter_details} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, letter_details: e.target.value}) : setNewLetter({...newLetter, letter_details: e.target.value})} rows={1} className="bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder-white/30 focus:border-rose-400 outline-none col-span-2 md:col-span-3" />
                          <div className="col-span-2 md:col-span-3 flex justify-end gap-3">
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => {setEditingLetter(null); setShowLetterForm(false);}} className="px-5 py-3 bg-white/10 rounded-xl text-sm font-bold text-white/70 hover:bg-white/20">إلغاء</motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="px-8 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl text-sm font-black shadow-lg shadow-rose-500/30">{editingLetter ? 'تحديث' : 'حفظ'}</motion.button>
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
                        className="p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-rose-500/30 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-rose-500 to-pink-500 rounded-r-xl" />
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400"><Mail size={18} /></div>
                            <div>
                              <h4 className="text-base font-black text-white">
                                {l.letter_type === 'annual_leave' ? 'إجازة سنوية' : l.letter_type === 'sick_leave' ? 'إجازة مرضية' : l.letter_type === 'personal_leave' ? 'إجازة شخصية' : l.letter_type === 'absence' ? 'غياب' : 'أخرى'}
                              </h4>
                              <span className="text-[11px] font-bold text-white/40">{l.created_at}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <motion.button whileHover={{ scale: 1.1 }} onClick={() => setEditingLetter(l)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg"><Edit3 size={14} /></motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDeleteLetter(l.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash size={14} /></motion.button>
                          </div>
                        </div>
                        {l.letter_details && <p className="text-xs font-bold text-white/50 mb-3 bg-white/5 p-3 rounded-xl">{l.letter_details}</p>}
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-white/50"><Calendar size={14} className="text-rose-400" /> {l.start_date} - {l.end_date} ({l.duration_days} أيام)</span>
                          {l.violation_amount > 0 && <span className="text-rose-400 font-bold bg-rose-500/10 px-3 py-1 rounded-lg">مخالفة: {Number(l.violation_amount).toLocaleString()} ر.س</span>}
                        </div>
                      </motion.div>
                    ))}
                    {letters.length === 0 && (
                      <div className="col-span-full py-16 text-center text-white/30 font-bold bg-white/5 backdrop-blur-xl rounded-2xl border-2 border-dashed border-white/10">
                        <Mail size={40} className="mx-auto mb-3 opacity-30" />
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
                  <input type="text" placeholder="بحث بالاسم أو رقم الإقامة..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-11 pl-4 text-sm font-bold text-white placeholder-white/30 focus:border-blue-400 outline-none" />
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

function GlassDocCard({ label, path }: any) {
  const imageUrl = getPublicUrl(path);
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <div onClick={() => imageUrl && window.open(imageUrl, '_blank')} className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl aspect-video cursor-pointer hover:border-indigo-500/30 transition-all shadow-sm hover:shadow-lg">
        {imageUrl ? (
          <>
            <img src={imageUrl} alt={label} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-indigo-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
              <Eye size={24} className="text-white" />
            </div>
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 dark:text-white/30">
            <FileText size={28} className="opacity-30" />
            <span className="text-[11px] font-bold mt-2">لم يُرفع بعد</span>
          </div>
        )}
      </div>
      <p className="text-xs font-black text-slate-600 dark:text-white/70 mt-2 text-center">{label}</p>
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
