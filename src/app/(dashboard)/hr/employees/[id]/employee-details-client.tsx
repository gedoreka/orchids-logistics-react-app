"use client";

import React, { useState } from "react";
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
  OctagonAlert
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
  const router = useRouter();

  // Navigation logic
  const currentIndex = allEmployees.findIndex(e => e.id === employee.id);
  const prevEmployee = currentIndex > 0 ? allEmployees[currentIndex - 1] : null;
  const nextEmployee = currentIndex < allEmployees.length - 1 ? allEmployees[currentIndex + 1] : null;

  const [personalInfo, setPersonalInfo] = useState({
    iqama_number: employee.iqama_number || "",
    user_code: employee.user_code || "",
    nationality: employee.nationality || "",
    phone: employee.phone || "",
    email: employee.email || "",
    vehicle_plate: employee.vehicle_plate || "",
    birth_date: employee.birth_date ? format(new Date(employee.birth_date), 'yyyy-MM-dd') : "",
    passport_number: employee.passport_number || "",
    operation_card_number: employee.operation_card_number || ""
  });

  const [bankInfo, setBankInfo] = useState({
    bank_account: employee.bank_account || "",
    iban: employee.iban || "",
    bank_name: employee.bank_name || ""
  });

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
    <div className="bg-[#f0f2f5] min-h-screen -m-4 md:-m-8 p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Top Header Section */}
        <div className="bg-[#2c3e50] p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl border-b-4 border-yellow-500/20">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[200%] bg-white/20 rotate-12 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-3 text-white/90 mb-8 bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
              <User className="text-yellow-400" size={22} />
              <h2 className="text-xl font-black tracking-widest uppercase">تفاصيل الموظف</h2>
            </div>

            <div className="bg-[#34495e]/40 backdrop-blur-xl rounded-[2.5rem] p-10 w-full max-w-5xl flex flex-col items-center border border-white/10 shadow-inner">
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-[0.15em] uppercase mb-8 drop-shadow-2xl text-center leading-tight">
                {employee.name}
              </h1>
              
              <div className="flex flex-wrap justify-center gap-6">
                <div className="bg-[#1a2a3a]/80 px-8 py-3 rounded-2xl flex items-center gap-4 text-sm border border-white/10 group hover:border-yellow-400/50 transition-all shadow-lg">
                  <Hash className="text-yellow-500 group-hover:scale-125 transition-transform" size={20} />
                  <span className="text-yellow-500 font-black">الرقم الوظيفي:</span>
                  <span className="text-white font-black">{employee.user_code || '---'}</span>
                </div>
                <div className="bg-[#1a2a3a]/80 px-8 py-3 rounded-2xl flex items-center gap-4 text-sm border border-white/10 group hover:border-yellow-400/50 transition-all shadow-lg">
                  <Briefcase className="text-yellow-500 group-hover:scale-125 transition-transform" size={20} />
                  <span className="text-yellow-500 font-black">الباقة:</span>
                  <span className="text-white font-black">{employee.group_name}</span>
                </div>
              </div>
            </div>
          </div>

          <Link href={`/hr/packages/${employee.package_id}`} className="absolute top-10 right-10">
            <button className="bg-[#9b59b6] hover:bg-[#8e44ad] text-white px-8 py-4 rounded-[1.25rem] text-xs font-black flex items-center gap-3 transition-all shadow-2xl shadow-[#9b59b6]/40 group active:scale-95">
              <span>العودة للباقة</span>
              <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" />
            </button>
          </Link>
        </div>

        {/* Navigation Card */}
        <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-gray-200/60 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 w-full md:w-auto">
            {prevEmployee && (
              <Link href={`/hr/employees/${prevEmployee.id}?package_id=${employee.package_id}`} className="flex items-center gap-6 bg-[#f8fafc] p-6 rounded-[2rem] border border-gray-100 hover:border-[#3498db] transition-all group w-full shadow-sm hover:shadow-xl">
                <div className="text-right flex-1">
                  <p className="text-[11px] font-black text-gray-400 uppercase mb-2 tracking-wider">الموظف السابق</p>
                  <p className="text-base font-black text-gray-800 group-hover:text-[#3498db] transition-colors">{prevEmployee.name}</p>
                </div>
                <div className="bg-[#3498db] text-white p-4 rounded-2xl shadow-xl shadow-[#3498db]/30 group-hover:scale-110 group-hover:rotate-12 transition-all">
                  <ChevronRight size={24} strokeWidth={3} />
                </div>
              </Link>
            )}
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="bg-[#f0f9ff] p-10 rounded-[2.5rem] flex flex-col items-center gap-4 border border-blue-100 shadow-inner w-80 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3498db] to-transparent" />
              <div className="bg-[#3498db] text-white p-4 rounded-2xl shadow-xl shadow-[#3498db]/30 group-hover:scale-110 transition-transform">
                <User size={32} strokeWidth={2.5} />
              </div>
              <p className="text-xl font-black text-gray-800 tracking-tight">التنقل بين الموظفين</p>
              <p className="text-xs font-bold text-gray-400 bg-white/50 px-3 py-1 rounded-full">الموظف {currentIndex + 1} من {allEmployees.length}</p>
              <div className="w-full h-3 bg-gray-200/50 rounded-full mt-2 overflow-hidden shadow-inner border border-gray-100">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)]" 
                  style={{ width: `${((currentIndex + 1) / allEmployees.length) * 100}%` }}
                />
              </div>
            </div>
            <button className="bg-[#9b59b6] hover:bg-[#8e44ad] text-white px-10 py-4 rounded-[1.25rem] text-sm font-black flex items-center gap-3 shadow-2xl shadow-[#9b59b6]/40 transition-all hover:scale-105 active:scale-95 group">
              <List size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              قائمة الموظفين {allEmployees.length}
            </button>
          </div>

          <div className="flex-1 w-full md:w-auto">
            {nextEmployee && (
              <Link href={`/hr/employees/${nextEmployee.id}?package_id=${employee.package_id}`} className="flex items-center gap-6 bg-[#f8fafc] p-6 rounded-[2rem] border border-gray-100 hover:border-[#3498db] transition-all group w-full shadow-sm hover:shadow-xl">
                <div className="bg-[#3498db] text-white p-4 rounded-2xl shadow-xl shadow-[#3498db]/30 group-hover:scale-110 group-hover:-rotate-12 transition-all">
                  <ChevronLeft size={24} strokeWidth={3} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[11px] font-black text-gray-400 uppercase mb-2 tracking-wider">الموظف التالي</p>
                  <p className="text-base font-black text-gray-800 group-hover:text-[#3498db] transition-colors">{nextEmployee.name}</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="flex items-center gap-6 overflow-x-auto pb-8 px-4 no-scrollbar justify-start xl:justify-center">
          <TabButton id="general" icon={<User size={32} />} label="المعلومات العامة" active={activeTab === "general"} onClick={setActiveTab} />
          <TabButton id="bank" icon={<University size={32} />} label="الحساب البنكي" active={activeTab === "bank"} onClick={setActiveTab} />
          <TabButton id="documents" icon={<FileText size={32} />} label="المستندات" active={activeTab === "documents"} onClick={setActiveTab} />
          <TabButton id="violations" icon={<OctagonAlert size={32} />} label="المخالفات" active={activeTab === "violations"} onClick={setActiveTab} />
          <TabButton id="status" icon={<IdCard size={32} />} label="صلاحية الإقامة" active={activeTab === "status"} onClick={setActiveTab} />
          <TabButton id="stats" icon={<BarChart3 size={32} />} label="الإحصائيات" active={activeTab === "stats"} onClick={setActiveTab} />
          <TabButton id="letters" icon={<Mail size={32} />} label="خطابات السائق" active={activeTab === "letters"} onClick={setActiveTab} />
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/70 overflow-hidden border border-gray-100">
          <div className="bg-[#3498db] p-8 flex items-center justify-between">
            <div className="flex items-center gap-5 text-white">
              <div className="bg-white/20 p-3 rounded-[1.25rem] backdrop-blur-md shadow-inner">
                <Info size={24} />
              </div>
              <h3 className="text-2xl font-black tracking-tight">
                {activeTab === "general" ? "المعلومات الأساسية" : 
                 activeTab === "bank" ? "تفاصيل الحساب البنكي" :
                 activeTab === "documents" ? "المستندات والوثائق" :
                 activeTab === "violations" ? "سجل المخالفات" :
                 activeTab === "stats" ? "إحصائيات الأداء" : "خطابات السائق"}
              </h3>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleToggleStatus}
                className={`h-12 px-6 rounded-[1.25rem] text-xs font-black transition-all shadow-lg backdrop-blur-md ${
                  employee.is_active === 1 
                  ? 'bg-orange-500/20 text-white hover:bg-orange-600 border border-white/10' 
                  : 'bg-green-500/20 text-white hover:bg-green-600 border border-white/10'
                }`}
              >
                {employee.is_active === 1 ? 'تعيين في إجازة' : 'تفعيل الموظف'}
              </button>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-[1.25rem] text-xs font-black flex items-center gap-3 transition-all backdrop-blur-md border border-white/10 shadow-lg"
              >
                <Edit3 size={18} />
                {isEditing ? 'إلغاء التعديل' : 'تعديل المعلومات'}
              </button>
            </div>
          </div>

          <div className="p-12 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "general" && (
                  <form onSubmit={handleUpdatePersonal} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-right">
                    <InfoField label="رقم الإقامة / الهوية" value={personalInfo.iqama_number} onChange={(v: string) => setPersonalInfo({...personalInfo, iqama_number: v})} editable={isEditing} icon={<IdCard size={18} />} />
                    <InfoField label="الرقم الوظيفي" value={personalInfo.user_code} onChange={(v: string) => setPersonalInfo({...personalInfo, user_code: v})} editable={isEditing} icon={<Hash size={18} />} />
                    <InfoField label="الجنسية" value={personalInfo.nationality} onChange={(v: string) => setPersonalInfo({...personalInfo, nationality: v})} editable={isEditing} icon={<Globe size={18} />} />
                    <InfoField label="رقم الجوال" value={personalInfo.phone} onChange={(v: string) => setPersonalInfo({...personalInfo, phone: v})} editable={isEditing} icon={<Phone size={18} />} />
                    <InfoField label="البريد الإلكتروني" value={personalInfo.email} onChange={(v: string) => setPersonalInfo({...personalInfo, email: v})} editable={isEditing} type="email" icon={<Mail size={18} />} />
                    <InfoField label="رقم اللوحة" value={personalInfo.vehicle_plate} onChange={(v: string) => setPersonalInfo({...personalInfo, vehicle_plate: v})} editable={isEditing} icon={<Car size={18} />} />
                    <InfoField label="تاريخ الميلاد" value={personalInfo.birth_date} onChange={(v: string) => setPersonalInfo({...personalInfo, birth_date: v})} editable={isEditing} type="date" icon={<Calendar size={18} />} />
                    <InfoField label="رقم الجواز" value={personalInfo.passport_number} onChange={(v: string) => setPersonalInfo({...personalInfo, passport_number: v})} editable={isEditing} icon={<FileText size={18} />} />
                    <InfoField label="رقم بطاقة التشغيل" value={personalInfo.operation_card_number} onChange={(v: string) => setPersonalInfo({...personalInfo, operation_card_number: v})} editable={isEditing} icon={<IdCard size={18} />} />
                    
                    {isEditing && (
                      <div className="col-span-full pt-10 flex justify-center">
                        <button type="submit" className="bg-[#9b59b6] hover:bg-[#8e44ad] text-white px-16 py-5 rounded-2xl font-black shadow-2xl shadow-[#9b59b6]/40 flex items-center gap-3 transition-all hover:scale-105 active:scale-95">
                          <Save size={24} />
                          حفظ التغييرات
                        </button>
                      </div>
                    )}
                  </form>
                )}

                {activeTab === "bank" && (
                  <form onSubmit={handleUpdateBank} className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right max-w-4xl mx-auto">
                    <InfoField label="اسم البنك" value={bankInfo.bank_name} onChange={(v: string) => setBankInfo({...bankInfo, bank_name: v})} editable={isEditing} icon={<Building size={18} />} />
                    <InfoField label="رقم الحساب" value={bankInfo.bank_account} onChange={(v: string) => setBankInfo({...bankInfo, bank_account: v})} editable={isEditing} icon={<Hash size={18} />} />
                    <InfoField label="رقم الآيبان IBAN" value={bankInfo.iban} onChange={(v: string) => setBankInfo({...bankInfo, iban: v})} editable={isEditing} className="col-span-full" icon={<CreditCard size={18} />} />
                    
                    {isEditing && (
                      <div className="col-span-full pt-10 flex justify-center">
                        <button type="submit" className="bg-[#9b59b6] hover:bg-[#8e44ad] text-white px-16 py-5 rounded-2xl font-black shadow-2xl shadow-[#9b59b6]/40 flex items-center gap-3 transition-all hover:scale-105 active:scale-95">
                          <Save size={24} />
                          حفظ بيانات البنك
                        </button>
                      </div>
                    )}
                  </form>
                )}

                {activeTab === "documents" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    <DocumentCard label="صورة الإقامة" path={employee.iqama_file} />
                    <DocumentCard label="رخصة القيادة" path={employee.license_file} />
                    <DocumentCard label="استمارة المركبة" path={employee.vehicle_file} />
                    <DocumentCard label="تصريح أجير" path={employee.agir_permit_file} />
                    <DocumentCard label="عقد العمل" path={employee.work_contract_file} />
                    <DocumentCard label="بطاقة التشغيل" path={employee.vehicle_operation_card} />
                  </div>
                )}

                {activeTab === "violations" && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <StatBox label="إجمالي المخالفات" value={violations.reduce((acc, v) => acc + Number(v.violation_amount), 0)} color="red" />
                      <StatBox label="تم خصمه" value={violations.reduce((acc, v) => acc + Number(v.deducted_amount), 0)} color="green" />
                      <StatBox label="المتبقي" value={violations.reduce((acc, v) => acc + Number(v.remaining_amount), 0)} color="blue" />
                    </div>

                    <div className="overflow-x-auto rounded-[2rem] border border-gray-100 shadow-sm">
                      <table className="w-full text-right">
                        <thead>
                          <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">التاريخ</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">النوع</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">المبلغ</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">الحالة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {violations.map((v) => (
                            <tr key={v.id} className="hover:bg-gray-50/80 transition-all group">
                              <td className="px-8 py-6 text-sm font-bold text-gray-700">{format(new Date(v.violation_date), 'yyyy-MM-dd')}</td>
                              <td className="px-8 py-6 text-sm font-black text-gray-900">{v.violation_type}</td>
                              <td className="px-8 py-6 text-sm font-black text-red-600 bg-red-50/30 group-hover:bg-red-50 transition-colors">{v.violation_amount} ر.س</td>
                              <td className="px-8 py-6">
                                <span className={`px-4 py-2 rounded-[1rem] text-[11px] font-black uppercase ${
                                  v.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {v.status === 'paid' ? 'تم السداد' : 'معلق'}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {violations.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-bold bg-gray-50/20">لا توجد مخالفات مسجلة</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === "stats" && (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatBox label="إجمالي الطلبات" value={stats.total_orders} color="blue" />
                      <StatBox label="إجمالي الرواتب" value={stats.total_salary} color="green" unit="ر.س" />
                      <StatBox label="متوسط الطلبات" value={Math.round(stats.avg_orders)} color="purple" />
                      <StatBox label="عدد الشهور" value={stats.total_months} color="orange" />
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                        <div className="bg-[#9b59b6]/10 p-3 rounded-2xl text-[#9b59b6]">
                          <History size={24} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">السجل الشهري للأداء</h3>
                      </div>
                      <div className="overflow-x-auto rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <table className="w-full text-right">
                          <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                              <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase">الشهر</th>
                              <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase">الطلبات</th>
                              <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase">التارجت</th>
                              <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase">البونص</th>
                              <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase">الخصومات</th>
                              <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase">صافي الراتب</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {monthlyData.map((m, idx) => (
                              <tr key={idx} className="hover:bg-gray-50/80 transition-all">
                                <td className="px-8 py-6 text-sm font-black text-gray-900">{m.payroll_month}</td>
                                <td className="px-8 py-6 text-sm font-black text-blue-600">{m.successful_orders}</td>
                                <td className="px-8 py-6 text-sm font-bold text-gray-600">{m.target}</td>
                                <td className="px-8 py-6 text-sm font-black text-green-600">+{m.bonus}</td>
                                <td className="px-8 py-6 text-sm font-black text-red-600">-{m.total_deduction}</td>
                                <td className="px-8 py-6 text-base font-black text-gray-900 bg-gray-50/50">{Number(m.net_salary).toLocaleString()} ر.س</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "letters" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {letters.map((l) => (
                      <div key={l.id} className="p-8 rounded-[2rem] bg-[#f8fafc] border border-gray-100 space-y-6 hover:border-[#9b59b6]/30 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-[#9b59b6]/20" />
                        <div className="flex justify-between items-start">
                          <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-[#9b59b6] shadow-xl group-hover:scale-110 transition-transform">
                            <Mail size={28} />
                          </div>
                          <span className="px-4 py-2 rounded-xl bg-white text-xs font-black text-gray-500 uppercase border border-gray-100 shadow-sm">
                            {format(new Date(l.created_at), 'yyyy-MM-dd')}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-gray-900 mb-2">{l.letter_type}</h4>
                          <p className="text-sm font-bold text-gray-500 leading-relaxed bg-white/50 p-4 rounded-xl border border-white shadow-inner">{l.letter_details}</p>
                        </div>
                        <div className="pt-4 flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                          <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                            <Calendar size={14} className="text-gray-300" />
                            المدة: {l.duration_days} أيام
                          </span>
                          <span className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100">
                            <AlertTriangle size={14} />
                            المخالفة: {l.violation_amount} ر.س
                          </span>
                        </div>
                      </div>
                    ))}
                    {letters.length === 0 && (
                      <div className="col-span-full py-24 text-center text-gray-400 font-bold bg-[#f8fafc] rounded-[2rem] border-2 border-dashed border-gray-200">
                        <Mail size={48} className="mx-auto mb-4 opacity-10" />
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
    </div>
  );
}

function TabButton({ id, icon, label, active, onClick }: any) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex flex-col items-center justify-center gap-4 min-w-[150px] h-[150px] rounded-[2.5rem] transition-all duration-500 group relative ${
        active 
        ? 'bg-white text-[#3498db] shadow-[0_20px_50px_rgba(52,152,219,0.3)] -translate-y-4 border-b-4 border-[#3498db]' 
        : 'bg-white/80 backdrop-blur-sm border border-gray-100 text-gray-400 hover:text-[#3498db] hover:border-[#3498db]/30 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-2'
      }`}
    >
      <div className={`${active ? 'text-[#3498db]' : 'text-gray-800'} transition-all duration-500 group-hover:scale-125 group-hover:rotate-6`}>
        {icon}
      </div>
      <span className={`text-[11px] font-black text-center px-4 leading-tight tracking-wide ${active ? 'text-[#3498db]' : 'text-gray-500'}`}>{label}</span>
      {active && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#3498db] rounded-full blur-[2px]" />
      )}
    </button>
  );
}

function InfoField({ label, value, onChange, editable, type = "text", className = "", icon }: any) {
  return (
    <div className={`space-y-3 ${className} group`}>
      <label className="text-[11px] font-black text-gray-400 mr-2 flex items-center gap-2.5 uppercase tracking-widest group-hover:text-[#3498db] transition-colors">
        <div className="bg-gray-100 p-1.5 rounded-lg text-gray-400 group-hover:bg-[#3498db]/10 group-hover:text-[#3498db] transition-all">
          {icon}
        </div>
        {label}
      </label>
      {editable ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#f8fafc] border-2 border-gray-100 rounded-2xl py-3.5 px-6 text-sm font-black text-gray-800 focus:border-[#3498db]/40 focus:ring-8 focus:ring-[#3498db]/5 outline-none transition-all shadow-inner"
        />
      ) : (
        <div className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm font-black text-gray-900 min-h-[56px] flex items-center shadow-sm group-hover:shadow-md transition-all group-hover:border-[#3498db]/20">
          {value || '---'}
        </div>
      )}
    </div>
  );
}

function DocumentCard({ label, path }: any) {
  return (
    <div className="group space-y-4">
      <div className="relative overflow-hidden rounded-[2.5rem] border-8 border-white shadow-xl bg-[#f8fafc] aspect-[4/3] flex items-center justify-center cursor-pointer transition-all hover:shadow-2xl hover:scale-[1.02]">
        {path ? (
          <>
            <img src={path} alt={label} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
              <button className="h-12 px-6 rounded-2xl bg-white text-black text-xs font-black flex items-center gap-2 shadow-2xl hover:scale-110 transition-all">
                <FileText size={18} />
                عرض المستند
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 text-gray-300">
            <div className="bg-gray-100 p-6 rounded-[2rem]">
              <FileText size={48} className="opacity-20" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">لم يتم رفع الملف</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-4">
        <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{label}</span>
        <button className="h-10 w-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-[#9b59b6] hover:text-white transition-all flex items-center justify-center shadow-sm hover:rotate-90">
          <PlusCircle size={20} />
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value, color, unit = "" }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-700 border-blue-100 shadow-blue-100/50",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100/50",
    red: "bg-red-50 text-red-700 border-red-100 shadow-red-100/50",
    purple: "bg-purple-50 text-purple-700 border-purple-100 shadow-purple-100/50",
    orange: "bg-orange-50 text-orange-700 border-orange-100 shadow-orange-100/50"
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border-2 ${colors[color]} text-center space-y-2 shadow-xl hover:scale-105 transition-all cursor-default group`}>
      <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">{label}</p>
      <div className="text-3xl font-black tracking-tighter">
        {value.toLocaleString()}
        {unit && <span className="text-sm mr-2 font-bold opacity-70">{unit}</span>}
      </div>
    </div>
  );
}
