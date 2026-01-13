"use client";

import React, { useState, useEffect } from "react";
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
    CheckCircle2
  } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { 
  updateEmployeePersonalInfo, 
  updateEmployeeBankInfo, 
  toggleEmployeeStatus,
  addViolation,
  addLetter
} from "@/lib/actions/hr";
import Link from "next/link";
import { useRouter } from "next/navigation";

const getPublicUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://xaexoopjqkrzhbochbef.supabase.co/storage/v1/object/public/${path}`;
};

interface EmployeeDetailsClientProps {
  employee: any;
  allEmployees: any[];
  violations: any[];
  letters: any[];
  stats: any;
  monthlyData: any[];
}

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
    birth_date: employee.birth_date ? new Date(employee.birth_date).toISOString().split('T')[0] : "",
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
  
    return (
      <div className="flex flex-col h-[calc(100vh-140px)] space-y-4 max-w-[1800px] mx-auto px-4 overflow-hidden">
        
        <div className="bg-[#2c3e50] p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl border-b-4 border-yellow-500/20 shrink-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[200%] bg-white/20 rotate-12 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Profile Picture Section */}
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

      <div className="flex items-center gap-3 overflow-x-auto pb-2 px-2 no-scrollbar shrink-0 justify-start">
        <TabButton id="general" icon={<User size={20} />} label="العامة" active={activeTab === "general"} onClick={setActiveTab} />
        <TabButton id="bank" icon={<University size={20} />} label="البنك" active={activeTab === "bank"} onClick={setActiveTab} />
        <TabButton id="documents" icon={<FileText size={20} />} label="المستندات" active={activeTab === "documents"} onClick={setActiveTab} />
        <TabButton id="violations" icon={<OctagonAlert size={20} />} label="المخالفات" active={activeTab === "violations"} onClick={setActiveTab} />
        <TabButton id="status" icon={<IdCard size={20} />} label="الإقامة" active={activeTab === "status"} onClick={setActiveTab} />
        <TabButton id="stats" icon={<BarChart3 size={20} />} label="الأداء" active={activeTab === "stats"} onClick={setActiveTab} />
        <TabButton id="letters" icon={<Mail size={20} />} label="الخطابات" active={activeTab === "letters"} onClick={setActiveTab} />
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-gray-200/70 overflow-hidden border border-gray-100 flex flex-col min-h-0">
        <div className="bg-[#3498db] p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md shadow-inner">
              <Info size={18} />
            </div>
            <h3 className="text-lg font-black tracking-tight">
              {activeTab === "general" ? "المعلومات الأساسية" : 
               activeTab === "bank" ? "تفاصيل الحساب البنكي" :
               activeTab === "documents" ? "المستندات والوثائق" :
               activeTab === "violations" ? "سجل المخالفات" :
               activeTab === "stats" ? "إحصائيات الأداء" : "خطابات السائق"}
            </h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleToggleStatus}
              className={`h-9 px-4 rounded-xl text-[10px] font-black transition-all shadow-lg backdrop-blur-md ${
                employee.is_active === 1 
                ? 'bg-orange-600 text-white' 
                : 'bg-green-600 text-white'
              }`}
            >
              {employee.is_active === 1 ? 'إجازة' : 'تفعيل'}
            </button>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/20 hover:bg-white/30 text-white px-5 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all backdrop-blur-md border border-white/10 shadow-lg"
            >
              <Edit3 size={14} />
              {isEditing ? 'إلغاء' : 'تعديل'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "general" && (
                <form onSubmit={handleUpdatePersonal} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-right">
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
                      <button type="submit" className="bg-[#9b59b6] hover:bg-[#8e44ad] text-white px-12 py-4 rounded-xl font-black shadow-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95">
                        <Save size={20} />
                        حفظ التغييرات
                      </button>
                    </div>
                  )}
                </form>
              )}

              {activeTab === "bank" && (
                <form onSubmit={handleUpdateBank} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right max-w-4xl mx-auto">
                  <InfoField label="اسم البنك" value={bankInfo.bank_name} onChange={(v: string) => setBankInfo({...bankInfo, bank_name: v})} editable={isEditing} icon={<Building size={16} />} />
                  <InfoField label="رقم الحساب" value={bankInfo.bank_account} onChange={(v: string) => setBankInfo({...bankInfo, bank_account: v})} editable={isEditing} icon={<Hash size={16} />} />
                  <InfoField label="رقم الآيبان IBAN" value={bankInfo.iban} onChange={(v: string) => setBankInfo({...bankInfo, iban: v})} editable={isEditing} className="col-span-full" icon={<CreditCard size={16} />} />
                  
                  {isEditing && (
                    <div className="col-span-full pt-8 flex justify-center">
                      <button type="submit" className="bg-[#9b59b6] hover:bg-[#8e44ad] text-white px-12 py-4 rounded-xl font-black shadow-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95">
                        <Save size={20} />
                        حفظ بيانات البنك
                      </button>
                    </div>
                  )}
                </form>
              )}

              {activeTab === "documents" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <DocumentCard label="الصورة الشخصية" path={employee.personal_photo} />
                  <DocumentCard label="صورة الإقامة" path={employee.iqama_file} />
                  <DocumentCard label="رخصة القيادة" path={employee.license_file} />
                  <DocumentCard label="استمارة المركبة" path={employee.vehicle_file} />
                  <DocumentCard label="تصريح أجير" path={employee.agir_permit_file} />
                  <DocumentCard label="عقد العمل" path={employee.work_contract_file} />
                  <DocumentCard label="بطاقة التشغيل" path={employee.vehicle_operation_card} />
                </div>
              )}

              {activeTab === "violations" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatBox label="إجمالي المخالفات" value={violations.reduce((acc, v) => acc + Number(v.violation_amount), 0)} color="red" />
                    <StatBox label="تم خصمه" value={violations.reduce((acc, v) => acc + Number(v.deducted_amount), 0)} color="green" />
                    <StatBox label="المتبقي" value={violations.reduce((acc, v) => acc + Number(v.remaining_amount), 0)} color="blue" />
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">التاريخ</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">النوع</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">المبلغ</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {violations.map((v) => (
                          <tr key={v.id} className="hover:bg-gray-50 transition-all group">
                            <td className="px-6 py-4 text-xs font-bold text-gray-700">{v.violation_date}</td>
                            <td className="px-6 py-4 text-xs font-black text-gray-900">{v.violation_type}</td>
                            <td className="px-6 py-4 text-xs font-black text-red-600 bg-red-50 group-hover:bg-red-50 transition-colors">{v.violation_amount} ر.س</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                                v.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {v.status === 'paid' ? 'تم السداد' : 'معلق'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {violations.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold">لا توجد مخالفات مسجلة</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "stats" && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatBox label="إجمالي الطلبات" value={stats.total_orders} color="blue" />
                    <StatBox label="إجمالي الرواتب" value={stats.total_salary} color="green" unit="ر.س" />
                    <StatBox label="متوسط الطلبات" value={Math.round(stats.avg_orders)} color="purple" />
                    <StatBox label="عدد الشهور" value={stats.total_months} color="orange" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                      <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600">
                        <History size={20} />
                      </div>
                      <h3 className="text-lg font-black text-gray-900">السجل الشهري للأداء</h3>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                      <table className="w-full text-right">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase">الشهر</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase">الطلبات</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase">التارجت</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase">البونص</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase">الخصومات</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase">صافي الراتب</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {monthlyData.map((m, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-all">
                              <td className="px-6 py-4 text-xs font-black text-gray-900">{m.payroll_month}</td>
                              <td className="px-6 py-4 text-xs font-black text-blue-600">{m.successful_orders}</td>
                              <td className="px-6 py-4 text-xs font-bold text-gray-600">{m.target}</td>
                              <td className="px-6 py-4 text-xs font-black text-green-600">+{m.bonus}</td>
                              <td className="px-6 py-4 text-xs font-black text-red-600">-{m.total_deduction}</td>
                              <td className="px-6 py-4 text-sm font-black text-gray-900 bg-gray-50">{Number(m.net_salary).toLocaleString()} ر.س</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "letters" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {letters.map((l) => (
                    <div key={l.id} className="p-6 rounded-2xl bg-slate-50 border border-gray-100 space-y-4 hover:border-purple-300 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-200" />
                      <div className="flex justify-between items-start">
                        <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-lg group-hover:scale-110 transition-transform">
                          <Mail size={24} />
                        </div>
                        <span className="px-3 py-1.5 rounded-lg bg-white text-[9px] font-black text-gray-500 uppercase border border-gray-100 shadow-sm">
                          {l.created_at}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-gray-900 mb-1">{l.letter_type}</h4>
                        <p className="text-xs font-bold text-gray-500 leading-relaxed bg-white p-3 rounded-lg border border-white shadow-inner">{l.letter_details}</p>
                      </div>
                      <div className="pt-3 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-400">
                        <span className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-md border border-gray-100">
                          <Calendar size={12} className="text-gray-300" />
                          المدة: {l.duration_days} أيام
                        </span>
                        <span className="flex items-center gap-2 bg-red-50 text-red-600 px-2.5 py-1 rounded-md border border-red-100">
                          <AlertTriangle size={12} />
                          المخالفة: {l.violation_amount} ر.س
                        </span>
                      </div>
                    </div>
                  ))}
                  {letters.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-400 font-bold bg-slate-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <Mail size={32} className="mx-auto mb-3 opacity-10" />
                      لا توجد خطابات مسجلة لهذا الموظف
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TabButton({ id, icon, label, active, onClick }: any) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex flex-col items-center justify-center gap-3 min-w-[110px] h-[110px] rounded-2xl transition-all duration-300 group relative ${
        active 
        ? 'bg-white text-blue-600 shadow-xl -translate-y-2 border-b-2 border-blue-600' 
        : 'bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'
      }`}
    >
      <div className={`${active ? 'text-blue-600' : 'text-gray-600'} transition-all duration-300 group-hover:scale-110`}>
        {icon}
      </div>
      <span className={`text-[10px] font-black text-center px-3 leading-tight tracking-wide ${active ? 'text-blue-600' : 'text-gray-500'}`}>{label}</span>
      {active && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full" />
      )}
    </button>
  );
}

function InfoField({ label, value, onChange, editable, type = "text", className = "", icon }: any) {
  return (
    <div className={`space-y-2.5 ${className} group`}>
      <label className="text-[10px] font-black text-gray-400 mr-1 flex items-center gap-2 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
        <div className="bg-gray-100 p-1 rounded-md text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
          {icon}
        </div>
        {label}
      </label>
      {editable ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-50 border-2 border-gray-100 rounded-xl py-3 px-5 text-xs font-black text-gray-800 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
        />
      ) : (
        <div className="w-full bg-white border border-gray-100 rounded-xl py-3.5 px-5 text-xs font-black text-gray-900 min-h-[48px] flex items-center shadow-sm group-hover:shadow-md transition-all">
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
    <div className="group space-y-3">
      <div 
        onClick={handleView}
        className="relative overflow-hidden rounded-2xl border-4 border-white shadow-lg bg-slate-50 flex items-center justify-center cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] aspect-video"
      >
        {imageUrl ? (
          <>
            <img src={imageUrl} alt={label} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2">
              <div className="h-10 px-5 rounded-xl bg-white text-black text-[10px] font-black flex items-center gap-2 shadow-xl hover:scale-105 transition-all">
                <Eye size={16} />
                عرض المستند
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-300">
            <div className="bg-gray-100 p-4 rounded-xl">
              <FileText size={32} className="opacity-20" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">لم يتم رفع الملف</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-black text-gray-900 uppercase tracking-tight">{label}</span>
        {imageUrl && (
          <button 
            onClick={handleView}
            className="h-8 w-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
          >
            <Eye size={16} />
          </button>
        )}
      </div>
    </div>
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
    <div className={`p-6 rounded-2xl border-2 ${colors[color]} text-center space-y-1 shadow-md hover:scale-[1.02] transition-all cursor-default group`}>
      <p className="text-[9px] font-black uppercase tracking-[0.15em] opacity-60 group-hover:opacity-100 transition-opacity">{label}</p>
      <div className="text-2xl font-black tracking-tighter">
        {value.toLocaleString()}
        {unit && <span className="text-[10px] mr-1 font-bold opacity-70">{unit}</span>}
      </div>
    </div>
  );
}
