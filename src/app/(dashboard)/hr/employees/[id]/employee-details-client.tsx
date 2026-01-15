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
    general: { icon: User, label: "البيانات", bg: "bg-blue-600", color: "blue", light: "bg-blue-50", text: "text-blue-600" },
    bank: { icon: University, label: "البنك", bg: "bg-emerald-600", color: "emerald", light: "bg-emerald-50", text: "text-emerald-600" },
    status: { icon: ShieldCheck, label: "الإقامة", bg: "bg-purple-600", color: "purple", light: "bg-purple-50", text: "text-purple-600" },
    documents: { icon: FileText, label: "المستندات", bg: "bg-indigo-600", color: "indigo", light: "bg-indigo-50", text: "text-indigo-600" },
    violations: { icon: AlertOctagon, label: "المخالفات", bg: "bg-red-600", color: "red", light: "bg-red-50", text: "text-red-600" },
    stats: { icon: BarChart3, label: "الإحصائيات", bg: "bg-slate-800", color: "slate", light: "bg-slate-50", text: "text-slate-800" },
    letters: { icon: Mail, label: "الخطابات", bg: "bg-rose-600", color: "rose", light: "bg-rose-50", text: "text-rose-600" },
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
      <div className="flex h-[calc(100vh-100px)] max-w-[98%] mx-auto animate-pulse gap-4">
        <div className="w-72 bg-gray-100 rounded-2xl shrink-0" />
        <div className="flex-1 bg-gray-100 rounded-2xl" />
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
    <div className="flex h-[calc(100vh-100px)] max-w-[98%] mx-auto gap-4 overflow-hidden">
      <div className="w-[280px] shrink-0 flex flex-col gap-3">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-14 w-14 rounded-xl border-2 border-white/10 overflow-hidden bg-slate-700/50 shrink-0">
                {getPublicUrl(employee.personal_photo) ? (
                  <img src={getPublicUrl(employee.personal_photo)!} alt={employee.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white/30"><User size={24} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-black text-white truncate leading-tight">{employee.name}</h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] font-bold text-slate-400">#{employee.user_code || '---'}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${employee.is_active === 1 ? 'bg-green-400' : 'bg-orange-400'} animate-pulse`} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between bg-white/5 rounded-lg px-2.5 py-1.5">
                <span className="text-slate-400 flex items-center gap-1.5"><Briefcase size={10} /> الباقة</span>
                <span className="text-white font-bold truncate max-w-[120px]">{employee.group_name}</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 rounded-lg px-2.5 py-1.5">
                <span className="text-slate-400 flex items-center gap-1.5"><IdCard size={10} /> الإقامة</span>
                <span className="text-white font-bold">{employee.iqama_number || '---'}</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 rounded-lg px-2.5 py-1.5">
                <span className="text-slate-400 flex items-center gap-1.5"><Globe size={10} /> الجنسية</span>
                <span className="text-white font-bold">{employee.nationality || '---'}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Link href={`/hr/packages/${employee.package_id}`} className="flex-1">
                <button className="w-full bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1.5 transition-all">
                  <ArrowRight size={12} />
                  الباقة
                </button>
              </Link>
              <button 
                onClick={handleToggleStatus}
                className={`flex-1 px-3 py-2 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                  employee.is_active === 1 ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {employee.is_active === 1 ? <Umbrella size={12} /> : <CheckCircle2 size={12} />}
                {employee.is_active === 1 ? 'إجازة' : 'تفعيل'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-gray-400 uppercase">التنقل</span>
            <button onClick={() => setIsPopupOpen(true)} className="text-[9px] font-bold text-blue-600 hover:text-blue-800">
              عرض الكل ({allEmployees.length})
            </button>
          </div>
          <div className="flex gap-2">
            {prevEmployee ? (
              <Link href={`/hr/employees/${prevEmployee.id}`} className="flex-1">
                <div className="bg-slate-50 hover:bg-blue-50 p-2 rounded-lg transition-all group">
                  <div className="flex items-center gap-1.5">
                    <ChevronRight size={14} className="text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                    <div className="min-w-0">
                      <p className="text-[8px] text-gray-400 font-bold">السابق</p>
                      <p className="text-[9px] font-black text-gray-700 truncate">{prevEmployee.name}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ) : <div className="flex-1 bg-gray-50 rounded-lg p-2 opacity-40"><p className="text-[9px] text-gray-400">لا يوجد</p></div>}
            
            {nextEmployee ? (
              <Link href={`/hr/employees/${nextEmployee.id}`} className="flex-1">
                <div className="bg-slate-50 hover:bg-blue-50 p-2 rounded-lg transition-all group">
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="min-w-0 text-left">
                      <p className="text-[8px] text-gray-400 font-bold">التالي</p>
                      <p className="text-[9px] font-black text-gray-700 truncate">{nextEmployee.name}</p>
                    </div>
                    <ChevronLeft size={14} className="text-blue-500 group-hover:-translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ) : <div className="flex-1 bg-gray-50 rounded-lg p-2 opacity-40 text-left"><p className="text-[9px] text-gray-400">لا يوجد</p></div>}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm flex-1 overflow-auto">
          <p className="text-[9px] font-black text-gray-400 uppercase px-2 py-1.5">الأقسام</p>
          <div className="space-y-1">
            {Object.entries(tabConfig).map(([id, config]: [string, any]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-right ${
                  activeTab === id 
                    ? `${config.bg} text-white shadow-lg` 
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${activeTab === id ? 'bg-white/20' : config.light}`}>
                  <config.icon size={14} className={activeTab === id ? 'text-white' : config.text} />
                </div>
                <span className="text-[11px] font-black">{config.label}</span>
                {activeTab === id && <div className="mr-auto h-1.5 w-1.5 rounded-full bg-yellow-400" />}
              </button>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl p-3 ${
          iqamaStatus.color === 'red' ? 'bg-red-50 border border-red-100' :
          iqamaStatus.color === 'orange' ? 'bg-orange-50 border border-orange-100' :
          'bg-green-50 border border-green-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer size={14} className={
                iqamaStatus.color === 'red' ? 'text-red-500' :
                iqamaStatus.color === 'orange' ? 'text-orange-500' : 'text-green-500'
              } />
              <span className="text-[10px] font-black text-gray-600">صلاحية الإقامة</span>
            </div>
            <span className={`text-lg font-black ${
              iqamaStatus.color === 'red' ? 'text-red-600' :
              iqamaStatus.color === 'orange' ? 'text-orange-600' : 'text-green-600'
            }`}>{iqamaStatus.days !== null ? Math.abs(iqamaStatus.days) : '--'}</span>
          </div>
          <p className={`text-[9px] font-bold mt-1 ${
            iqamaStatus.color === 'red' ? 'text-red-500' :
            iqamaStatus.color === 'orange' ? 'text-orange-500' : 'text-green-500'
          }`}>{iqamaStatus.text}</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-w-0">
        <div className={`${activeConfig.bg} px-5 py-3 flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/20 p-2 rounded-xl">
              <activeConfig.icon size={18} />
            </div>
            <div>
              <h3 className="text-base font-black">{activeConfig.label}</h3>
              <p className="text-[9px] font-bold opacity-70">تفاصيل البيانات</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(activeTab === "general" || activeTab === "bank") && (
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-gray-900 px-4 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <Edit3 size={12} className={activeConfig.text} />
                {isEditing ? 'إلغاء' : 'تعديل'}
              </button>
            )}
            {activeTab === "violations" && (
              <button 
                onClick={() => setShowViolationForm(!showViolationForm)}
                className="bg-white text-gray-900 px-4 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <PlusCircle size={12} className={activeConfig.text} />
                {showViolationForm ? 'إلغاء' : 'إضافة'}
              </button>
            )}
            {activeTab === "letters" && (
              <button 
                onClick={() => setShowLetterForm(!showLetterForm)}
                className="bg-white text-gray-900 px-4 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <PlusCircle size={12} className={activeConfig.text} />
                {showLetterForm ? 'إلغاء' : 'إضافة'}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {activeTab === "general" && (
                <form onSubmit={handleUpdatePersonal}>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    <CompactField label="رقم الإقامة" value={personalInfo.iqama_number} onChange={(v: string) => setPersonalInfo({...personalInfo, iqama_number: v})} editable={isEditing} icon={<IdCard size={12} />} />
                    <CompactField label="رقم الهوية" value={personalInfo.identity_number} onChange={(v: string) => setPersonalInfo({...personalInfo, identity_number: v})} editable={isEditing} icon={<IdCard size={12} />} />
                    <CompactField label="رقم المستخدم" value={personalInfo.user_code} onChange={(v: string) => setPersonalInfo({...personalInfo, user_code: v})} editable={isEditing} icon={<Hash size={12} />} />
                    <CompactField label="المسمى الوظيفي" value={personalInfo.job_title} onChange={(v: string) => setPersonalInfo({...personalInfo, job_title: v})} editable={isEditing} icon={<Briefcase size={12} />} />
                    <CompactField label="الجنسية" value={personalInfo.nationality} onChange={(v: string) => setPersonalInfo({...personalInfo, nationality: v})} editable={isEditing} icon={<Globe size={12} />} />
                    <CompactField label="رقم الهاتف" value={personalInfo.phone} onChange={(v: string) => setPersonalInfo({...personalInfo, phone: v})} editable={isEditing} icon={<Phone size={12} />} />
                    <CompactField label="البريد الإلكتروني" value={personalInfo.email} onChange={(v: string) => setPersonalInfo({...personalInfo, email: v})} editable={isEditing} type="email" icon={<Mail size={12} />} />
                    <CompactField label="لوحة المركبة" value={personalInfo.vehicle_plate} onChange={(v: string) => setPersonalInfo({...personalInfo, vehicle_plate: v})} editable={isEditing} icon={<Car size={12} />} />
                    <CompactField label="تاريخ الميلاد" value={personalInfo.birth_date} onChange={(v: string) => setPersonalInfo({...personalInfo, birth_date: v})} editable={isEditing} type="date" icon={<Calendar size={12} />} />
                    <CompactField label="رقم الجواز" value={personalInfo.passport_number} onChange={(v: string) => setPersonalInfo({...personalInfo, passport_number: v})} editable={isEditing} icon={<FileText size={12} />} />
                    <CompactField label="كرت التشغيل" value={personalInfo.operation_card_number} onChange={(v: string) => setPersonalInfo({...personalInfo, operation_card_number: v})} editable={isEditing} icon={<IdCard size={12} />} />
                    <CompactField label="الراتب الأساسي" value={personalInfo.basic_salary} onChange={(v: string) => setPersonalInfo({...personalInfo, basic_salary: v})} editable={isEditing} icon={<CreditCard size={12} />} />
                    <CompactField label="بدل السكن" value={personalInfo.housing_allowance} onChange={(v: string) => setPersonalInfo({...personalInfo, housing_allowance: v})} editable={isEditing} icon={<Building size={12} />} />
                  </div>
                  {isEditing && (
                    <div className="mt-4 flex justify-center">
                      <button type="submit" className={`${activeConfig.bg} text-white px-8 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all`}>
                        <Save size={16} />
                        حفظ التغييرات
                      </button>
                    </div>
                  )}
                </form>
              )}

              {activeTab === "bank" && (
                <form onSubmit={handleUpdateBank}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
                    <CompactField label="اسم البنك" value={bankInfo.bank_name} onChange={(v: string) => setBankInfo({...bankInfo, bank_name: v})} editable={isEditing} icon={<Building size={12} />} />
                    <CompactField label="رقم الحساب" value={bankInfo.bank_account} onChange={(v: string) => setBankInfo({...bankInfo, bank_account: v})} editable={isEditing} icon={<Hash size={12} />} />
                    <CompactField label="رقم الآيبان" value={bankInfo.iban} onChange={(v: string) => setBankInfo({...bankInfo, iban: v})} editable={isEditing} icon={<CreditCard size={12} />} />
                  </div>
                  {isEditing && (
                    <div className="mt-4 flex justify-center">
                      <button type="submit" className={`${activeConfig.bg} text-white px-8 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all`}>
                        <Save size={16} />
                        حفظ بيانات البنك
                      </button>
                    </div>
                  )}
                </form>
              )}

              {activeTab === "documents" && (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <CompactDocCard label="الصورة الشخصية" path={employee.personal_photo} />
                  <CompactDocCard label="صورة الإقامة" path={employee.iqama_file} />
                  <CompactDocCard label="رخصة القيادة" path={employee.license_file} />
                  <CompactDocCard label="استمارة المركبة" path={employee.vehicle_file} />
                  <CompactDocCard label="تصريح أجير" path={employee.agir_permit_file} />
                  <CompactDocCard label="عقد العمل" path={employee.work_contract_file} />
                  <CompactDocCard label="بطاقة التشغيل" path={employee.vehicle_operation_card} />
                </div>
              )}

              {activeTab === "status" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-5 rounded-2xl border ${
                      iqamaStatus.color === 'red' ? 'bg-red-50 border-red-100' :
                      iqamaStatus.color === 'orange' ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2.5 rounded-xl bg-white shadow ${
                          iqamaStatus.color === 'red' ? 'text-red-500' :
                          iqamaStatus.color === 'orange' ? 'text-orange-500' : 'text-green-500'
                        }`}><Timer size={20} /></div>
                        <span className="text-[10px] font-black text-gray-500 uppercase">الأيام المتبقية</span>
                      </div>
                      <div className="text-4xl font-black text-center">{iqamaStatus.days !== null ? Math.abs(iqamaStatus.days) : '--'}</div>
                      <p className={`text-xs font-bold text-center mt-2 ${
                        iqamaStatus.color === 'red' ? 'text-red-600' :
                        iqamaStatus.color === 'orange' ? 'text-orange-600' : 'text-green-600'
                      }`}>{iqamaStatus.text}</p>
                    </div>

                    <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-white shadow text-blue-500"><ShieldCheck size={20} /></div>
                        <span className="text-[10px] font-black text-gray-500 uppercase">حالة الصلاحية</span>
                      </div>
                      <div className="text-xl font-black text-blue-900 text-center">
                        {iqamaStatus.days !== null && iqamaStatus.days < 0 ? 'منتهية' : 'سارية'}
                      </div>
                      <div className="flex justify-center mt-2">
                        <span className={`flex items-center gap-1.5 text-[10px] font-bold ${iqamaStatus.days !== null && iqamaStatus.days < 0 ? 'text-red-500' : 'text-green-500'}`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${iqamaStatus.days !== null && iqamaStatus.days < 0 ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                          مراقب
                        </span>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-gray-100 bg-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-purple-50 shadow text-purple-500"><CalendarDays size={20} /></div>
                        <span className="text-[10px] font-black text-gray-500 uppercase">تحديث التاريخ</span>
                      </div>
                      <form onSubmit={handleUpdateExpiry} className="space-y-3">
                        <input 
                          type="date" 
                          value={newExpiryDate}
                          onChange={(e) => setNewExpiryDate(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm font-bold focus:border-purple-400 outline-none"
                          required
                        />
                        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-purple-700 transition-all">
                          <Save size={14} />
                          حفظ
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-5 rounded-2xl text-white flex items-center gap-5">
                    <div className="bg-white/10 p-3 rounded-xl text-yellow-400"><Info size={24} /></div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black mb-1">نظام مراقبة الإقامة</h4>
                      <p className="text-[11px] text-white/60">يتم إرسال تنبيهات قبل 30 يوماً من انتهاء الصلاحية عبر البريد والتطبيق</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-white/10 px-3 py-2 rounded-xl text-center">
                        <span className="text-lg font-black text-yellow-400">30</span>
                        <p className="text-[8px] text-white/40">يوم تنبيه</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "violations" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <MiniStatBox label="إجمالي المخالفات" value={violations.reduce((acc, v) => acc + Number(v.violation_amount), 0)} color="red" />
                    <MiniStatBox label="تم خصمه" value={violations.reduce((acc, v) => acc + Number(v.deducted_amount), 0)} color="green" />
                    <MiniStatBox label="المتبقي" value={violations.reduce((acc, v) => acc + Number(v.remaining_amount), 0)} color="blue" />
                  </div>

                  <AnimatePresence>
                    {(showViolationForm || editingViolation) && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-50 p-4 rounded-xl border border-gray-100 overflow-hidden"
                      >
                        <form onSubmit={editingViolation ? handleUpdateViolation : handleAddViolation} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <select value={editingViolation ? editingViolation.violation_type : newViolation.violation_type} onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, violation_type: e.target.value}) : setNewViolation({...newViolation, violation_type: e.target.value})} className="bg-white border border-gray-100 rounded-lg py-2 px-3 text-xs font-bold">
                            <option value="traffic">مرورية</option>
                            <option value="general">عامة</option>
                          </select>
                          <input type="date" value={editingViolation ? editingViolation.violation_date : newViolation.violation_date} onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, violation_date: e.target.value}) : setNewViolation({...newViolation, violation_date: e.target.value})} className="bg-white border border-gray-100 rounded-lg py-2 px-3 text-xs font-bold" required />
                          <input type="number" placeholder="المبلغ" value={editingViolation ? editingViolation.violation_amount : newViolation.violation_amount} onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, violation_amount: Number(e.target.value)}) : setNewViolation({...newViolation, violation_amount: Number(e.target.value)})} className="bg-white border border-gray-100 rounded-lg py-2 px-3 text-xs font-bold" required />
                          <input type="number" placeholder="المخصوم" value={editingViolation ? editingViolation.deducted_amount : newViolation.deducted_amount} onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, deducted_amount: Number(e.target.value)}) : setNewViolation({...newViolation, deducted_amount: Number(e.target.value)})} className="bg-white border border-gray-100 rounded-lg py-2 px-3 text-xs font-bold" required />
                          <input type="text" placeholder="الوصف" value={editingViolation ? editingViolation.violation_description : newViolation.violation_description} onChange={(e) => editingViolation ? setEditingViolation({...editingViolation, violation_description: e.target.value}) : setNewViolation({...newViolation, violation_description: e.target.value})} className="bg-white border border-gray-100 rounded-lg py-2 px-3 text-xs font-bold col-span-2 md:col-span-3" />
                          <div className="flex gap-2">
                            <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-black">{editingViolation ? 'تحديث' : 'إضافة'}</button>
                            <button type="button" onClick={() => {setEditingViolation(null); setShowViolationForm(false);}} className="px-3 bg-gray-200 rounded-lg text-xs font-bold">✕</button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-2.5 text-[9px] font-black text-gray-400 uppercase">التاريخ</th>
                          <th className="px-4 py-2.5 text-[9px] font-black text-gray-400 uppercase">النوع</th>
                          <th className="px-4 py-2.5 text-[9px] font-black text-gray-400 uppercase">المبلغ</th>
                          <th className="px-4 py-2.5 text-[9px] font-black text-gray-400 uppercase">المخصوم</th>
                          <th className="px-4 py-2.5 text-[9px] font-black text-gray-400 uppercase">المتبقي</th>
                          <th className="px-4 py-2.5 text-[9px] font-black text-gray-400 uppercase text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {violations.map((v) => (
                          <tr key={v.id} className="hover:bg-slate-50 transition-all">
                            <td className="px-4 py-2.5 font-bold text-gray-600">{v.violation_date}</td>
                            <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded text-[9px] font-black ${v.violation_type === 'traffic' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>{v.violation_type === 'traffic' ? 'مرورية' : 'عامة'}</span></td>
                            <td className="px-4 py-2.5 font-black text-red-600">{Number(v.violation_amount).toLocaleString()} ر.س</td>
                            <td className="px-4 py-2.5 font-black text-green-600">{Number(v.deducted_amount).toLocaleString()} ر.س</td>
                            <td className="px-4 py-2.5 font-black text-blue-600">{Number(v.remaining_amount).toLocaleString()} ر.س</td>
                            <td className="px-4 py-2.5">
                              <div className="flex justify-center gap-1">
                                <button onClick={() => setEditingViolation(v)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit3 size={12} /></button>
                                <button onClick={() => handleDeleteViolation(v.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash size={12} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {violations.length === 0 && (
                          <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-300 font-bold">لا توجد مخالفات</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "stats" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <MiniStatBox label="إجمالي الطلبات" value={stats.total_orders} color="blue" />
                    <MiniStatBox label="إجمالي الرواتب" value={stats.total_salary} color="green" unit="ر.س" />
                    <MiniStatBox label="متوسط الطلبات" value={Math.round(stats.avg_orders)} color="purple" />
                    <MiniStatBox label="عدد الشهور" value={stats.total_months} color="orange" />
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-2.5 text-[9px] font-black text-gray-400 uppercase">الشهر</th>
                          <th className="px-4 py-2.5 text-[9px] font-black text-gray-400 uppercase">الطلبات</th>
                          <th className="px-4 py-2.5 text-[9px] font-black text-gray-400 uppercase">التارجت</th>
                          <th className="px-4 py-2.5 text-[9px] font-black text-gray-400 uppercase">البونص</th>
                          <th className="px-4 py-2.5 text-[9px] font-black text-gray-400 uppercase">الخصومات</th>
                          <th className="px-4 py-2.5 text-[9px] font-black text-gray-400 uppercase">صافي الراتب</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {monthlyData.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 font-black text-gray-900">{m.payroll_month}</td>
                            <td className="px-4 py-2.5 font-black text-blue-600">{m.successful_orders}</td>
                            <td className="px-4 py-2.5 font-bold text-gray-500">{m.target}</td>
                            <td className="px-4 py-2.5 font-black text-green-600">+{m.bonus}</td>
                            <td className="px-4 py-2.5 font-black text-red-600">-{m.total_deduction}</td>
                            <td className="px-4 py-2.5 font-black text-gray-900 bg-gray-50">{Number(m.net_salary).toLocaleString()} ر.س</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "letters" && (
                <div className="space-y-4">
                  <AnimatePresence>
                    {(showLetterForm || editingLetter) && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-50 p-4 rounded-xl border border-gray-100 overflow-hidden"
                      >
                        <form onSubmit={editingLetter ? handleUpdateLetter : handleAddLetter} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <select value={editingLetter ? editingLetter.letter_type : newLetter.letter_type} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, letter_type: e.target.value}) : setNewLetter({...newLetter, letter_type: e.target.value})} className="bg-white border border-gray-100 rounded-lg py-2 px-3 text-xs font-bold">
                            <option value="annual_leave">إجازة سنوية</option>
                            <option value="sick_leave">إجازة مرضية</option>
                            <option value="personal_leave">إجازة شخصية</option>
                            <option value="absence">غياب</option>
                            <option value="other">أخرى</option>
                          </select>
                          <input type="date" placeholder="البداية" value={editingLetter ? editingLetter.start_date : newLetter.start_date} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, start_date: e.target.value}) : setNewLetter({...newLetter, start_date: e.target.value})} className="bg-white border border-gray-100 rounded-lg py-2 px-3 text-xs font-bold" required />
                          <input type="date" placeholder="النهاية" value={editingLetter ? editingLetter.end_date : newLetter.end_date} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, end_date: e.target.value}) : setNewLetter({...newLetter, end_date: e.target.value})} className="bg-white border border-gray-100 rounded-lg py-2 px-3 text-xs font-bold" required />
                          <input type="number" placeholder="المدة (أيام)" value={editingLetter ? editingLetter.duration_days : newLetter.duration_days} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, duration_days: Number(e.target.value)}) : setNewLetter({...newLetter, duration_days: Number(e.target.value)})} className="bg-white border border-gray-100 rounded-lg py-2 px-3 text-xs font-bold" required />
                          <input type="number" placeholder="مبلغ المخالفة" value={editingLetter ? editingLetter.violation_amount : newLetter.violation_amount} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, violation_amount: Number(e.target.value)}) : setNewLetter({...newLetter, violation_amount: Number(e.target.value)})} className="bg-white border border-gray-100 rounded-lg py-2 px-3 text-xs font-bold" />
                          <textarea placeholder="التفاصيل" value={editingLetter ? editingLetter.letter_details : newLetter.letter_details} onChange={(e) => editingLetter ? setEditingLetter({...editingLetter, letter_details: e.target.value}) : setNewLetter({...newLetter, letter_details: e.target.value})} rows={1} className="bg-white border border-gray-100 rounded-lg py-2 px-3 text-xs font-bold col-span-2 md:col-span-3" />
                          <div className="col-span-2 md:col-span-3 flex justify-end gap-2">
                            <button type="button" onClick={() => {setEditingLetter(null); setShowLetterForm(false);}} className="px-4 py-2 bg-gray-200 rounded-lg text-xs font-bold">إلغاء</button>
                            <button type="submit" className="px-6 py-2 bg-rose-600 text-white rounded-lg text-xs font-black">{editingLetter ? 'تحديث' : 'حفظ'}</button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {letters.map((l) => (
                      <div key={l.id} className="p-4 rounded-xl bg-slate-50 border border-gray-100 hover:border-rose-200 transition-all group relative">
                        <div className="absolute top-0 right-0 w-1 h-full bg-rose-200 rounded-r-xl" />
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-rose-500 shadow-sm"><Mail size={16} /></div>
                            <div>
                              <h4 className="text-sm font-black text-gray-900">
                                {l.letter_type === 'annual_leave' ? 'إجازة سنوية' : l.letter_type === 'sick_leave' ? 'إجازة مرضية' : l.letter_type === 'personal_leave' ? 'إجازة شخصية' : l.letter_type === 'absence' ? 'غياب' : 'أخرى'}
                              </h4>
                              <span className="text-[9px] font-bold text-gray-400">{l.created_at}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => setEditingLetter(l)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit3 size={12} /></button>
                            <button onClick={() => handleDeleteLetter(l.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash size={12} /></button>
                          </div>
                        </div>
                        {l.letter_details && <p className="text-[11px] font-bold text-gray-500 mb-2 bg-white p-2 rounded-lg">{l.letter_details}</p>}
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="flex items-center gap-1.5 text-gray-500"><Calendar size={12} /> {l.start_date} - {l.end_date} ({l.duration_days} أيام)</span>
                          {l.violation_amount > 0 && <span className="text-rose-600 font-bold">مخالفة: {Number(l.violation_amount).toLocaleString()} ر.س</span>}
                        </div>
                      </div>
                    ))}
                    {letters.length === 0 && (
                      <div className="col-span-full py-12 text-center text-gray-300 font-bold bg-slate-50 rounded-xl border-2 border-dashed border-gray-100">
                        <Mail size={32} className="mx-auto mb-2 opacity-20" />
                        لا يوجد خطابات
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isPopupOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPopupOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
              <div className="bg-slate-800 p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 text-white">
                  <Users size={18} />
                  <span className="text-sm font-black">قائمة الموظفين ({allEmployees.length})</span>
                </div>
                <button onClick={() => setIsPopupOpen(false)} className="text-white/60 hover:text-white"><X size={18} /></button>
              </div>
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input type="text" placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pr-9 pl-3 text-xs font-bold focus:border-blue-400 outline-none" />
                </div>
              </div>
              <div className="flex-1 overflow-auto p-2 space-y-1">
                {filteredEmployees.map((emp) => (
                  <Link key={emp.id} href={`/hr/employees/${emp.id}`} onClick={() => setIsPopupOpen(false)}>
                    <div className={`p-3 rounded-xl flex items-center justify-between transition-all ${emp.id === employee.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}>
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${emp.id === employee.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}><User size={14} /></div>
                        <div>
                          <p className="text-xs font-black text-gray-900">{emp.name}</p>
                          <p className="text-[9px] font-bold text-gray-400">#{emp.user_code || '---'}</p>
                        </div>
                      </div>
                      {emp.id === employee.id && <Check size={14} className="text-blue-600" />}
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CompactField({ label, value, onChange, editable, type = "text", icon }: any) {
  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 hover:border-blue-100 transition-all group">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="text-gray-400 group-hover:text-blue-500 transition-colors">{icon}</div>
        <label className="text-[9px] font-black text-gray-400 uppercase tracking-wide">{label}</label>
      </div>
      {editable ? (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white border border-gray-100 rounded-lg py-1.5 px-2 text-xs font-bold text-gray-800 focus:border-blue-400 outline-none" />
      ) : (
        <div className="text-xs font-black text-gray-900 min-h-[28px] flex items-center">{value || '---'}</div>
      )}
    </div>
  );
}

function CompactDocCard({ label, path }: any) {
  const imageUrl = getPublicUrl(path);
  return (
    <div className="group">
      <div onClick={() => imageUrl && window.open(imageUrl, '_blank')} className="relative overflow-hidden rounded-xl border-2 border-gray-100 bg-slate-50 aspect-video cursor-pointer hover:border-indigo-200 transition-all">
        {imageUrl ? (
          <>
            <img src={imageUrl} alt={label} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-indigo-900/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><Eye size={20} className="text-white" /></div>
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-300">
            <FileText size={24} className="opacity-30" />
            <span className="text-[9px] font-bold mt-1">لم يُرفع</span>
          </div>
        )}
      </div>
      <p className="text-[10px] font-black text-gray-700 mt-1.5 text-center">{label}</p>
    </div>
  );
}

function MiniStatBox({ label, value, color, unit = "" }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-red-50 text-red-700 border-red-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100"
  };
  return (
    <div className={`p-4 rounded-xl border ${colors[color]} text-center`}>
      <p className="text-[9px] font-black uppercase tracking-wide opacity-60 mb-1">{label}</p>
      <div className="text-xl font-black">{value.toLocaleString()}{unit && <span className="text-xs mr-1 font-bold opacity-70">{unit}</span>}</div>
    </div>
  );
}
