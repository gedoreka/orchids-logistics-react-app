"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  CreditCard, 
  FileText, 
  Mail, 
  BarChart3, 
  Save, 
  X, 
  Camera,
  Briefcase,
  Globe,
  Phone,
  Hash,
  Car,
  Calendar,
  Building,
  University,
  History,
  ArrowRight,
  IdCard,
  PlusCircle,
  Info,
  Edit3,
  AlertTriangle,
  OctagonAlert,
  Eye,
  Umbrella,
  CheckCircle2,
  ShieldCheck,
  CalendarDays,
  Timer,
  Trash2,
  Edit2
} from "lucide-react";
import { format } from "date-fns";
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
  deleteLetter
} from "@/lib/actions/hr";
import Link from "next/link";
import { useRouter } from "next/navigation";

const getPublicUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  if (path.includes('supabase')) return path;
  return `https://accounts.zoolspeed.com/${cleanPath}`;
};

interface EmployeeDetailsClientProps {
  employee: any;
  allEmployees: any[];
  violations: any[];
  letters: any[];
  stats: any;
  monthlyData: any[];
}

const tabConfig: any = {
  general: { label: "العامة", icon: User, color: "blue", bg: "bg-gradient-to-br from-blue-500 to-blue-700", text: "text-blue-600", light: "bg-blue-50" },
  bank: { label: "البنك", icon: University, color: "emerald", bg: "bg-gradient-to-br from-emerald-500 to-emerald-700", text: "text-emerald-600", light: "bg-emerald-50" },
  documents: { label: "المستندات", icon: FileText, color: "amber", bg: "bg-gradient-to-br from-amber-500 to-amber-700", text: "text-amber-600", light: "bg-amber-50" },
  violations: { label: "المخالفات", icon: OctagonAlert, color: "red", bg: "bg-gradient-to-br from-red-500 to-red-700", text: "text-red-600", light: "bg-red-50" },
  status: { label: "الإقامة", icon: IdCard, color: "purple", bg: "bg-gradient-to-br from-purple-500 to-purple-700", text: "text-purple-600", light: "bg-purple-50" },
  stats: { label: "الأداء", icon: BarChart3, color: "indigo", bg: "bg-gradient-to-br from-indigo-500 to-indigo-700", text: "text-indigo-600", light: "bg-indigo-50" },
  letters: { label: "الخطابات", icon: Mail, color: "rose", bg: "bg-gradient-to-br from-rose-500 to-rose-700", text: "text-rose-600", light: "bg-rose-50" },
};

export function EmployeeDetailsClient({ 
  employee, 
  allEmployees, 
  violations, 
  letters, 
  stats, 
  monthlyData 
}: EmployeeDetailsClientProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

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

  const [violationForm, setViolationForm] = useState({
    violation_type: "traffic",
    violation_date: new Date().toISOString().split('T')[0],
    violation_amount: "",
    deducted_amount: "0",
    status: "pending",
    violation_description: ""
  });

  const [letterForm, setLetterForm] = useState({
    letter_type: "",
    start_date: "",
    end_date: "",
    duration_days: "",
    violation_amount: "0",
    letter_details: ""
  });

  const [iqamaExpiry, setIqamaExpiry] = useState(
    employee.iqama_expiry ? (() => {
      const d = new Date(employee.iqama_expiry);
      return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : "";
    })() : ""
  );

  const [showViolationForm, setShowViolationForm] = useState(false);
  const [showLetterForm, setShowLetterForm] = useState(false);

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
      violation_type: violationForm.violation_type,
      violation_date: violationForm.violation_date,
      violation_amount: Number(violationForm.violation_amount),
      deducted_amount: Number(violationForm.deducted_amount),
      status: violationForm.status,
      violation_description: violationForm.violation_description
    });
    if (result.success) {
      toast.success("تمت إضافة المخالفة بنجاح");
      setViolationForm({
        violation_type: "traffic",
        violation_date: new Date().toISOString().split('T')[0],
        violation_amount: "",
        deducted_amount: "0",
        status: "pending",
        violation_description: ""
      });
      setShowViolationForm(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleDeleteViolation = async (violationId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه المخالفة؟")) return;
    const result = await deleteViolation(violationId, employee.id);
    if (result.success) {
      toast.success("تم حذف المخالفة بنجاح");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleAddLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addLetter({
      employee_id: employee.id,
      letter_type: letterForm.letter_type,
      start_date: letterForm.start_date,
      end_date: letterForm.end_date,
      duration_days: Number(letterForm.duration_days),
      violation_amount: Number(letterForm.violation_amount),
      letter_details: letterForm.letter_details
    });
    if (result.success) {
      toast.success("تمت إضافة الخطاب بنجاح");
      setLetterForm({
        letter_type: "",
        start_date: "",
        end_date: "",
        duration_days: "",
        violation_amount: "0",
        letter_details: ""
      });
      setShowLetterForm(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleDeleteLetter = async (letterId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخطاب؟")) return;
    const result = await deleteLetter(letterId, employee.id);
    if (result.success) {
      toast.success("تم حذف الخطاب بنجاح");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleUpdateIqamaExpiry = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateIqamaExpiry(employee.id, iqamaExpiry);
    if (result.success) {
      toast.success("تم تحديث تاريخ انتهاء الإقامة");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const formatIqamaExpiry = () => {
    if (!employee.iqama_expiry) return null;
    try {
      const d = new Date(employee.iqama_expiry);
      if (isNaN(d.getTime())) return null;
      return format(d, 'yyyy-MM-dd');
    } catch {
      return null;
    }
  };

  const getIqamaStatus = () => {
    const expiry = formatIqamaExpiry();
    if (!expiry) return { text: 'غير محدد', color: 'gray', days: null };
    
    const today = new Date();
    const expiryDate = new Date(expiry);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'منتهية', color: 'red', days: diffDays };
    if (diffDays <= 30) return { text: 'تنتهي قريباً', color: 'orange', days: diffDays };
    return { text: 'سارية', color: 'green', days: diffDays };
  };

  const iqamaStatus = getIqamaStatus();
  const activeConfig = tabConfig[activeTab] || tabConfig.general;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-6 max-w-[1800px] mx-auto px-4 overflow-hidden py-4">
      
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
                <PlusCircle size={14} className="text-red-600" />
                {showViolationForm ? 'إلغاء' : 'إضافة مخالفة'}
              </button>
            )}
            {activeTab === "letters" && (
              <button 
                onClick={() => setShowLetterForm(!showLetterForm)}
                className="bg-white text-gray-900 px-6 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2.5 transition-all shadow-xl hover:scale-105 active:scale-95 border border-white/20"
              >
                <PlusCircle size={14} className="text-rose-600" />
                {showLetterForm ? 'إلغاء' : 'إضافة خطاب'}
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
                  <InfoField label="المسمى الوظيفي" value={personalInfo.job_title} onChange={(v: string) => setPersonalInfo({...personalInfo, job_title: v})} editable={isEditing} icon={<Briefcase size={16} />} />
                  <InfoField label="الرقم الوظيفي" value={personalInfo.user_code} onChange={(v: string) => setPersonalInfo({...personalInfo, user_code: v})} editable={isEditing} icon={<Hash size={16} />} />
                  <InfoField label="الجنسية" value={personalInfo.nationality} onChange={(v: string) => setPersonalInfo({...personalInfo, nationality: v})} editable={isEditing} icon={<Globe size={16} />} />
                  <InfoField label="رقم الجوال" value={personalInfo.phone} onChange={(v: string) => setPersonalInfo({...personalInfo, phone: v})} editable={isEditing} icon={<Phone size={16} />} />
                  <InfoField label="البريد الإلكتروني" value={personalInfo.email} onChange={(v: string) => setPersonalInfo({...personalInfo, email: v})} editable={isEditing} type="email" icon={<Mail size={16} />} />
                  <InfoField label="لوحة المركبة" value={personalInfo.vehicle_plate} onChange={(v: string) => setPersonalInfo({...personalInfo, vehicle_plate: v})} editable={isEditing} icon={<Car size={16} />} />
                  <InfoField label="تاريخ الميلاد" value={personalInfo.birth_date} onChange={(v: string) => setPersonalInfo({...personalInfo, birth_date: v})} editable={isEditing} type="date" icon={<Calendar size={16} />} />
                  <InfoField label="رقم الجواز" value={personalInfo.passport_number} onChange={(v: string) => setPersonalInfo({...personalInfo, passport_number: v})} editable={isEditing} icon={<FileText size={16} />} />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
                  <div className={`group relative p-10 rounded-[2.5rem] border-2 flex flex-col items-center justify-center gap-6 text-center transition-all hover:shadow-2xl hover:-translate-y-2 ${
                    iqamaStatus.color === 'red' ? 'bg-red-50 border-red-100 hover:shadow-red-200/50' :
                    iqamaStatus.color === 'orange' ? 'bg-orange-50 border-orange-100 hover:shadow-orange-200/50' :
                    iqamaStatus.color === 'green' ? 'bg-green-50 border-green-100 hover:shadow-green-200/50' :
                    'bg-gray-50 border-gray-100 hover:shadow-gray-200/50'
                  }`}>
                    <div className={`bg-white p-6 rounded-3xl shadow-xl group-hover:scale-110 transition-transform ${
                      iqamaStatus.color === 'red' ? 'text-red-600' :
                      iqamaStatus.color === 'orange' ? 'text-orange-600' :
                      iqamaStatus.color === 'green' ? 'text-green-600' :
                      'text-gray-600'
                    }`}>
                      <Timer size={40} />
                    </div>
                    <div>
                      <p className={`text-xs font-black uppercase tracking-[0.2em] mb-2 ${
                        iqamaStatus.color === 'red' ? 'text-red-400' :
                        iqamaStatus.color === 'orange' ? 'text-orange-400' :
                        iqamaStatus.color === 'green' ? 'text-green-400' :
                        'text-gray-400'
                      }`}>تاريخ انتهاء الإقامة</p>
                      <h4 className={`text-3xl font-black drop-shadow-sm ${
                        iqamaStatus.color === 'red' ? 'text-red-900' :
                        iqamaStatus.color === 'orange' ? 'text-orange-900' :
                        iqamaStatus.color === 'green' ? 'text-green-900' :
                        'text-gray-900'
                      }`}>{formatIqamaExpiry() || '---'}</h4>
                    </div>
                    <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      iqamaStatus.color === 'red' ? 'bg-red-100 text-red-600' :
                      iqamaStatus.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                      iqamaStatus.color === 'green' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {iqamaStatus.days !== null ? `${Math.abs(iqamaStatus.days)} يوم` : 'غير محدد'}
                    </div>
                  </div>

                  <div className={`group relative p-10 rounded-[2.5rem] border-2 flex flex-col items-center justify-center gap-6 text-center transition-all hover:shadow-2xl hover:-translate-y-2 ${
                    iqamaStatus.color === 'red' ? 'bg-red-50 border-red-100 hover:shadow-red-200/50' :
                    iqamaStatus.color === 'orange' ? 'bg-orange-50 border-orange-100 hover:shadow-orange-200/50' :
                    iqamaStatus.color === 'green' ? 'bg-green-50 border-green-100 hover:shadow-green-200/50' :
                    'bg-blue-50 border-blue-100 hover:shadow-blue-200/50'
                  }`}>
                    <div className={`bg-white p-6 rounded-3xl shadow-xl group-hover:scale-110 transition-transform ${
                      iqamaStatus.color === 'red' ? 'text-red-600' :
                      iqamaStatus.color === 'orange' ? 'text-orange-600' :
                      iqamaStatus.color === 'green' ? 'text-green-600' :
                      'text-blue-600'
                    }`}>
                      <ShieldCheck size={40} />
                    </div>
                    <div>
                      <p className={`text-xs font-black uppercase tracking-[0.2em] mb-2 ${
                        iqamaStatus.color === 'red' ? 'text-red-400' :
                        iqamaStatus.color === 'orange' ? 'text-orange-400' :
                        iqamaStatus.color === 'green' ? 'text-green-400' :
                        'text-blue-400'
                      }`}>حالة الإقامة</p>
                      <h4 className={`text-3xl font-black drop-shadow-sm ${
                        iqamaStatus.color === 'red' ? 'text-red-900' :
                        iqamaStatus.color === 'orange' ? 'text-orange-900' :
                        iqamaStatus.color === 'green' ? 'text-green-900' :
                        'text-blue-900'
                      }`}>{iqamaStatus.text}</h4>
                    </div>
                  </div>

                  <div className="group relative bg-purple-50 p-10 rounded-[2.5rem] border-2 border-purple-100 flex flex-col items-center justify-center gap-6 text-center transition-all hover:shadow-2xl hover:shadow-purple-200/50 hover:-translate-y-2">
                    <div className="bg-white p-6 rounded-3xl text-purple-600 shadow-xl group-hover:scale-110 transition-transform">
                      <Edit2 size={40} />
                    </div>
                    <div className="w-full">
                      <p className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] mb-4">تحديث تاريخ الانتهاء</p>
                      <form onSubmit={handleUpdateIqamaExpiry} className="space-y-4">
                        <input
                          type="date"
                          value={iqamaExpiry}
                          onChange={(e) => setIqamaExpiry(e.target.value)}
                          className="w-full bg-white border-2 border-purple-200 rounded-2xl py-3 px-4 text-sm font-black text-gray-800 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-center"
                        />
                        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                          <Save size={16} />
                          حفظ التاريخ
                        </button>
                      </form>
                    </div>
                  </div>

                  {iqamaStatus.color === 'red' || iqamaStatus.color === 'orange' ? (
                    <div className="col-span-full bg-red-50 p-8 rounded-[2.5rem] border-2 border-red-100 flex items-start gap-6 mt-4 shadow-sm">
                      <div className="bg-white p-4 rounded-2xl text-red-600 shadow-lg border border-red-50">
                        <AlertTriangle size={28} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-black text-red-900">تنبيه هام!</h4>
                        <p className="text-sm font-bold text-red-700 leading-relaxed">
                          {iqamaStatus.color === 'red' 
                            ? `إقامة الموظف منتهية منذ ${Math.abs(iqamaStatus.days || 0)} يوم. يرجى تجديدها فوراً لتجنب الغرامات والعقوبات.`
                            : `إقامة الموظف ستنتهي خلال ${iqamaStatus.days} يوم. يرجى البدء في إجراءات التجديد.`
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="col-span-full bg-slate-50 p-8 rounded-[2.5rem] border-2 border-gray-100 flex items-start gap-6 mt-4 shadow-sm">
                      <div className="bg-white p-4 rounded-2xl text-purple-600 shadow-lg border border-purple-50">
                        <Info size={28} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-black text-gray-900">تعليمات الإقامة</h4>
                        <p className="text-sm font-bold text-gray-500 leading-relaxed max-w-3xl">
                          يتم تحديث بيانات الإقامة بشكل يدوي. تأكد من متابعة تاريخ انتهاء الإقامة بشكل دوري لتجنب الغرامات المالية والعقوبات القانونية.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "violations" && (
                <div className="space-y-10">
                  {showViolationForm && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 p-8 rounded-[2rem] border-2 border-red-100"
                    >
                      <h4 className="text-lg font-black text-red-900 mb-6 flex items-center gap-3">
                        <PlusCircle size={24} className="text-red-600" />
                        إضافة مخالفة جديدة
                      </h4>
                      <form onSubmit={handleAddViolation} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-xs font-black text-red-700 mb-2">نوع المخالفة</label>
                          <select
                            value={violationForm.violation_type}
                            onChange={(e) => setViolationForm({...violationForm, violation_type: e.target.value})}
                            className="w-full bg-white border-2 border-red-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-red-400 outline-none"
                          >
                            <option value="traffic">مرورية</option>
                            <option value="general">عامة</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-black text-red-700 mb-2">تاريخ المخالفة</label>
                          <input
                            type="date"
                            value={violationForm.violation_date}
                            onChange={(e) => setViolationForm({...violationForm, violation_date: e.target.value})}
                            className="w-full bg-white border-2 border-red-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-red-400 outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-red-700 mb-2">مبلغ المخالفة</label>
                          <input
                            type="number"
                            value={violationForm.violation_amount}
                            onChange={(e) => setViolationForm({...violationForm, violation_amount: e.target.value})}
                            placeholder="0.00"
                            className="w-full bg-white border-2 border-red-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-red-400 outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-red-700 mb-2">المبلغ المخصوم</label>
                          <input
                            type="number"
                            value={violationForm.deducted_amount}
                            onChange={(e) => setViolationForm({...violationForm, deducted_amount: e.target.value})}
                            placeholder="0.00"
                            className="w-full bg-white border-2 border-red-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-red-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-red-700 mb-2">الحالة</label>
                          <select
                            value={violationForm.status}
                            onChange={(e) => setViolationForm({...violationForm, status: e.target.value})}
                            className="w-full bg-white border-2 border-red-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-red-400 outline-none"
                          >
                            <option value="pending">معلق</option>
                            <option value="deducted">مخصوم</option>
                            <option value="partially_deducted">مخصوم جزئياً</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-black text-red-700 mb-2">الوصف</label>
                          <input
                            type="text"
                            value={violationForm.violation_description}
                            onChange={(e) => setViolationForm({...violationForm, violation_description: e.target.value})}
                            placeholder="وصف المخالفة..."
                            className="w-full bg-white border-2 border-red-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-red-400 outline-none"
                          />
                        </div>
                        <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-4 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowViolationForm(false)}
                            className="px-8 py-3 rounded-xl font-black bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="px-8 py-3 rounded-xl font-black bg-red-600 text-white hover:bg-red-700 transition-all flex items-center gap-2"
                          >
                            <Save size={18} />
                            حفظ المخالفة
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatBox label="إجمالي المخالفات" value={violations.reduce((acc, v) => acc + Number(v.violation_amount), 0)} color="red" unit="ر.س" />
                    <StatBox label="تم خصمه" value={violations.reduce((acc, v) => acc + Number(v.deducted_amount), 0)} color="green" unit="ر.س" />
                    <StatBox label="المتبقي" value={violations.reduce((acc, v) => acc + Number(v.remaining_amount), 0)} color="blue" unit="ر.س" />
                  </div>

                  <div className="overflow-x-auto rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">تاريخ المخالفة</th>
                          <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">نوع المخالفة</th>
                          <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">المبلغ</th>
                          <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">المخصوم</th>
                          <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">المتبقي</th>
                          <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">الحالة</th>
                          <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">الوصف</th>
                          <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {violations.map((v) => (
                          <tr key={v.id} className="hover:bg-slate-50/80 transition-all group">
                            <td className="px-6 py-5 text-xs font-bold text-gray-600">{v.violation_date}</td>
                            <td className="px-6 py-5 text-xs font-black text-gray-900">
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${
                                v.violation_type === 'traffic' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                              }`}>
                                {v.violation_type === 'traffic' ? 'مرورية' : 'عامة'}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-xs font-black text-red-600">{Number(v.violation_amount).toLocaleString()} ر.س</td>
                            <td className="px-6 py-5 text-xs font-black text-green-600">{Number(v.deducted_amount).toLocaleString()} ر.س</td>
                            <td className="px-6 py-5 text-xs font-black text-blue-600">{Number(v.remaining_amount).toLocaleString()} ر.س</td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase ${
                                v.status === 'deducted' ? 'bg-green-100 text-green-700' :
                                v.status === 'partially_deducted' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {v.status === 'deducted' ? 'مخصوم' : v.status === 'partially_deducted' ? 'جزئي' : 'معلق'}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-xs font-bold text-gray-500 max-w-[200px] truncate">{v.violation_description || '---'}</td>
                            <td className="px-6 py-5">
                              <button
                                onClick={() => handleDeleteViolation(v.id)}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {violations.length === 0 && (
                          <tr>
                            <td colSpan={8} className="px-8 py-16 text-center text-gray-300 font-bold">لا توجد سجلات للمخالفات حالياً</td>
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
                    <StatBox label="إجمالي الطلبات" value={stats.total_orders || 0} color="blue" />
                    <StatBox label="إجمالي الرواتب" value={stats.total_salary || 0} color="green" unit="ر.س" />
                    <StatBox label="متوسط الطلبات" value={Math.round(stats.avg_orders || 0)} color="purple" />
                    <StatBox label="عدد الشهور" value={stats.total_months || 0} color="orange" />
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
                              <td className="px-8 py-5 text-sm font-black text-gray-900 bg-gray-50/50">{Number(m.net_salary).toLocaleString()} ر.س</td>
                            </tr>
                          ))}
                          {monthlyData.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-8 py-16 text-center text-gray-300 font-bold">لا توجد بيانات أداء متاحة</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "letters" && (
                <div className="space-y-8 pb-8">
                  {showLetterForm && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-rose-50 p-8 rounded-[2rem] border-2 border-rose-100"
                    >
                      <h4 className="text-lg font-black text-rose-900 mb-6 flex items-center gap-3">
                        <PlusCircle size={24} className="text-rose-600" />
                        إضافة خطاب جديد
                      </h4>
                      <form onSubmit={handleAddLetter} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-xs font-black text-rose-700 mb-2">نوع الخطاب</label>
                          <select
                            value={letterForm.letter_type}
                            onChange={(e) => setLetterForm({...letterForm, letter_type: e.target.value})}
                            className="w-full bg-white border-2 border-rose-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-rose-400 outline-none"
                            required
                          >
                            <option value="">اختر نوع الخطاب</option>
                            <option value="sick_leave">إجازة مرضية</option>
                            <option value="annual_leave">إجازة سنوية</option>
                            <option value="personal_leave">إجازة شخصية</option>
                            <option value="absence">غياب دون سبب</option>
                            <option value="other">أخرى</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-black text-rose-700 mb-2">تاريخ البداية</label>
                          <input
                            type="date"
                            value={letterForm.start_date}
                            onChange={(e) => setLetterForm({...letterForm, start_date: e.target.value})}
                            className="w-full bg-white border-2 border-rose-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-rose-400 outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-rose-700 mb-2">تاريخ النهاية</label>
                          <input
                            type="date"
                            value={letterForm.end_date}
                            onChange={(e) => setLetterForm({...letterForm, end_date: e.target.value})}
                            className="w-full bg-white border-2 border-rose-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-rose-400 outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-rose-700 mb-2">المدة (أيام)</label>
                          <input
                            type="number"
                            value={letterForm.duration_days}
                            onChange={(e) => setLetterForm({...letterForm, duration_days: e.target.value})}
                            placeholder="عدد الأيام"
                            className="w-full bg-white border-2 border-rose-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-rose-400 outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-rose-700 mb-2">مبلغ المخالفة (إن وجد)</label>
                          <input
                            type="number"
                            value={letterForm.violation_amount}
                            onChange={(e) => setLetterForm({...letterForm, violation_amount: e.target.value})}
                            placeholder="0.00"
                            className="w-full bg-white border-2 border-rose-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-rose-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-rose-700 mb-2">التفاصيل</label>
                          <input
                            type="text"
                            value={letterForm.letter_details}
                            onChange={(e) => setLetterForm({...letterForm, letter_details: e.target.value})}
                            placeholder="تفاصيل الخطاب..."
                            className="w-full bg-white border-2 border-rose-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-rose-400 outline-none"
                          />
                        </div>
                        <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-4 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowLetterForm(false)}
                            className="px-8 py-3 rounded-xl font-black bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="px-8 py-3 rounded-xl font-black bg-rose-600 text-white hover:bg-rose-700 transition-all flex items-center gap-2"
                          >
                            <Save size={18} />
                            حفظ الخطاب
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {letters.map((l) => (
                      <div key={l.id} className="p-8 rounded-[2rem] bg-slate-50/50 border border-gray-100 space-y-6 hover:border-rose-200 transition-all group relative overflow-hidden shadow-sm hover:shadow-xl">
                        <div className="absolute top-0 left-0 w-2 h-full bg-rose-200" />
                        <div className="flex justify-between items-start">
                          <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-rose-600 shadow-xl group-hover:scale-110 transition-transform border border-rose-50">
                            <Mail size={28} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-4 py-2 rounded-xl bg-white text-[9px] font-black text-gray-400 uppercase border border-gray-100 shadow-sm tracking-widest">
                              {l.start_date} - {l.end_date}
                            </span>
                            <button
                              onClick={() => handleDeleteLetter(l.id)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-gray-900 mb-2">
                            <span className={`px-3 py-1 rounded-lg text-sm mr-2 ${
                              l.letter_type === 'sick_leave' ? 'bg-blue-100 text-blue-700' :
                              l.letter_type === 'annual_leave' ? 'bg-green-100 text-green-700' :
                              l.letter_type === 'personal_leave' ? 'bg-purple-100 text-purple-700' :
                              l.letter_type === 'absence' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {l.letter_type === 'sick_leave' ? 'إجازة مرضية' :
                               l.letter_type === 'annual_leave' ? 'إجازة سنوية' :
                               l.letter_type === 'personal_leave' ? 'إجازة شخصية' :
                               l.letter_type === 'absence' ? 'غياب' : 'أخرى'}
                            </span>
                          </h4>
                          <div className="bg-white p-4 rounded-2xl border border-gray-50 shadow-inner">
                            <p className="text-xs font-bold text-gray-500 leading-relaxed">{l.letter_details || 'لا توجد تفاصيل'}</p>
                          </div>
                        </div>
                        <div className="pt-4 flex items-center justify-between">
                          <span className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-xl border border-gray-100 text-[10px] font-black text-gray-500">
                            <Calendar size={14} className="text-rose-400" />
                            المدة: {l.duration_days} أيام
                          </span>
                          {Number(l.violation_amount) > 0 && (
                            <span className="flex items-center gap-2.5 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl border border-rose-100 text-[10px] font-black">
                              <AlertTriangle size={14} />
                              المخالفة: {Number(l.violation_amount).toLocaleString()} ر.س
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
        {(value || 0).toLocaleString()}
        {unit && <span className="text-xs mr-1 font-bold opacity-70">{unit}</span>}
      </div>
    </div>
  );
}
