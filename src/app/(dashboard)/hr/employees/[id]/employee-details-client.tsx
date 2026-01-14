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
  Camera,
  Briefcase,
  Globe,
  Phone,
  Hash,
  Car,
  Calendar,
  Building,
  University,
  Trophy,
  History,
  LayoutDashboard,
  ArrowRight,
  IdCard,
  PlusCircle,
  Info,
  Edit3,
  ArrowLeft,
  List,
  AlertTriangle,
  OctagonAlert,
  Eye,
  Umbrella,
  CheckCircle2,
  ShieldCheck,
  CalendarDays,
  Timer,
  Users,
  Search,
  Check,
  Trash
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
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
  
  // Clean the path
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If the path contains 'supabase' or is already a full URL, return as is
  if (path.includes('supabase')) {
    return path;
  }

  // Handle paths that might already have 'employees/' prefix for Supabase
  if (path.startsWith('employees/')) {
    const sPath = path.replace('employees/', '');
    return `https://xaexoopjqkrzhbochbef.supabase.co/storage/v1/object/public/employees/${sPath}`;
  }

  // Fallback to original server for all legacy data
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
  // Tab Configuration - Moved to top of component to ensure it's defined
  const tabConfig: Record<string, any> = {
    general: { icon: User, label: "المعلومات العامة", bg: "bg-blue-600", color: "blue", light: "bg-blue-50", text: "text-blue-600" },
    bank: { icon: University, label: "الحساب البنكي", bg: "bg-emerald-600", color: "emerald", light: "bg-emerald-50", text: "text-emerald-600" },
    status: { icon: ShieldCheck, label: "صلاحية الإقامة", bg: "bg-purple-600", color: "purple", light: "bg-purple-50", text: "text-purple-600" },
    documents: { icon: FileText, label: "المستندات", bg: "bg-indigo-600", color: "indigo", light: "bg-indigo-50", text: "text-indigo-600" },
    violations: { icon: AlertOctagon, label: "المخالفات", bg: "bg-red-600", color: "red", light: "bg-red-50", text: "text-red-600" },
    stats: { icon: BarChart3, label: "الإحصائيات", bg: "bg-slate-800", color: "slate", light: "bg-slate-50", text: "text-slate-800" },
    letters: { icon: Mail, label: "خطابات السائق", bg: "bg-rose-600", color: "rose", light: "bg-rose-50", text: "text-rose-600" },
  };

  const [activeTab, setActiveTab] = useState("general");
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showViolationForm, setShowViolationForm] = useState(false);
  const [showLetterForm, setShowLetterForm] = useState(false);
  const router = useRouter();

  // Navigation Logic
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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col h-[calc(100vh-140px)] space-y-4 max-w-[1800px] mx-auto px-4 overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-100 rounded-[2rem]" />
        <div className="h-20 bg-gray-100 rounded-2xl" />
        <div className="flex-1 bg-gray-100 rounded-3xl" />
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
    const result = await addViolation({
      employee_id: employee.id,
      ...newViolation
    });
    if (result.success) {
      toast.success("تم إضافة المخالفة بنجاح");
      setNewViolation({
        violation_type: "traffic",
        violation_date: format(new Date(), "yyyy-MM-dd"),
        violation_amount: 0,
        deducted_amount: 0,
        status: "pending",
        violation_description: ""
      });
      setShowViolationForm(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleDeleteViolation = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه المخالفة؟")) {
      const result = await deleteViolation(id, employee.id);
      if (result.success) {
        toast.success("تم حذف المخالفة");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    }
  };

  const handleUpdateViolation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingViolation) return;
    const result = await updateViolation(editingViolation.id, employee.id, editingViolation);
    if (result.success) {
      toast.success("تم تحديث المخالفة");
      setEditingViolation(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleAddLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addLetter({
      employee_id: employee.id,
      ...newLetter
    });
    if (result.success) {
      toast.success("تم إضافة الخطاب بنجاح");
      setNewLetter({
        letter_type: "annual_leave",
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: format(new Date(), "yyyy-MM-dd"),
        duration_days: 0,
        violation_amount: 0,
        letter_details: ""
      });
      setShowLetterForm(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleDeleteLetter = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الخطاب؟")) {
      const result = await deleteLetter(id, employee.id);
      if (result.success) {
        toast.success("تم حذف الخطاب");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    }
  };

  const handleUpdateLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLetter) return;
    const result = await updateLetter(editingLetter.id, employee.id, editingLetter);
    if (result.success) {
      toast.success("تم تحديث الخطاب");
      setEditingLetter(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleUpdateExpiry = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateIqamaExpiry(employee.id, newExpiryDate);
    if (result.success) {
      toast.success("تم تحديث تاريخ انتهاء الإقامة");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const activeConfig = tabConfig[activeTab] || tabConfig.general;

  // Iqama Status Logic
  let iqamaStatus = { text: "غير محددة", color: "gray", days: null };
  if (employee.iqama_expiry) {
    const days = differenceInDays(parseISO(employee.iqama_expiry), new Date());
    if (days < 0) {
      iqamaStatus = { text: `منتهية منذ ${Math.abs(days)} يوم`, color: "red", days };
    } else if (days <= 30) {
      iqamaStatus = { text: `تنتهي خلال ${days} يوم`, color: "orange", days };
    } else {
      iqamaStatus = { text: `سارية (${days} يوم متبقي)`, color: "green", days };
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-6 max-w-[1800px] mx-auto px-4 overflow-hidden py-4">
      
      {/* Profile Header */}
      <div className="bg-[#2c3e50] p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl border-b-4 border-yellow-500/20 shrink-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[200%] bg-white/20 rotate-12 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white/20 p-1 backdrop-blur-sm shadow-2xl overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:border-yellow-400/50 bg-[#34495e]/50">
              {getPublicUrl(employee.personal_photo) ? (
                <img 
                  src={getPublicUrl(employee.personal_photo)!} 
                  alt={employee.name} 
                  className="h-full w-full object-cover rounded-full transition-transform duration-700 group-hover:scale-110" 
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white/20">
                  <User size={64} className="group-hover:text-yellow-400/40 transition-colors" />
                </div>
              )}
            </div>
            <button className="absolute bottom-2 right-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 p-2.5 rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 border-2 border-[#2c3e50]">
              <Camera size={18} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-right gap-4">
            <div className="flex items-center gap-3 text-white/70 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md self-center md:self-start">
              <User className="text-yellow-400" size={14} />
              <h2 className="text-[9px] font-black tracking-widest uppercase">الملف الشخصي للموظف</h2>
            </div>

            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-2 drop-shadow-lg">
                {employee.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <div className="bg-[#1a2a3a]/60 backdrop-blur-md px-4 py-1.5 rounded-xl flex items-center gap-2.5 text-[10px] border border-white/5 shadow-lg group hover:border-yellow-400/30 transition-all">
                  <Hash className="text-yellow-500" size={12} />
                  <span className="text-white/60 font-bold">الكود:</span>
                  <span className="text-white font-black">{employee.user_code || '---'}</span>
                </div>
                <div className="bg-[#1a2a3a]/60 backdrop-blur-md px-4 py-1.5 rounded-xl flex items-center gap-2.5 text-[10px] border border-white/5 shadow-lg group hover:border-yellow-400/30 transition-all">
                  <Briefcase className="text-yellow-500" size={12} />
                  <span className="text-white/60 font-bold">الباقة:</span>
                  <span className="text-white font-black">{employee.group_name}</span>
                </div>
                <div className={`px-4 py-1.5 rounded-xl flex items-center gap-2.5 text-[10px] border shadow-lg transition-all ${
                  employee.is_active === 1 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                }`}>
                  <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${employee.is_active === 1 ? 'bg-green-400' : 'bg-orange-400'}`} />
                  <span className="font-black">{employee.is_active === 1 ? 'موظف نشط' : 'في إجازة'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 self-center md:self-start">
            <Link href={`/hr/packages/${employee.package_id}`}>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl text-[10px] font-black flex items-center justify-center gap-3 transition-all backdrop-blur-md border border-white/10 shadow-xl group active:scale-95">
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                <span>العودة للباقة</span>
              </button>
            </Link>
            <button 
              onClick={handleToggleStatus}
              className={`w-full px-6 py-3 rounded-2xl text-[10px] font-black transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 ${
                employee.is_active === 1 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {employee.is_active === 1 ? <Umbrella size={16} /> : <CheckCircle2 size={16} />}
              {employee.is_active === 1 ? 'تعيين إجازة' : 'تفعيل الموظف'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl shadow-xl border border-gray-100 shrink-0">
        <div className="flex gap-2">
          {prevEmployee ? (
            <Link href={`/hr/employees/${prevEmployee.id}`}>
              <button className="flex items-center gap-3 px-6 py-3 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-2xl transition-all border border-blue-100/50 group">
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                <div className="text-right">
                  <p className="text-[8px] font-black opacity-50 uppercase tracking-widest">السابق</p>
                  <p className="text-[10px] font-black">{prevEmployee.name}</p>
                </div>
              </button>
            </Link>
          ) : (
            <button disabled className="flex items-center gap-3 px-6 py-3 bg-gray-50 text-gray-300 rounded-2xl cursor-not-allowed opacity-50">
              <ChevronRight size={18} />
              <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-widest">السابق</p>
                <p className="text-[10px] font-black">لا يوجد</p>
              </div>
            </button>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 px-6 py-2 bg-blue-50 rounded-2xl border border-blue-100">
            <Users size={16} className="text-blue-600" />
            <span className="text-[10px] font-black text-blue-900">
              الموظف <span className="text-blue-600">{currentIndex + 1}</span> من <span className="text-blue-600">{allEmployees.length}</span>
            </span>
          </div>
          <button 
            onClick={() => setIsPopupOpen(true)}
            className="text-[9px] font-black text-blue-600 hover:text-blue-800 underline transition-colors"
          >
            عرض قائمة الموظفين
          </button>
        </div>

        <div className="flex gap-2">
          {nextEmployee ? (
            <Link href={`/hr/employees/${nextEmployee.id}`}>
              <button className="flex flex-row-reverse items-center gap-3 px-6 py-3 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-2xl transition-all border border-blue-100/50 group">
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <div className="text-left">
                  <p className="text-[8px] font-black opacity-50 uppercase tracking-widest">التالي</p>
                  <p className="text-[10px] font-black">{nextEmployee.name}</p>
                </div>
              </button>
            </Link>
          ) : (
            <button disabled className="flex flex-row-reverse items-center gap-3 px-6 py-3 bg-gray-50 text-gray-300 rounded-2xl cursor-not-allowed opacity-50">
              <ChevronLeft size={18} />
              <div className="text-left">
                <p className="text-[8px] font-black uppercase tracking-widest">التالي</p>
                <p className="text-[10px] font-black">لا يوجد</p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 overflow-x-auto pb-4 px-2 no-scrollbar shrink-0 justify-center">
        {Object.entries(tabConfig).map(([id, config]: [string, any]) => (
          <TabButton 
            key={id}
            id={id} 
            icon={<config.icon size={22} />} 
            label={config.label} 
            active={activeTab === id} 
            onClick={setActiveTab}
            config={config}
          />
        ))}
      </div>

      {/* Tab Content Container */}
      <div className="flex-1 bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100 flex flex-col min-h-0">
        <div className={`${activeConfig.bg} p-5 flex items-center justify-between shrink-0 transition-colors duration-500`}>
          <div className="flex items-center gap-4 text-white">
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md shadow-inner border border-white/10">
              <activeConfig.icon size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">{activeConfig.label}</h3>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-0.5">تفاصيل السجل والبيانات</p>
            </div>
          </div>
          <div className="flex gap-3">
            {(activeTab === "general" || activeTab === "bank") && (
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-gray-900 px-6 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2.5 transition-all shadow-xl hover:scale-105 active:scale-95 border border-white/20"
              >
                <Edit3 size={14} className={activeConfig.text} />
                {isEditing ? 'إلغاء التعديل' : 'تعديل البيانات'}
              </button>
            )}
            {activeTab === "violations" && (
              <button 
                onClick={() => setShowViolationForm(!showViolationForm)}
                className="bg-white text-gray-900 px-6 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2.5 transition-all shadow-xl hover:scale-105 active:scale-95 border border-white/20"
              >
                <PlusCircle size={14} className={activeConfig.text} />
                {showViolationForm ? 'إلغاء الإضافة' : 'إضافة مخالفة'}
              </button>
            )}
            {activeTab === "letters" && (
              <button 
                onClick={() => setShowLetterForm(!showLetterForm)}
                className="bg-white text-gray-900 px-6 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2.5 transition-all shadow-xl hover:scale-105 active:scale-95 border border-white/20"
              >
                <PlusCircle size={14} className={activeConfig.text} />
                {showLetterForm ? 'إلغاء الإضافة' : 'إضافة خطاب'}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === "general" && (
                <form onSubmit={handleUpdatePersonal} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-right">
                  <InfoField label="رقم الإقامة" value={personalInfo.iqama_number} onChange={(v: string) => setPersonalInfo({...personalInfo, iqama_number: v})} editable={isEditing} icon={<IdCard size={16} />} />
                  <InfoField label="رقم الهوية الوطنية" value={personalInfo.identity_number} onChange={(v: string) => setPersonalInfo({...personalInfo, identity_number: v})} editable={isEditing} icon={<IdCard size={16} />} />
                  <InfoField label="رقم المستخدم" value={personalInfo.user_code} onChange={(v: string) => setPersonalInfo({...personalInfo, user_code: v})} editable={isEditing} icon={<Hash size={16} />} />
                  <InfoField label="المسمى الوظيفي" value={personalInfo.job_title} onChange={(v: string) => setPersonalInfo({...personalInfo, job_title: v})} editable={isEditing} icon={<Briefcase size={16} />} />
                  <InfoField label="الجنسية" value={personalInfo.nationality} onChange={(v: string) => setPersonalInfo({...personalInfo, nationality: v})} editable={isEditing} icon={<Globe size={16} />} />
                  <InfoField label="رقم الهاتف" value={personalInfo.phone} onChange={(v: string) => setPersonalInfo({...personalInfo, phone: v})} editable={isEditing} icon={<Phone size={16} />} />
                  <InfoField label="البريد الإلكتروني" value={personalInfo.email} onChange={(v: string) => setPersonalInfo({...personalInfo, email: v})} editable={isEditing} type="email" icon={<Mail size={16} />} />
                  <InfoField label="لوحة المركبة" value={personalInfo.vehicle_plate} onChange={(v: string) => setPersonalInfo({...personalInfo, vehicle_plate: v})} editable={isEditing} icon={<Car size={16} />} />
                  <InfoField label="تاريخ الميلاد" value={personalInfo.birth_date} onChange={(v: string) => setPersonalInfo({...personalInfo, birth_date: v})} editable={isEditing} type="date" icon={<Calendar size={16} />} />
                  <InfoField label="رقم جواز السفر" value={personalInfo.passport_number} onChange={(v: string) => setPersonalInfo({...personalInfo, passport_number: v})} editable={isEditing} icon={<FileText size={16} />} />
                  <InfoField label="رقم كرت التشغيل" value={personalInfo.operation_card_number} onChange={(v: string) => setPersonalInfo({...personalInfo, operation_card_number: v})} editable={isEditing} icon={<IdCard size={16} />} />
                  <InfoField label="الراتب الأساسي" value={personalInfo.basic_salary} onChange={(v: string) => setPersonalInfo({...personalInfo, basic_salary: v})} editable={isEditing} icon={<CreditCard size={16} />} />
                  <InfoField label="بدل السكن" value={personalInfo.housing_allowance} onChange={(v: string) => setPersonalInfo({...personalInfo, housing_allowance: v})} editable={isEditing} icon={<Building size={16} />} />
                  
                  {isEditing && (
                    <div className="col-span-full pt-8 flex justify-center">
                      <button type="submit" className={`${activeConfig.bg} text-white px-12 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-blue-500/20`}>
                        <Save size={20} />
                        حفظ التغييرات
                      </button>
                    </div>
                  )}
                </form>
              )}

              {activeTab === "bank" && (
                <form onSubmit={handleUpdateBank} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-right">
                  <InfoField label="اسم البنك" value={bankInfo.bank_name} onChange={(v: string) => setBankInfo({...bankInfo, bank_name: v})} editable={isEditing} icon={<Building size={16} />} />
                  <InfoField label="رقم الحساب" value={bankInfo.bank_account} onChange={(v: string) => setBankInfo({...bankInfo, bank_account: v})} editable={isEditing} icon={<Hash size={16} />} />
                  <InfoField label="رقم الآيبان IBAN" value={bankInfo.iban} onChange={(v: string) => setBankInfo({...bankInfo, iban: v})} editable={isEditing} className="lg:col-span-1" icon={<CreditCard size={16} />} />
                  
                  {isEditing && (
                    <div className="col-span-full pt-8 flex justify-center">
                      <button type="submit" className={`${activeConfig.bg} text-white px-12 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-emerald-500/20`}>
                        <Save size={20} />
                        حفظ بيانات البنك
                      </button>
                    </div>
                  )}
                </form>
              )}

              {activeTab === "documents" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
                  <DocumentCard label="الصورة الشخصية" path={employee.personal_photo} />
                  <DocumentCard label="صورة الإقامة" path={employee.iqama_file} />
                  <DocumentCard label="رخصة القيادة" path={employee.license_file} />
                  <DocumentCard label="استمارة المركبة" path={employee.vehicle_file} />
                  <DocumentCard label="تصريح أجير" path={employee.agir_permit_file} />
                  <DocumentCard label="عقد العمل" path={employee.work_contract_file} />
                  <DocumentCard label="بطاقة التشغيل" path={employee.vehicle_operation_card} />
                </div>
              )}

                {activeTab === "status" && (
                  <div className="flex flex-col gap-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Iqama Days Countdown */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`relative p-10 rounded-[3rem] border-2 overflow-hidden group shadow-xl transition-all hover:shadow-2xl ${
                          iqamaStatus.color === 'red' ? 'bg-red-50 border-red-100 hover:border-red-200' :
                          iqamaStatus.color === 'orange' ? 'bg-orange-50 border-orange-100 hover:border-orange-200' :
                          'bg-green-50 border-green-100 hover:border-green-200'
                        }`}
                      >
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 flex flex-col items-center text-center gap-6">
                          <div className={`p-6 rounded-[2rem] shadow-2xl bg-white ${
                            iqamaStatus.color === 'red' ? 'text-red-600 shadow-red-100' :
                            iqamaStatus.color === 'orange' ? 'text-orange-600 shadow-orange-100' :
                            'text-green-600 shadow-green-100'
                          }`}>
                            <Timer size={48} className="animate-pulse-slow" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">الأيام المتبقية</p>
                            <div className="flex items-baseline justify-center gap-2">
                              <span className="text-6xl font-black tracking-tighter drop-shadow-sm">
                                {iqamaStatus.days !== null ? Math.abs(iqamaStatus.days) : '--'}
                              </span>
                              <span className="text-sm font-bold opacity-60">يوم</span>
                            </div>
                            <p className={`text-[11px] font-black mt-4 px-6 py-2 rounded-full inline-block ${
                              iqamaStatus.color === 'red' ? 'bg-red-100 text-red-600' :
                              iqamaStatus.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {iqamaStatus.text}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Iqama Status Card */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative p-10 rounded-[3rem] border-2 border-blue-100 bg-blue-50/50 overflow-hidden group shadow-xl transition-all hover:shadow-2xl hover:border-blue-200"
                      >
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-100/40 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 flex flex-col items-center text-center gap-6">
                          <div className="p-6 rounded-[2rem] shadow-2xl bg-white text-blue-600 shadow-blue-100">
                            <ShieldCheck size={48} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2">حالة صلاحية المستند</p>
                            <h4 className="text-4xl font-black text-blue-900 drop-shadow-sm">
                              {iqamaStatus.days !== null && iqamaStatus.days < 0 ? 'منتهية الصلاحية' : 'سارية الصلاحية'}
                            </h4>
                            <div className="flex items-center gap-3 mt-4 justify-center">
                              <div className={`h-2.5 w-2.5 rounded-full ${iqamaStatus.days !== null && iqamaStatus.days < 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-bounce'}`} />
                              <span className="text-xs font-black text-blue-700 uppercase tracking-widest">مراقب من النظام</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Update Expiry Card */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-10 rounded-[3rem] border-2 border-gray-100 shadow-xl flex flex-col gap-8 group"
                      >
                        <div className="flex items-center gap-5">
                          <div className="p-4 rounded-2xl bg-purple-50 text-purple-600 shadow-lg border border-purple-100 group-hover:rotate-12 transition-transform">
                            <CalendarDays size={28} />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-gray-900">تحديث التاريخ</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">تعديل يدوي للتاريخ</p>
                          </div>
                        </div>
                        <form onSubmit={handleUpdateExpiry} className="space-y-5">
                          <div className="relative">
                            <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                              type="date" 
                              value={newExpiryDate}
                              onChange={(e) => setNewExpiryDate(e.target.value)}
                              className="w-full bg-slate-50 border-2 border-gray-50 rounded-2xl py-4 pr-14 pl-6 text-sm font-black text-gray-800 focus:bg-white focus:border-purple-400 outline-none transition-all shadow-inner"
                              required
                            />
                          </div>
                          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl text-[11px] font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-purple-200 active:scale-95 group">
                            <Save size={18} className="group-hover:translate-y-[-2px] transition-transform" />
                            حفظ التاريخ الجديد
                          </button>
                        </form>
                      </motion.div>
                    </div>

                    {/* Information Alert */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-10 border border-white/5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[200%] bg-blue-500/20 rotate-45 blur-3xl" />
                      </div>
                      <div className="relative z-10 bg-white/10 p-6 rounded-[2rem] backdrop-blur-md border border-white/10 text-yellow-400 shadow-2xl">
                        <Info size={40} />
                      </div>
                      <div className="relative z-10 flex-1 space-y-4 text-center md:text-right">
                        <h4 className="text-2xl font-black tracking-tight flex items-center gap-3 justify-center md:justify-start">
                          <div className="h-2 w-12 bg-yellow-400 rounded-full" />
                          نظام مراقبة صلاحية الإقامة
                        </h4>
                        <p className="text-sm font-bold text-white/60 leading-relaxed max-w-3xl">
                          هذا النظام مرتبط بقاعدة البيانات الموحدة لإدارة الموارد البشرية. يتم إرسال تنبيهات تلقائية للنظام وللموظف عبر البريد الإلكتروني وتطبيق الجوال قبل 30 يوماً من انتهاء الصلاحية. يرجى التأكد من أن جميع الحقول صحيحة لتجنب أي تعقيدات قانونية أو غرامات مالية.
                        </p>
                      </div>
                      <div className="relative z-10 grid grid-cols-2 gap-4">
                        <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col items-center">
                          <span className="text-2xl font-black text-yellow-400">30</span>
                          <span className="text-[8px] font-black uppercase text-white/40 tracking-widest mt-1">يوم تنبيه</span>
                        </div>
                        <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col items-center">
                          <span className="text-2xl font-black text-red-400">0</span>
                          <span className="text-[8px] font-black uppercase text-white/40 tracking-widest mt-1">يوم سماح</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}



              {activeTab === "violations" && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <StatBox label="إجمالي المخالفات" value={violations.reduce((acc, v) => acc + Number(v.violation_amount), 0)} color="red" />
                      <StatBox label="تم خصمه" value={violations.reduce((acc, v) => acc + Number(v.deducted_amount), 0)} color="green" />
                      <StatBox label="المتبقي" value={violations.reduce((acc, v) => acc + Number(v.remaining_amount), 0)} color="blue" />
                    </div>

                    <AnimatePresence>
                      {(showViolationForm || editingViolation) && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-gray-100 space-y-6 overflow-hidden"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-2xl text-red-600 shadow-lg border border-red-50">
                              <PlusCircle size={24} />
                            </div>
                            <h4 className="text-lg font-black text-gray-900">{editingViolation ? "تعديل مخالفة" : "إضافة مخالفة جديدة"}</h4>
                          </div>
                          <form onSubmit={editingViolation ? handleUpdateViolation : handleAddViolation} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">نوع المخالفة</label>
                              <select 
                                value={editingViolation ? editingViolation.violation_type : newViolation.violation_type}
                                onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, violation_type: e.target.value}) : setNewViolation({...newViolation, violation_type: e.target.value})}
                                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3 px-5 text-xs font-black text-gray-800 focus:border-red-400 outline-none transition-all shadow-sm"
                              >
                                <option value="traffic">مرورية</option>
                                <option value="general">عامة</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">تاريخ المخالفة</label>
                              <input 
                                type="date"
                                value={editingViolation ? editingViolation.violation_date : newViolation.violation_date}
                                onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, violation_date: e.target.value}) : setNewViolation({...newViolation, violation_date: e.target.value})}
                                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3 px-5 text-xs font-black text-gray-800 focus:border-red-400 outline-none transition-all shadow-sm"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">المبلغ</label>
                              <input 
                                type="number"
                                value={editingViolation ? editingViolation.violation_amount : newViolation.violation_amount}
                                onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, violation_amount: Number(e.target.value)}) : setNewViolation({...newViolation, violation_amount: Number(e.target.value)})}
                                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3 px-5 text-xs font-black text-gray-800 focus:border-red-400 outline-none transition-all shadow-sm"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">المخصوم</label>
                              <input 
                                type="number"
                                value={editingViolation ? editingViolation.deducted_amount : newViolation.deducted_amount}
                                onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, deducted_amount: Number(e.target.value)}) : setNewViolation({...newViolation, deducted_amount: Number(e.target.value)})}
                                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3 px-5 text-xs font-black text-gray-800 focus:border-red-400 outline-none transition-all shadow-sm"
                                required
                              />
                            </div>
                            <div className="md:col-span-2 lg:col-span-3 space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">وصف المخالفة</label>
                              <input 
                                type="text"
                                value={editingViolation ? editingViolation.violation_description : newViolation.violation_description}
                                onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, violation_description: e.target.value}) : setNewViolation({...newViolation, violation_description: e.target.value})}
                                placeholder="مثال: تجاوز السرعة المحددة في طريق الملك فهد"
                                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3 px-5 text-xs font-black text-gray-800 focus:border-red-400 outline-none transition-all shadow-sm"
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl text-[10px] font-black flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95">
                                <PlusCircle size={16} />
                                {editingViolation ? "تحديث المخالفة" : "إضافة المخالفة"}
                              </button>
                              <button 
                                type="button" 
                                onClick={() => {setEditingViolation(null); setShowViolationForm(false);}}
                                className="px-4 py-3 bg-gray-200 text-gray-600 rounded-2xl text-[10px] font-black transition-all shadow-sm active:scale-95"
                              >
                                إلغاء
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="overflow-x-auto rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50">
                      <table className="w-full text-right">
                        <thead>
                          <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">تاريخ المخالفة</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">نوع المخالفة</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">المبلغ</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">المخصوم</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">المتبقي</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">الوصف</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {violations.map((v) => (
                            <tr key={v.id} className="hover:bg-slate-50/80 transition-all group">
                              <td className="px-8 py-5 text-xs font-bold text-gray-600">{v.violation_date}</td>
                              <td className="px-8 py-5 text-xs font-black text-gray-900">
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black ${v.violation_type === 'traffic' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                                  {v.violation_type === 'traffic' ? 'مرورية' : 'عامة'}
                                </span>
                              </td>
                              <td className="px-8 py-5 text-xs font-black text-red-600">{Number(v.violation_amount).toLocaleString('en-US')} ر.س</td>
                              <td className="px-8 py-5 text-xs font-black text-green-600">{Number(v.deducted_amount).toLocaleString('en-US')} ر.س</td>
                              <td className="px-8 py-5 text-xs font-black text-blue-600">{Number(v.remaining_amount).toLocaleString('en-US')} ر.س</td>
                              <td className="px-8 py-5 text-xs font-bold text-gray-500 max-w-xs truncate">{v.violation_description || '---'}</td>
                              <td className="px-8 py-5 text-center">
                                <div className="flex justify-center gap-2">
                                  <button 
                                    onClick={() => setEditingViolation(v)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteViolation(v.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  >
                                    <Trash size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                        {violations.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-8 py-16 text-center text-gray-300 font-bold">لا توجد سجلات للمخالفات حالياً</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "stats" && (
                <div className="space-y-12 pb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatBox label="إجمالي الطلبات" value={stats.total_orders} color="blue" />
                    <StatBox label="إجمالي الرواتب" value={stats.total_salary} color="green" unit="ر.س" />
                    <StatBox label="متوسط الطلبات" value={Math.round(stats.avg_orders)} color="purple" />
                    <StatBox label="عدد الشهور" value={stats.total_months} color="orange" />
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
                      <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600 shadow-indigo-100 shadow-lg">
                        <History size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900">السجل الشهري للأداء</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">تفاصيل الإنتاجية والرواتب</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50">
                      <table className="w-full text-right">
                        <thead>
                          <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">الشهر</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">الطلبات</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">التارجت</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">البونص</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">الخصومات</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">صافي الراتب</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {monthlyData.map((m, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition-all">
                              <td className="px-8 py-5 text-xs font-black text-gray-900">{m.payroll_month}</td>
                              <td className="px-8 py-5 text-xs font-black text-blue-600">{m.successful_orders}</td>
                              <td className="px-8 py-5 text-xs font-bold text-gray-600">{m.target}</td>
                              <td className="px-8 py-5 text-xs font-black text-green-600">+{m.bonus}</td>
                              <td className="px-8 py-5 text-xs font-black text-red-600">-{m.total_deduction}</td>
                              <td className="px-8 py-5 text-sm font-black text-gray-900 bg-gray-50/50">{Number(m.net_salary).toLocaleString('en-US')} ر.س</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

                {activeTab === "letters" && (
                  <div className="space-y-10">
                    <AnimatePresence>
                      {(showLetterForm || editingLetter) && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-gray-100 space-y-6 overflow-hidden"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-2xl text-rose-600 shadow-lg border border-rose-50">
                              <PlusCircle size={24} />
                            </div>
                            <h4 className="text-lg font-black text-gray-900">{editingLetter ? "تعديل خطاب" : "إضافة خطاب جديد"}</h4>
                          </div>
                          <form onSubmit={editingLetter ? handleUpdateLetter : handleAddLetter} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">نوع الخطاب</label>
                              <select 
                                value={editingLetter ? editingLetter.letter_type : newLetter.letter_type}
                                onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, letter_type: e.target.value}) : setNewLetter({...newLetter, letter_type: e.target.value})}
                                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3 px-5 text-xs font-black text-gray-800 focus:border-rose-400 outline-none transition-all shadow-sm"
                              >
                                <option value="annual_leave">إجازة سنوية</option>
                                <option value="sick_leave">إجازة مرضية</option>
                                <option value="personal_leave">إجازة شخصية</option>
                                <option value="absence">غياب دون سبب</option>
                                <option value="other">أخرى</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">تاريخ البداية</label>
                              <input 
                                type="date"
                                value={editingLetter ? editingLetter.start_date : newLetter.start_date}
                                onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, start_date: e.target.value}) : setNewLetter({...newLetter, start_date: e.target.value})}
                                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3 px-5 text-xs font-black text-gray-800 focus:border-rose-400 outline-none transition-all shadow-sm"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">تاريخ النهاية</label>
                              <input 
                                type="date"
                                value={editingLetter ? editingLetter.end_date : newLetter.end_date}
                                onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, end_date: e.target.value}) : setNewLetter({...newLetter, end_date: e.target.value})}
                                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3 px-5 text-xs font-black text-gray-800 focus:border-rose-400 outline-none transition-all shadow-sm"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">المدة (أيام)</label>
                              <input 
                                type="number"
                                value={editingLetter ? editingLetter.duration_days : newLetter.duration_days}
                                onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, duration_days: Number(e.target.value)}) : setNewLetter({...newLetter, duration_days: Number(e.target.value)})}
                                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3 px-5 text-xs font-black text-gray-800 focus:border-rose-400 outline-none transition-all shadow-sm"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">مبلغ المخالفة</label>
                              <input 
                                type="number"
                                value={editingLetter ? editingLetter.violation_amount : newLetter.violation_amount}
                                onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, violation_amount: Number(e.target.value)}) : setNewLetter({...newLetter, violation_amount: Number(e.target.value)})}
                                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3 px-5 text-xs font-black text-gray-800 focus:border-rose-400 outline-none transition-all shadow-sm"
                              />
                            </div>
                            <div className="md:col-span-3 space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">التفاصيل</label>
                              <textarea 
                                value={editingLetter ? editingLetter.letter_details : newLetter.letter_details}
                                onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, letter_details: e.target.value}) : setNewLetter({...newLetter, letter_details: e.target.value})}
                                rows={3}
                                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3 px-5 text-xs font-black text-gray-800 focus:border-rose-400 outline-none transition-all shadow-sm resize-none"
                                placeholder="اكتب تفاصيل الخطاب هنا..."
                              />
                            </div>
                            <div className="col-span-full flex justify-end gap-3">
                              <button 
                                type="button" 
                                onClick={() => {setEditingLetter(null); setShowLetterForm(false);}}
                                className="px-8 py-3 bg-gray-200 text-gray-600 rounded-2xl text-[10px] font-black transition-all shadow-sm active:scale-95"
                              >
                                إلغاء
                              </button>
                              <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white px-12 py-3 rounded-2xl text-[10px] font-black flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95">
                                <PlusCircle size={16} />
                                {editingLetter ? "تحديث الخطاب" : "حفظ الخطاب"}
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
                      {letters.map((l) => (
                        <div key={l.id} className="p-8 rounded-[2rem] bg-slate-50/50 border border-gray-100 space-y-6 hover:border-rose-200 transition-all group relative overflow-hidden shadow-sm hover:shadow-xl">
                          <div className="absolute top-0 left-0 w-2 h-full bg-rose-200" />
                          <div className="flex justify-between items-start">
                            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-rose-600 shadow-xl group-hover:scale-110 transition-transform border border-rose-50">
                              <Mail size={28} />
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setEditingLetter(l)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteLetter(l.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash size={16} />
                              </button>
                              <span className="px-4 py-2 rounded-xl bg-white text-[9px] font-black text-gray-400 uppercase border border-gray-100 shadow-sm tracking-widest">
                                {l.created_at}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-gray-900 mb-2">
                              {l.letter_type === 'annual_leave' ? 'إجازة سنوية' :
                               l.letter_type === 'sick_leave' ? 'إجازة مرضية' :
                               l.letter_type === 'personal_leave' ? 'إجازة شخصية' :
                               l.letter_type === 'absence' ? 'غياب دون سبب' : 'أخرى'}
                            </h4>
                            <div className="bg-white p-4 rounded-2xl border border-gray-50 shadow-inner">
                              <p className="text-xs font-bold text-gray-500 leading-relaxed">{l.letter_details || 'لا توجد تفاصيل'}</p>
                            </div>
                          </div>
                          <div className="pt-4 flex items-center justify-between">
                            <span className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-xl border border-gray-100 text-[10px] font-black text-gray-500">
                              <Calendar size={14} className="text-rose-400" />
                              {l.start_date} - {l.end_date} ({l.duration_days} أيام)
                            </span>
                            {l.violation_amount > 0 && (
                              <span className="flex items-center gap-2.5 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl border border-rose-100 text-[10px] font-black">
                                <AlertTriangle size={14} />
                                المخالفة: {Number(l.violation_amount).toLocaleString('en-US')} ر.س
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {letters.length === 0 && (
                        <div className="col-span-full py-24 text-center text-gray-300 font-bold bg-slate-50/50 rounded-[2.5rem] border-4 border-dashed border-gray-100">
                          <Mail size={48} className="mx-auto mb-4 opacity-10" />
                          <p className="text-sm">لا يوجد سجل خطابات لهذا الموظف</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Employee List Popup */}

      <AnimatePresence>
        {isPopupOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPopupOpen(false)}
              className="absolute inset-0 bg-[#2c3e50]/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[80vh]"
            >
              <div className="bg-[#2c3e50] p-8 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-4 text-white">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">قائمة الموظفين</h3>
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">البحث والتنقل السريع</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPopupOpen(false)}
                  className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-2xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6 flex-1 flex flex-col min-h-0">
                <div className="relative group shrink-0">
                  <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="ابحث باسم الموظف أو رقم الإقامة..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-gray-50 rounded-[2rem] py-5 pr-16 pl-8 text-sm font-black text-gray-800 focus:bg-white focus:border-blue-400 focus:ring-8 focus:ring-blue-50 outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="flex-1 overflow-auto pr-2 no-scrollbar space-y-3">
                  {filteredEmployees.map((emp) => (
                    <Link 
                      key={emp.id} 
                      href={`/hr/employees/${emp.id}`}
                      onClick={() => setIsPopupOpen(false)}
                    >
                      <div className={`p-5 rounded-[1.5rem] border-2 transition-all flex items-center justify-between group ${
                        emp.id === employee.id 
                        ? 'bg-blue-50 border-blue-200 shadow-lg' 
                        : 'bg-white border-gray-50 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5'
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
                            emp.id === employee.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                          }`}>
                            <User size={20} />
                          </div>
                          <div>
                            <h4 className={`text-sm font-black transition-colors ${emp.id === employee.id ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-600'}`}>{emp.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-bold text-gray-400">كود: <span className="text-gray-600">{emp.user_code || '---'}</span></span>
                              <span className="text-[10px] font-bold text-gray-400">إقامة: <span className="text-gray-600">{emp.iqama_number || '---'}</span></span>
                            </div>
                          </div>
                        </div>
                        {emp.id === employee.id ? (
                          <div className="bg-blue-600 text-white p-2 rounded-full">
                            <Check size={16} />
                          </div>
                        ) : (
                          <ChevronLeft className="text-gray-300 group-hover:text-blue-400 transition-all group-hover:-translate-x-1" size={20} />
                        )}
                      </div>
                    </Link>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <div className="py-12 text-center text-gray-400 font-black italic">لا يوجد نتائج للبحث...</div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-gray-100 flex items-center justify-between shrink-0">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إجمالي الموظفين في الباقة: {allEmployees.length}</span>
                <button 
                  onClick={() => setIsPopupOpen(false)}
                  className="bg-white text-gray-900 px-8 py-3 rounded-2xl text-[10px] font-black border border-gray-200 shadow-md hover:bg-gray-50 transition-all"
                >
                  إغلاق القائمة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ id, icon, label, active, onClick, config }: any) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex flex-col items-center justify-center gap-3 min-w-[125px] h-[125px] rounded-[2rem] transition-all duration-500 group relative border-2 ${
        active 
        ? `${config.bg} text-white shadow-2xl shadow-${config.color}-500/30 scale-105 border-white/20` 
        : `bg-white border-gray-50 text-gray-400 hover:text-${config.color}-600 hover:border-${config.color}-200 hover:shadow-xl hover:scale-102`
      }`}
    >
      <div className={`p-3 rounded-2xl transition-all duration-500 ${active ? 'bg-white/20 scale-110 shadow-inner' : `${config.light} ${config.text} group-hover:scale-110 shadow-sm`}`}>
        {icon}
      </div>
      <span className={`text-[11px] font-black text-center px-4 leading-tight tracking-wide transition-colors duration-500 ${active ? 'text-white' : 'text-gray-500'}`}>{label}</span>
      {active && (
        <motion.div 
          layoutId="tab-indicator"
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-yellow-400 rounded-full shadow-lg z-20" 
        />
      )}
    </button>
  );
}

function InfoField({ label, value, onChange, editable, type = "text", className = "", icon }: any) {
  return (
    <div className={`group relative bg-slate-50/50 p-6 rounded-[2.5rem] border-2 border-gray-50 hover:border-blue-100 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-white p-3 rounded-2xl text-gray-400 group-hover:text-blue-500 group-hover:scale-110 transition-all shadow-sm border border-gray-50">
          {icon}
        </div>
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover:text-blue-600 transition-colors">
          {label}
        </label>
      </div>
      
      {editable ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 px-6 text-sm font-black text-gray-800 focus:border-blue-400 focus:ring-8 focus:ring-blue-50 outline-none transition-all shadow-sm"
        />
      ) : (
        <div className="w-full bg-white/80 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-black text-gray-900 min-h-[64px] flex items-center shadow-inner group-hover:bg-white transition-all">
          {value || '---'}
        </div>
      )}
    </div>
  );
}


function DocumentCard({ label, path }: any) {
  const imageUrl = getPublicUrl(path);

  const handleView = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className="group space-y-4">
      <div 
        onClick={handleView}
        className="relative overflow-hidden rounded-[2.5rem] border-8 border-white shadow-2xl bg-slate-50 flex items-center justify-center cursor-pointer transition-all hover:shadow-indigo-200/50 hover:scale-[1.02] aspect-video"
      >
        {imageUrl ? (
          <>
            <img src={imageUrl} alt={label} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
              <div className="h-12 px-8 rounded-2xl bg-white text-indigo-900 text-[11px] font-black flex items-center gap-3 shadow-2xl hover:scale-110 transition-all">
                <Eye size={18} />
                عرض المستند بالكامل
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 text-gray-200">
            <div className="bg-white/50 p-6 rounded-[2rem] shadow-inner">
              <FileText size={48} className="opacity-20" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">لم يتم الرفع</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="flex flex-col">
          <span className="text-xs font-black text-gray-900 uppercase tracking-tight">{label}</span>
          <span className="text-[9px] font-bold text-gray-400 uppercase">ملف مستند رسمي</span>
        </div>
        {imageUrl && (
          <button 
            onClick={handleView}
            className="h-10 w-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center shadow-md hover:shadow-indigo-500/30"
          >
            <Eye size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, color, unit = "" }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-700 border-blue-100 shadow-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100",
    red: "bg-red-50 text-red-700 border-red-100 shadow-red-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100 shadow-purple-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100 shadow-orange-100"
  };

  return (
    <div className={`p-8 rounded-[2rem] border-2 ${colors[color]} text-center space-y-2 shadow-xl hover:scale-[1.05] transition-all cursor-default group relative overflow-hidden`}>
      <div className="absolute -top-6 -right-6 w-12 h-12 bg-white/20 rounded-full blur-xl" />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">{label}</p>
      <div className="text-3xl font-black tracking-tighter">
        {value.toLocaleString('en-US')}
        {unit && <span className="text-xs mr-1 font-bold opacity-70">{unit}</span>}
      </div>
    </div>
  );
}
