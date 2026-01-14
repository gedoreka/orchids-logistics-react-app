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
  Edit2,
  Download,
  ExternalLink
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
  general: { label: "المعلومات العامة", icon: User, color: "blue", bg: "bg-gradient-to-br from-blue-500 to-blue-700", text: "text-blue-600", light: "bg-blue-50" },
  bank: { label: "الحساب البنكي", icon: University, color: "emerald", bg: "bg-gradient-to-br from-emerald-500 to-emerald-700", text: "text-emerald-600", light: "bg-emerald-50" },
  documents: { label: "المستندات", icon: FileText, color: "amber", bg: "bg-gradient-to-br from-amber-500 to-amber-700", text: "text-amber-600", light: "bg-amber-50" },
  violations: { label: "المخالفات", icon: OctagonAlert, color: "red", bg: "bg-gradient-to-br from-red-500 to-red-700", text: "text-red-600", light: "bg-red-50" },
  status: { label: "صلاحية الإقامة", icon: IdCard, color: "purple", bg: "bg-gradient-to-br from-purple-500 to-purple-700", text: "text-purple-600", light: "bg-purple-50" },
  stats: { label: "إحصائيات الأداء", icon: BarChart3, color: "indigo", bg: "bg-gradient-to-br from-indigo-500 to-indigo-700", text: "text-indigo-600", light: "bg-indigo-50" },
  letters: { label: "خطابات السائق", icon: Mail, color: "rose", bg: "bg-gradient-to-br from-rose-500 to-rose-700", text: "text-rose-600", light: "bg-rose-50" },
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
      <div className="flex flex-col h-screen space-y-4 max-w-[1800px] mx-auto px-4 overflow-hidden animate-pulse">
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
      toast.success("تم تحديث تاريخ انتداء الإقامة");
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
    <div className="flex flex-col min-h-screen space-y-6 max-w-[1600px] mx-auto px-4 py-8">
      
      {/* Premium Header Section */}
      <div className="premium-gradient p-10 rounded-[3rem] relative overflow-hidden shadow-2xl border-b-8 border-yellow-500/30">
        <div className="absolute top-0 right-0 w-full h-full opacity-15 pointer-events-none">
           <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[200%] bg-white/20 -rotate-12 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="h-40 w-40 md:h-48 md:w-48 rounded-[2rem] border-4 border-white/20 p-1.5 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:border-yellow-400/50 bg-[#34495e]/50">
              {getPublicUrl(employee.personal_photo) ? (
                <img 
                  src={getPublicUrl(employee.personal_photo)!} 
                  alt={employee.name} 
                  className="h-full w-full object-cover rounded-[1.8rem] transition-transform duration-700 group-hover:scale-110" 
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white/20">
                  <User size={80} className="group-hover:text-yellow-400/40 transition-colors" />
                </div>
              )}
            </div>
            <button className="absolute -bottom-4 -right-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 p-4 rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95 border-4 border-[#2c3e50]">
              <Camera size={22} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-right gap-6">
            <div className="flex items-center gap-4 text-white/80 bg-white/10 px-6 py-2 rounded-full border border-white/10 backdrop-blur-xl self-center md:self-start shadow-lg">
              <User className="text-yellow-400" size={18} />
              <h2 className="text-[11px] font-black tracking-[0.3em] uppercase">الملف الشخصي للموظف الاحترافي</h2>
            </div>

            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                {employee.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="glass-card bg-white/5 border-white/10 px-6 py-2.5 rounded-2xl flex items-center gap-3 text-xs shadow-xl group hover:border-yellow-400/30 transition-all">
                  <Hash className="text-yellow-500" size={16} />
                  <span className="text-white/60 font-bold">الرقم الوظيفي:</span>
                  <span className="text-white font-black text-lg">{employee.user_code || '---'}</span>
                </div>
                <div className="glass-card bg-white/5 border-white/10 px-6 py-2.5 rounded-2xl flex items-center gap-3 text-xs shadow-xl group hover:border-yellow-400/30 transition-all">
                  <Briefcase className="text-yellow-500" size={16} />
                  <span className="text-white/60 font-bold">الباقة الحالية:</span>
                  <span className="text-white font-black text-lg">{employee.group_name}</span>
                </div>
                <div className={`px-6 py-2.5 rounded-2xl flex items-center gap-3 text-xs border-2 shadow-xl transition-all ${
                  employee.is_active === 1 
                  ? 'bg-green-500/20 border-green-500/40 text-green-300' 
                  : 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                }`}>
                  <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${employee.is_active === 1 ? 'bg-green-400' : 'bg-orange-400'}`} />
                  <span className="font-black text-lg">{employee.is_active === 1 ? 'موظف نشط' : 'في إجازة رسمية'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 self-center md:self-start min-w-[240px]">
            <Link href={`/hr/packages/${employee.package_id}`}>
              <button className="premium-button-primary w-full py-4 px-8 text-sm">
                <ArrowRight size={20} />
                <span>العودة للباقة</span>
              </button>
            </Link>
            <button 
              onClick={handleToggleStatus}
              className={`premium-button w-full py-4 px-8 text-sm ${
                employee.is_active === 1 
                ? 'bg-gradient-to-r from-orange-500 to-orange-700 text-white' 
                : 'bg-gradient-to-r from-emerald-500 to-emerald-700 text-white'
              }`}
            >
              {employee.is_active === 1 ? <Umbrella size={20} /> : <CheckCircle2 size={20} />}
              {employee.is_active === 1 ? 'تعيين وضع الإجازة' : 'تفعيل الموظف الآن'}
            </button>
          </div>
        </div>
      </div>

      {/* Luxury Tabs Navigation */}
      <div className="flex items-center gap-5 overflow-x-auto pb-6 px-4 no-scrollbar shrink-0 justify-center">
        {Object.entries(tabConfig).map(([id, config]: [string, any]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center justify-center gap-4 min-w-[160px] h-[160px] rounded-[2.5rem] transition-all duration-500 group relative border-4 ${
              activeTab === id 
              ? `${config.bg} text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] scale-110 border-white/30 z-10` 
              : `bg-white border-transparent text-gray-400 hover:border-${config.color}-200 hover:shadow-2xl hover:scale-105`
            }`}
          >
            <div className={`p-4 rounded-2xl transition-all duration-500 ${activeTab === id ? 'bg-white/20 scale-110 shadow-inner' : `${config.light} ${config.text} group-hover:scale-110 shadow-sm`}`}>
              <config.icon size={32} strokeWidth={2.5} />
            </div>
            <span className={`text-[12px] font-black text-center px-4 leading-tight tracking-wide transition-colors duration-500 ${activeTab === id ? 'text-white' : 'text-gray-600'}`}>
              {config.label}
            </span>
            {activeTab === id && (
              <motion.div 
                layoutId="luxury-tab-indicator"
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-yellow-400 rounded-full shadow-lg" 
              />
            )}
          </button>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="flex-1 glass-card rounded-[3.5rem] overflow-hidden flex flex-col min-h-[600px] mb-10">
        <div className={`${activeConfig.bg} p-8 flex items-center justify-between shrink-0 transition-all duration-700 border-b-4 border-black/5`}>
          <div className="flex items-center gap-6 text-white">
            <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-xl shadow-inner border border-white/20">
              <activeConfig.icon size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight drop-shadow-md">{activeConfig.label}</h3>
              <p className="text-[11px] font-bold opacity-80 uppercase tracking-[0.3em] mt-1">إدارة شاملة لبيانات الموظف والسجلات الرسمية</p>
            </div>
          </div>
          <div className="flex gap-4">
            {(activeTab === "general" || activeTab === "bank") && (
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-gray-900 px-8 py-3 rounded-2xl text-xs font-black flex items-center gap-3 transition-all shadow-2xl hover:scale-105 active:scale-95 border border-white/20"
              >
                {isEditing ? <X size={18} className="text-red-600" /> : <Edit3 size={18} className={activeConfig.text} />}
                {isEditing ? 'إلغاء التعديل' : 'تعديل البيانات'}
              </button>
            )}
            {activeTab === "violations" && (
              <button 
                onClick={() => setShowViolationForm(!showViolationForm)}
                className="bg-white text-gray-900 px-8 py-3 rounded-2xl text-xs font-black flex items-center gap-3 transition-all shadow-2xl hover:scale-105 active:scale-95 border border-white/20"
              >
                {showViolationForm ? <X size={18} className="text-red-600" /> : <PlusCircle size={18} className="text-red-600" />}
                {showViolationForm ? 'إلغاء الإضافة' : 'إضافة مخالفة جديدة'}
              </button>
            )}
            {activeTab === "letters" && (
              <button 
                onClick={() => setShowLetterForm(!showLetterForm)}
                className="bg-white text-gray-900 px-8 py-3 rounded-2xl text-xs font-black flex items-center gap-3 transition-all shadow-2xl hover:scale-105 active:scale-95 border border-white/20"
              >
                {showLetterForm ? <X size={18} className="text-rose-600" /> : <PlusCircle size={18} className="text-rose-600" />}
                {showLetterForm ? 'إلغاء الإضافة' : 'إضافة خطاب جديد'}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-12 bg-white/50 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full"
            >
              {activeTab === "general" && (
                <form onSubmit={handleUpdatePersonal} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-right">
                  <LuxuryField label="رقم الإقامة" value={personalInfo.iqama_number} onChange={(v: string) => setPersonalInfo({...personalInfo, iqama_number: v})} editable={isEditing} icon={<IdCard />} />
                  <LuxuryField label="رقم الهوية الوطنية" value={personalInfo.identity_number} onChange={(v: string) => setPersonalInfo({...personalInfo, identity_number: v})} editable={isEditing} icon={<IdCard />} />
                  <LuxuryField label="المسمى الوظيفي" value={personalInfo.job_title} onChange={(v: string) => setPersonalInfo({...personalInfo, job_title: v})} editable={isEditing} icon={<Briefcase />} />
                  <LuxuryField label="الرقم الوظيفي" value={personalInfo.user_code} onChange={(v: string) => setPersonalInfo({...personalInfo, user_code: v})} editable={isEditing} icon={<Hash />} />
                  <LuxuryField label="الجنسية" value={personalInfo.nationality} onChange={(v: string) => setPersonalInfo({...personalInfo, nationality: v})} editable={isEditing} icon={<Globe />} />
                  <LuxuryField label="رقم الجوال" value={personalInfo.phone} onChange={(v: string) => setPersonalInfo({...personalInfo, phone: v})} editable={isEditing} icon={<Phone />} />
                  <LuxuryField label="البريد الإلكتروني" value={personalInfo.email} onChange={(v: string) => setPersonalInfo({...personalInfo, email: v})} editable={isEditing} type="email" icon={<Mail />} />
                  <LuxuryField label="لوحة المركبة" value={personalInfo.vehicle_plate} onChange={(v: string) => setPersonalInfo({...personalInfo, vehicle_plate: v})} editable={isEditing} icon={<Car />} />
                  <LuxuryField label="تاريخ الميلاد" value={personalInfo.birth_date} onChange={(v: string) => setPersonalInfo({...personalInfo, birth_date: v})} editable={isEditing} type="date" icon={<Calendar />} />
                  <LuxuryField label="رقم الجواز" value={personalInfo.passport_number} onChange={(v: string) => setPersonalInfo({...personalInfo, passport_number: v})} editable={isEditing} icon={<FileText />} />
                  <LuxuryField label="رقم كرت التشغيل" value={personalInfo.operation_card_number} onChange={(v: string) => setPersonalInfo({...personalInfo, operation_card_number: v})} editable={isEditing} icon={<IdCard />} />
                  <LuxuryField label="الراتب الأساسي" value={personalInfo.basic_salary} onChange={(v: string) => setPersonalInfo({...personalInfo, basic_salary: v})} editable={isEditing} icon={<CreditCard />} />
                  <LuxuryField label="بدل السكن" value={personalInfo.housing_allowance} onChange={(v: string) => setPersonalInfo({...personalInfo, housing_allowance: v})} editable={isEditing} icon={<Building />} />
                  
                  {isEditing && (
                    <div className="col-span-full pt-10 flex justify-center">
                      <button type="submit" className="premium-button-primary px-20 py-5 text-lg shadow-blue-500/40">
                        <Save size={24} />
                        حفظ كافة التغييرات
                      </button>
                    </div>
                  )}
                </form>
              )}

              {activeTab === "bank" && (
                <form onSubmit={handleUpdateBank} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-right">
                  <LuxuryField label="اسم البنك" value={bankInfo.bank_name} onChange={(v: string) => setBankInfo({...bankInfo, bank_name: v})} editable={isEditing} icon={<Building />} />
                  <LuxuryField label="رقم الحساب" value={bankInfo.bank_account} onChange={(v: string) => setBankInfo({...bankInfo, bank_account: v})} editable={isEditing} icon={<Hash />} />
                  <LuxuryField label="رقم الآيبان IBAN" value={bankInfo.iban} onChange={(v: string) => setBankInfo({...bankInfo, iban: v})} editable={isEditing} icon={<CreditCard />} />
                  
                  {isEditing && (
                    <div className="col-span-full pt-10 flex justify-center">
                      <button type="submit" className="premium-button-success px-20 py-5 text-lg shadow-emerald-500/40">
                        <Save size={24} />
                        حفظ بيانات الحساب البنكي
                      </button>
                    </div>
                  )}
                </form>
              )}

              {activeTab === "documents" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 pb-10">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-10">
                  <motion.div whileHover={{ y: -10 }} className={`group relative p-12 rounded-[3rem] border-4 flex flex-col items-center justify-center gap-8 text-center transition-all shadow-2xl ${
                    iqamaStatus.color === 'red' ? 'bg-red-50/50 border-red-200' :
                    iqamaStatus.color === 'orange' ? 'bg-orange-50/50 border-orange-200' :
                    iqamaStatus.color === 'green' ? 'bg-green-50/50 border-green-200' :
                    'bg-gray-50/50 border-gray-200'
                  }`}>
                    <div className={`bg-white p-8 rounded-[2rem] shadow-2xl group-hover:scale-110 transition-transform border-4 ${
                      iqamaStatus.color === 'red' ? 'text-red-600 border-red-50' :
                      iqamaStatus.color === 'orange' ? 'text-orange-600 border-orange-50' :
                      iqamaStatus.color === 'green' ? 'text-green-600 border-green-50' :
                      'text-gray-600 border-gray-50'
                    }`}>
                      <Timer size={48} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.3em] mb-4 opacity-60">تاريخ انتهاء الصلاحية</p>
                      <h4 className="text-4xl font-black text-gray-900 drop-shadow-sm">{formatIqamaExpiry() || 'غير متوفر'}</h4>
                    </div>
                    <div className={`absolute top-6 right-6 px-6 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg ${
                      iqamaStatus.color === 'red' ? 'bg-red-600 text-white' :
                      iqamaStatus.color === 'orange' ? 'bg-orange-500 text-white' :
                      iqamaStatus.color === 'green' ? 'bg-green-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {iqamaStatus.days !== null ? `${Math.abs(iqamaStatus.days)} يوم` : 'مجهول'}
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -10 }} className={`group relative p-12 rounded-[3rem] border-4 flex flex-col items-center justify-center gap-8 text-center transition-all shadow-2xl ${
                    iqamaStatus.color === 'red' ? 'bg-red-50/50 border-red-200' :
                    iqamaStatus.color === 'orange' ? 'bg-orange-50/50 border-orange-200' :
                    iqamaStatus.color === 'green' ? 'bg-green-50/50 border-green-200' :
                    'bg-blue-50/50 border-blue-200'
                  }`}>
                    <div className={`bg-white p-8 rounded-[2rem] shadow-2xl group-hover:scale-110 transition-transform border-4 ${
                      iqamaStatus.color === 'red' ? 'text-red-600 border-red-50' :
                      iqamaStatus.color === 'orange' ? 'text-orange-600 border-orange-50' :
                      iqamaStatus.color === 'green' ? 'text-green-600 border-green-50' :
                      'text-blue-600 border-blue-50'
                    }`}>
                      <ShieldCheck size={48} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.3em] mb-4 opacity-60">الحالة القانونية</p>
                      <h4 className="text-4xl font-black text-gray-900 drop-shadow-sm">{iqamaStatus.text}</h4>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -10 }} className="group relative bg-purple-50/50 p-12 rounded-[3rem] border-4 border-purple-200 flex flex-col items-center justify-center gap-8 text-center transition-all shadow-2xl">
                    <div className="bg-white p-8 rounded-[2rem] text-purple-600 shadow-2xl group-hover:scale-110 transition-transform border-4 border-purple-50">
                      <Edit2 size={48} />
                    </div>
                    <div className="w-full">
                      <p className="text-xs font-black text-purple-600/60 uppercase tracking-[0.3em] mb-6">تحديث بيانات الصلاحية</p>
                      <form onSubmit={handleUpdateIqamaExpiry} className="space-y-6">
                        <input
                          type="date"
                          value={iqamaExpiry}
                          onChange={(e) => setIqamaExpiry(e.target.value)}
                          className="w-full bg-white border-4 border-purple-100 rounded-[1.5rem] py-4 px-6 text-lg font-black text-gray-800 focus:border-purple-400 focus:ring-12 focus:ring-purple-100 outline-none transition-all text-center shadow-inner"
                        />
                        <button type="submit" className="premium-button w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 px-8 text-sm">
                          <Save size={20} />
                          تحديث تاريخ الإقامة
                        </button>
                      </form>
                    </div>
                  </motion.div>

                  {(iqamaStatus.color === 'red' || iqamaStatus.color === 'orange') && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="col-span-full bg-red-600 text-white p-10 rounded-[3rem] border-8 border-red-500/20 flex items-start gap-8 shadow-2xl">
                      <div className="bg-white p-6 rounded-[2rem] text-red-600 shadow-2xl animate-bounce">
                        <AlertTriangle size={40} />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-2xl font-black">إشعار انتهاء الصلاحية!</h4>
                        <p className="text-lg font-bold opacity-90 leading-relaxed">
                          {iqamaStatus.color === 'red' 
                            ? `تنبيه: إقامة الموظف منتهية رسمياً منذ ${Math.abs(iqamaStatus.days || 0)} يوم. يجب اتخاذ إجراء فوري.`
                            : `تنبيه: تبقى فقط ${iqamaStatus.days} يوم على انتهاء الإقامة. يرجى البدء في التجديد لتجنب إيقاف الخدمات.`
                          }
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {activeTab === "violations" && (
                <div className="space-y-12">
                  <AnimatePresence>
                    {showViolationForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50/50 p-10 rounded-[3rem] border-4 border-red-100 overflow-hidden shadow-2xl"
                      >
                        <h4 className="text-2xl font-black text-red-900 mb-8 flex items-center gap-4">
                          <PlusCircle size={32} className="text-red-600" />
                          إضافة مخالفة جديدة يدوياً
                        </h4>
                        <form onSubmit={handleAddViolation} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          <LuxuryFormSelect 
                            label="نوع المخالفة" 
                            value={violationForm.violation_type} 
                            onChange={(v) => setViolationForm({...violationForm, violation_type: v})}
                            options={[
                              { value: "traffic", label: "مخالفة مرورية" },
                              { value: "general", label: "مخالفة عامة / إدارية" }
                            ]}
                          />
                          <LuxuryFormInput 
                            label="تاريخ المخالفة" 
                            type="date" 
                            value={violationForm.violation_date} 
                            onChange={(v) => setViolationForm({...violationForm, violation_date: v})} 
                          />
                          <LuxuryFormInput 
                            label="مبلغ المخالفة الإجمالي" 
                            type="number" 
                            placeholder="0.00" 
                            value={violationForm.violation_amount} 
                            onChange={(v) => setViolationForm({...violationForm, violation_amount: v})} 
                          />
                          <LuxuryFormInput 
                            label="المبلغ المخصوم فعلياً" 
                            type="number" 
                            placeholder="0.00" 
                            value={violationForm.deducted_amount} 
                            onChange={(v) => setViolationForm({...violationForm, deducted_amount: v})} 
                          />
                          <LuxuryFormSelect 
                            label="الحالة الحالية" 
                            value={violationForm.status} 
                            onChange={(v) => setViolationForm({...violationForm, status: v})}
                            options={[
                              { value: "pending", label: "معلق (بانتظار الخصم)" },
                              { value: "deducted", label: "تم الخصم بالكامل" },
                              { value: "partially_deducted", label: "تم الخصم جزئياً" }
                            ]}
                          />
                          <LuxuryFormInput 
                            label="وصف المخالفة بالتفصيل" 
                            placeholder="اكتب هنا تفاصيل المخالفة..." 
                            value={violationForm.violation_description} 
                            onChange={(v) => setViolationForm({...violationForm, violation_description: v})} 
                          />
                          <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-6 pt-6">
                            <button
                              type="button"
                              onClick={() => setShowViolationForm(false)}
                              className="px-10 py-4 rounded-2xl font-black bg-white text-gray-500 hover:bg-gray-100 transition-all shadow-xl border-2 border-gray-100"
                            >
                              إلغاء العملية
                            </button>
                            <button
                              type="submit"
                              className="premium-button-primary px-12 py-4 shadow-blue-500/30"
                            >
                              <Save size={22} />
                              تسجيل المخالفة في النظام
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <StatCard label="إجمالي مبالغ المخالفات" value={violations.reduce((acc, v) => acc + Number(v.violation_amount), 0)} color="red" unit="ر.س" icon={<AlertTriangle />} />
                    <StatCard label="المبالغ المخصومة" value={violations.reduce((acc, v) => acc + Number(v.deducted_amount), 0)} color="green" unit="ر.س" icon={<CheckCircle2 />} />
                    <StatCard label="المبالغ المتبقية" value={violations.reduce((acc, v) => acc + Number(v.remaining_amount), 0)} color="blue" unit="ر.س" icon={<Info />} />
                  </div>

                  <div className="overflow-hidden rounded-[3rem] border-4 border-gray-50 shadow-2xl bg-white">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-gray-100/50 border-b-4 border-gray-50">
                          <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">التاريخ</th>
                          <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">النوع</th>
                          <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">المبلغ</th>
                          <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">المخصوم</th>
                          <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">المتبقي</th>
                          <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">الحالة</th>
                          <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">الوصف</th>
                          <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-gray-50">
                        {violations.map((v) => (
                          <tr key={v.id} className="hover:bg-slate-50 transition-all group">
                            <td className="px-8 py-6 text-sm font-bold text-gray-600">{v.violation_date}</td>
                            <td className="px-8 py-6">
                              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black shadow-sm ${
                                v.violation_type === 'traffic' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
                              }`}>
                                {v.violation_type === 'traffic' ? 'مرورية' : 'عامة'}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-sm font-black text-red-600">{Number(v.violation_amount).toLocaleString()} ر.س</td>
                            <td className="px-8 py-6 text-sm font-black text-green-600">{Number(v.deducted_amount).toLocaleString()} ر.س</td>
                            <td className="px-8 py-6 text-sm font-black text-blue-600">{Number(v.remaining_amount).toLocaleString()} ر.س</td>
                            <td className="px-8 py-6">
                              <span className={`px-4 py-2 rounded-2xl text-[10px] font-black shadow-inner border ${
                                v.status === 'deducted' ? 'bg-green-50 text-green-700 border-green-100' :
                                v.status === 'partially_deducted' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                'bg-gray-100 text-gray-600 border-gray-200'
                              }`}>
                                {v.status === 'deducted' ? 'تم الخصم' : v.status === 'partially_deducted' ? 'خصم جزئي' : 'قيد الانتظار'}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-sm font-bold text-gray-500 max-w-[250px] truncate">{v.violation_description || '---'}</td>
                            <td className="px-8 py-6">
                              <button
                                onClick={() => handleDeleteViolation(v.id)}
                                className="p-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-md active:scale-90"
                              >
                                <Trash2 size={20} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {violations.length === 0 && (
                          <tr>
                            <td colSpan={8} className="px-8 py-24 text-center text-gray-300 font-black text-xl">
                              <Info size={48} className="mx-auto mb-4 opacity-10" />
                              سجل المخالفات فارغ حالياً
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "stats" && (
                <div className="space-y-16 pb-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    <StatCard label="إجمالي الطلبات الناجحة" value={stats.total_orders || 0} color="blue" icon={<CheckCircle2 />} />
                    <StatCard label="إجمالي الرواتب المدفوعة" value={stats.total_salary || 0} color="green" unit="ر.س" icon={<CreditCard />} />
                    <StatCard label="متوسط الطلبات الشهري" value={Math.round(stats.avg_orders || 0)} color="purple" icon={<BarChart3 />} />
                    <StatCard label="عدد شهور العمل" value={stats.total_months || 0} color="orange" icon={<CalendarDays />} />
                  </div>

                  <div className="space-y-10">
                    <div className="flex items-center gap-6 border-b-4 border-gray-50 pb-8">
                      <div className="bg-indigo-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-indigo-200">
                        <History size={28} />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-gray-900">سجل الأداء الشهري المفصل</h3>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">تحليل دقيق للإنتاجية والرواتب لكل شهر</p>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-[3.5rem] border-4 border-gray-50 shadow-2xl bg-white">
                      <table className="w-full text-right">
                        <thead>
                          <tr className="bg-gray-100/50 border-b-4 border-gray-50">
                            <th className="px-10 py-7 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">الشهر</th>
                            <th className="px-10 py-7 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">الطلبات</th>
                            <th className="px-10 py-7 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">الهدف (Target)</th>
                            <th className="px-10 py-7 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">البونص الإضافي</th>
                            <th className="px-10 py-7 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">إجمالي الخصومات</th>
                            <th className="px-10 py-7 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">صافي المستحق</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-gray-50">
                          {monthlyData.map((m, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-all group">
                              <td className="px-10 py-7 text-sm font-black text-gray-900">{m.payroll_month}</td>
                              <td className="px-10 py-7 text-sm font-black text-blue-600">{m.successful_orders}</td>
                              <td className="px-10 py-7 text-sm font-bold text-gray-500">{m.target}</td>
                              <td className="px-10 py-7 text-sm font-black text-green-600">+{m.bonus} ر.س</td>
                              <td className="px-10 py-7 text-sm font-black text-red-600">-{m.total_deduction} ر.س</td>
                              <td className="px-10 py-7 text-lg font-black text-gray-900 bg-gray-50/80 group-hover:bg-indigo-50 transition-colors">{Number(m.net_salary).toLocaleString()} ر.س</td>
                            </tr>
                          ))}
                          {monthlyData.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-10 py-24 text-center text-gray-300 font-black text-xl">لا توجد بيانات متاحة لهذا السجل</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "letters" && (
                <div className="space-y-12 pb-10">
                  <AnimatePresence>
                    {showLetterForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-rose-50/50 p-10 rounded-[3rem] border-4 border-rose-100 overflow-hidden shadow-2xl"
                      >
                        <h4 className="text-2xl font-black text-rose-900 mb-8 flex items-center gap-4">
                          <PlusCircle size={32} className="text-rose-600" />
                          تسجيل خطاب إداري جديد
                        </h4>
                        <form onSubmit={handleAddLetter} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          <LuxuryFormSelect 
                            label="نوع الخطاب" 
                            value={letterForm.letter_type} 
                            onChange={(v) => setLetterForm({...letterForm, letter_type: v})}
                            options={[
                              { value: "sick_leave", label: "إجازة مرضية" },
                              { value: "annual_leave", label: "إجازة سنوية" },
                              { value: "personal_leave", label: "إجازة شخصية" },
                              { value: "absence", label: "خطاب غياب بدون عذر" },
                              { value: "other", label: "خطاب إداري آخر" }
                            ]}
                          />
                          <LuxuryFormInput 
                            label="تاريخ البداية" 
                            type="date" 
                            value={letterForm.start_date} 
                            onChange={(v) => setLetterForm({...letterForm, start_date: v})} 
                          />
                          <LuxuryFormInput 
                            label="تاريخ النهاية" 
                            type="date" 
                            value={letterForm.end_date} 
                            onChange={(v) => setLetterForm({...letterForm, end_date: v})} 
                          />
                          <LuxuryFormInput 
                            label="المدة الإجمالية (بالأيام)" 
                            type="number" 
                            placeholder="عدد الأيام" 
                            value={letterForm.duration_days} 
                            onChange={(v) => setLetterForm({...letterForm, duration_days: v})} 
                          />
                          <LuxuryFormInput 
                            label="مبلغ الغرامة المترتبة" 
                            type="number" 
                            placeholder="0.00" 
                            value={letterForm.violation_amount} 
                            onChange={(v) => setLetterForm({...letterForm, violation_amount: v})} 
                          />
                          <LuxuryFormInput 
                            label="تفاصيل وملاحظات الخطاب" 
                            placeholder="اكتب هنا كافة تفاصيل الخطاب..." 
                            value={letterForm.letter_details} 
                            onChange={(v) => setLetterForm({...letterForm, letter_details: v})} 
                          />
                          <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-6 pt-6">
                            <button
                              type="button"
                              onClick={() => setShowLetterForm(false)}
                              className="px-10 py-4 rounded-2xl font-black bg-white text-gray-500 hover:bg-gray-100 transition-all shadow-xl border-2 border-gray-100"
                            >
                              إلغاء العملية
                            </button>
                            <button
                              type="submit"
                              className="premium-button w-full bg-gradient-to-r from-rose-600 to-rose-800 text-white py-4 px-12 text-sm shadow-rose-500/30"
                            >
                              <Save size={22} />
                              تأكيد وحفظ الخطاب الإداري
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {letters.map((l) => (
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        key={l.id} 
                        className="p-10 rounded-[3rem] bg-white border-4 border-gray-50 space-y-8 hover:border-rose-200 transition-all group relative overflow-hidden shadow-2xl"
                      >
                        <div className="absolute top-0 left-0 w-3 h-full bg-rose-500/20 group-hover:bg-rose-500 transition-colors" />
                        <div className="flex justify-between items-start">
                          <div className="h-20 w-20 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-xl group-hover:scale-110 transition-transform border-4 border-white">
                            <Mail size={36} strokeWidth={2.5} />
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="px-6 py-2.5 rounded-2xl bg-gray-50 text-[11px] font-black text-gray-500 uppercase border-2 border-white shadow-inner tracking-widest">
                              {l.start_date} إلى {l.end_date}
                            </span>
                            <button
                              onClick={() => handleDeleteLetter(l.id)}
                              className="p-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-md active:scale-90"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <span className={`px-5 py-2 rounded-2xl text-xs font-black shadow-lg ${
                              l.letter_type === 'sick_leave' ? 'bg-blue-600 text-white' :
                              l.letter_type === 'annual_leave' ? 'bg-green-600 text-white' :
                              l.letter_type === 'personal_leave' ? 'bg-purple-600 text-white' :
                              l.letter_type === 'absence' ? 'bg-red-600 text-white' :
                              'bg-gray-600 text-white'
                            }`}>
                              {l.letter_type === 'sick_leave' ? 'إجازة مرضية' :
                               l.letter_type === 'annual_leave' ? 'إجازة سنوية' :
                               l.letter_type === 'personal_leave' ? 'إجازة شخصية' :
                               l.letter_type === 'absence' ? 'غياب بدون عذر' : 'خطاب إداري'}
                            </span>
                            <span className="text-gray-400 font-bold text-xs">سجل الموظف الرسمي</span>
                          </div>
                          <div className="bg-slate-50 p-6 rounded-[2rem] border-4 border-white shadow-inner">
                            <p className="text-sm font-bold text-gray-700 leading-relaxed text-right">{l.letter_details || 'لا توجد ملاحظات إضافية مسجلة لهذا الخطاب.'}</p>
                          </div>
                        </div>
                        <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border-4 border-gray-50 text-xs font-black text-gray-600 shadow-sm">
                            <CalendarDays size={20} className="text-rose-400" />
                            <span>المدة الزمنية: {l.duration_days} يوم عمل</span>
                          </div>
                          {Number(l.violation_amount) > 0 && (
                            <div className="flex items-center gap-4 bg-red-50 text-red-700 px-6 py-3 rounded-2xl border-4 border-red-100 text-xs font-black shadow-sm">
                              <AlertTriangle size={20} />
                              <span>الغرامة: {Number(l.violation_amount).toLocaleString()} ر.س</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {letters.length === 0 && (
                      <div className="col-span-full py-32 text-center text-gray-300 font-black bg-gray-50/50 rounded-[4rem] border-8 border-dashed border-gray-100">
                        <Mail size={80} className="mx-auto mb-6 opacity-10" />
                        <p className="text-2xl">لا توجد خطابات إدارية مسجلة</p>
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

function LuxuryField({ label, value, onChange, editable, type = "text", icon }: any) {
  return (
    <div className="group relative bg-white p-8 rounded-[2.5rem] border-4 border-gray-50 hover:border-blue-100 transition-all duration-500 shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-2xl text-blue-500 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-inner border-2 border-blue-50">
          {icon && React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: 2.5 })}
        </div>
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] group-hover:text-blue-600 transition-colors">
          {label}
        </label>
      </div>
      
      {editable ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-50 border-4 border-gray-50 rounded-[1.5rem] py-4 px-6 text-sm font-black text-gray-800 focus:border-blue-400 focus:ring-12 focus:ring-blue-100 outline-none transition-all shadow-inner"
        />
      ) : (
        <div className="w-full bg-slate-50/30 border-4 border-transparent rounded-[1.5rem] py-5 px-6 text-lg font-black text-gray-900 min-h-[70px] flex items-center shadow-inner group-hover:bg-white transition-all">
          {value || '---'}
        </div>
      )}
    </div>
  );
}

function LuxuryFormInput({ label, type = "text", placeholder, value, onChange }: any) {
  return (
    <div className="space-y-3">
      <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border-4 border-white rounded-2xl py-4 px-6 text-sm font-black text-gray-800 focus:border-blue-400 outline-none transition-all shadow-2xl shadow-black/5"
      />
    </div>
  );
}

function LuxuryFormSelect({ label, value, onChange, options }: any) {
  return (
    <div className="space-y-3">
      <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border-4 border-white rounded-2xl py-4 px-6 text-sm font-black text-gray-800 focus:border-blue-400 outline-none transition-all shadow-2xl shadow-black/5"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function DocumentCard({ label, path }: any) {
  const imageUrl = getPublicUrl(path);

  const handleView = () => {
    if (imageUrl) window.open(imageUrl, '_blank');
  };

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group space-y-6"
    >
      <div 
        onClick={handleView}
        className="relative overflow-hidden rounded-[3rem] border-8 border-white shadow-2xl bg-slate-100 flex items-center justify-center cursor-pointer transition-all hover:shadow-indigo-200 aspect-square"
      >
        {imageUrl ? (
          <>
            <img src={imageUrl} alt={label} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-5 backdrop-blur-md">
              <div className="bg-white text-indigo-900 p-4 rounded-3xl shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                <Eye size={32} />
              </div>
              <span className="text-white text-[10px] font-black uppercase tracking-[0.4em] transform translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">عرض المستند</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-6 text-gray-300">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl">
              <FileText size={56} className="opacity-10" strokeWidth={1} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.3em]">غير متوفر</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-6">
        <div className="flex flex-col">
          <span className="text-sm font-black text-gray-900 leading-none mb-2">{label}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Official Digital Record</span>
        </div>
        {imageUrl && (
          <div className="flex gap-2">
            <button 
              onClick={handleView}
              className="h-12 w-12 rounded-2xl bg-white text-gray-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-xl border-4 border-gray-50"
            >
              <ExternalLink size={20} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, color, unit = "", icon }: any) {
  const colors: any = {
    blue: "bg-blue-600 shadow-blue-500/30",
    green: "bg-emerald-600 shadow-emerald-500/30",
    red: "bg-red-600 shadow-red-500/30",
    purple: "bg-purple-600 shadow-purple-500/30",
    orange: "bg-orange-500 shadow-orange-500/30"
  };

  return (
    <motion.div 
      whileHover={{ y: -10, scale: 1.02 }}
      className={`p-10 rounded-[3rem] ${colors[color]} text-white text-center space-y-4 shadow-2xl relative overflow-hidden group`}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="bg-white/20 p-4 rounded-3xl w-fit mx-auto shadow-inner border border-white/10 group-hover:scale-110 transition-transform">
        {icon && React.cloneElement(icon as React.ReactElement, { size: 32, strokeWidth: 2.5 })}
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-70 group-hover:opacity-100 transition-opacity">{label}</p>
      <div className="text-4xl font-black tracking-tighter drop-shadow-lg">
        {(value || 0).toLocaleString()}
        {unit && <span className="text-lg mr-2 font-bold opacity-80">{unit}</span>}
      </div>
    </motion.div>
  );
}

function StatBox({ label, value, color, unit = "" }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-red-50 text-red-700 border-red-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100"
  };

  return (
    <div className={`p-10 rounded-[2.5rem] border-4 ${colors[color]} text-center space-y-3 shadow-xl hover:shadow-2xl transition-all cursor-default group relative overflow-hidden bg-white`}>
      <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-50 group-hover:opacity-100 transition-opacity">{label}</p>
      <div className="text-3xl font-black tracking-tighter">
        {(value || 0).toLocaleString()}
        {unit && <span className="text-sm mr-2 font-bold opacity-60">{unit}</span>}
      </div>
    </div>
  );
}
