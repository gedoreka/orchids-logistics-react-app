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
PlusCircle
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
    <div className="space-y-6 pb-20 max-w-[1200px] mx-auto px-4">
      
      {/* Breadcrumbs & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
          <Link href="/hr" className="hover:text-[#9b59b6] transition-colors flex items-center gap-1">
            <LayoutDashboard size={14} />
            شؤون الموظفين
          </Link>
          <ArrowRight size={14} />
          <Link href="/hr/packages" className="hover:text-[#9b59b6] transition-colors">الباقات</Link>
          <ArrowRight size={14} />
          <span className="text-[#9b59b6]">{employee.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {prevEmployee && (
            <Link href={`/hr/employees/${prevEmployee.id}?package_id=${employee.package_id}`}>
              <button className="h-9 px-4 rounded-lg bg-white border border-gray-100 text-xs font-black text-gray-500 hover:border-[#9b59b6] hover:text-[#9b59b6] transition-all flex items-center gap-2 shadow-sm">
                <ChevronRight size={14} />
                السابق
              </button>
            </Link>
          )}
          {nextEmployee && (
            <Link href={`/hr/employees/${nextEmployee.id}?package_id=${employee.package_id}`}>
              <button className="h-9 px-4 rounded-lg bg-white border border-gray-100 text-xs font-black text-gray-500 hover:border-[#9b59b6] hover:text-[#9b59b6] transition-all flex items-center gap-2 shadow-sm">
                التالي
                <ChevronLeft size={14} />
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-[#2c3e50] to-[#34495e]" />
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row md:items-end gap-6 -mt-12">
            <div className="relative group">
              <div className="h-32 w-32 rounded-3xl bg-white p-1 shadow-xl relative z-10 overflow-hidden">
                <img 
                  src={employee.personal_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=9b59b6&color=fff&size=128`} 
                  alt={employee.name}
                  className="h-full w-full object-cover rounded-[1.25rem]"
                />
              </div>
              <button className="absolute bottom-2 right-2 h-8 w-8 rounded-lg bg-[#9b59b6] text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <Camera size={14} />
              </button>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{employee.name}</h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  employee.is_active === 1 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  {employee.is_active === 1 ? 'نشط' : 'في إجازة'}
                </span>
                {employee.is_frozen === 1 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                    مجمد
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Hash size={14} />
                  <span>{employee.user_code}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase size={14} />
                  <span>{employee.group_name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building size={14} />
                  <span>{employee.job_title || 'موظف'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pb-1">
              <button 
                onClick={handleToggleStatus}
                className={`h-10 px-5 rounded-xl text-xs font-black transition-all shadow-sm ${
                  employee.is_active === 1 
                  ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white' 
                  : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                }`}
              >
                {employee.is_active === 1 ? 'تعيين في إجازة' : 'تفعيل الموظف'}
              </button>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="h-10 px-5 rounded-xl bg-[#9b59b6] text-white text-xs font-black shadow-lg shadow-[#9b59b6]/20 hover:bg-[#8e44ad] transition-all"
              >
                {isEditing ? 'إلغاء التعديل' : 'تعديل البيانات'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <TabButton id="general" icon={<User size={16} />} label="المعلومات الشخصية" active={activeTab === "general"} onClick={setActiveTab} />
        <TabButton id="bank" icon={<University size={16} />} label="الحساب البنكي" active={activeTab === "bank"} onClick={setActiveTab} />
        <TabButton id="documents" icon={<FileText size={16} />} label="المستندات" active={activeTab === "documents"} onClick={setActiveTab} />
        <TabButton id="violations" icon={<AlertOctagon size={16} />} label="المخالفات" active={activeTab === "violations"} onClick={setActiveTab} />
        <TabButton id="letters" icon={<Mail size={16} />} label="الخطابات" active={activeTab === "letters"} onClick={setActiveTab} />
        <TabButton id="stats" icon={<BarChart3 size={16} />} label="الإحصائيات" active={activeTab === "stats"} onClick={setActiveTab} />
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 min-h-[400px]"
        >
          {activeTab === "general" && (
            <form onSubmit={handleUpdatePersonal} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-right">
              <InfoField label="رقم الإقامة / الهوية" value={personalInfo.iqama_number} onChange={(v) => setPersonalInfo({...personalInfo, iqama_number: v})} editable={isEditing} icon={<IdCard size={14} />} />
              <InfoField label="الرقم الوظيفي" value={personalInfo.user_code} onChange={(v) => setPersonalInfo({...personalInfo, user_code: v})} editable={isEditing} icon={<Hash size={14} />} />
              <InfoField label="الجنسية" value={personalInfo.nationality} onChange={(v) => setPersonalInfo({...personalInfo, nationality: v})} editable={isEditing} icon={<Globe size={14} />} />
              <InfoField label="رقم الجوال" value={personalInfo.phone} onChange={(v) => setPersonalInfo({...personalInfo, phone: v})} editable={isEditing} icon={<Phone size={14} />} />
              <InfoField label="البريد الإلكتروني" value={personalInfo.email} onChange={(v) => setPersonalInfo({...personalInfo, email: v})} editable={isEditing} type="email" icon={<Mail size={14} />} />
              <InfoField label="رقم اللوحة" value={personalInfo.vehicle_plate} onChange={(v) => setPersonalInfo({...personalInfo, vehicle_plate: v})} editable={isEditing} icon={<Car size={14} />} />
              <InfoField label="تاريخ الميلاد" value={personalInfo.birth_date} onChange={(v) => setPersonalInfo({...personalInfo, birth_date: v})} editable={isEditing} type="date" icon={<Calendar size={14} />} />
              <InfoField label="رقم الجواز" value={personalInfo.passport_number} onChange={(v) => setPersonalInfo({...personalInfo, passport_number: v})} editable={isEditing} icon={<FileText size={14} />} />
              <InfoField label="رقم بطاقة التشغيل" value={personalInfo.operation_card_number} onChange={(v) => setPersonalInfo({...personalInfo, operation_card_number: v})} editable={isEditing} icon={<IdCard size={14} />} />
              
              {isEditing && (
                <div className="col-span-full pt-6 flex justify-center">
                  <button type="submit" className="bg-[#9b59b6] text-white px-10 py-3.5 rounded-xl font-black shadow-lg shadow-[#9b59b6]/20 flex items-center gap-2">
                    <Save size={18} />
                    حفظ التغييرات
                  </button>
                </div>
              )}
            </form>
          )}

          {activeTab === "bank" && (
            <form onSubmit={handleUpdateBank} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right max-w-2xl mx-auto">
              <InfoField label="اسم البنك" value={bankInfo.bank_name} onChange={(v) => setBankInfo({...bankInfo, bank_name: v})} editable={isEditing} icon={<Building size={14} />} />
              <InfoField label="رقم الحساب" value={bankInfo.bank_account} onChange={(v) => setBankInfo({...bankInfo, bank_account: v})} editable={isEditing} icon={<Hash size={14} />} />
              <InfoField label="رقم الآيبان IBAN" value={bankInfo.iban} onChange={(v) => setBankInfo({...bankInfo, iban: v})} editable={isEditing} className="col-span-full" icon={<CreditCard size={14} />} />
              
              {isEditing && (
                <div className="col-span-full pt-6 flex justify-center">
                  <button type="submit" className="bg-[#9b59b6] text-white px-10 py-3.5 rounded-xl font-black shadow-lg shadow-[#9b59b6]/20 flex items-center gap-2">
                    <Save size={18} />
                    حفظ بيانات البنك
                  </button>
                </div>
              )}
            </form>
          )}

          {activeTab === "documents" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <DocumentCard label="صورة الإقامة" path={employee.iqama_file} />
              <DocumentCard label="رخصة القيادة" path={employee.license_file} />
              <DocumentCard label="استمارة المركبة" path={employee.vehicle_file} />
              <DocumentCard label="تصريح أجير" path={employee.agir_permit_file} />
              <DocumentCard label="عقد العمل" path={employee.work_contract_file} />
              <DocumentCard label="بطاقة التشغيل" path={employee.vehicle_operation_card} />
            </div>
          )}

          {activeTab === "violations" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatBox label="إجمالي المخالفات" value={violations.reduce((acc, v) => acc + Number(v.violation_amount), 0)} color="red" />
                <StatBox label="تم خصمه" value={violations.reduce((acc, v) => acc + Number(v.deducted_amount), 0)} color="green" />
                <StatBox label="المتبقي" value={violations.reduce((acc, v) => acc + Number(v.remaining_amount), 0)} color="blue" />
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">التاريخ</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">النوع</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">المبلغ</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {violations.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-gray-700">{format(new Date(v.violation_date), 'yyyy-MM-dd')}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-700">{v.violation_type}</td>
                        <td className="px-6 py-4 text-sm font-black text-red-600">{v.violation_amount} ر.س</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                            v.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
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
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatBox label="إجمالي الطلبات" value={stats.total_orders} color="blue" />
                <StatBox label="إجمالي الرواتب" value={stats.total_salary} color="green" unit="ر.س" />
                <StatBox label="متوسط الطلبات" value={Math.round(stats.avg_orders)} color="purple" />
                <StatBox label="عدد الشهور" value={stats.total_months} color="orange" />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <History className="text-[#9b59b6]" size={20} />
                  السجل الشهري
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">الشهر</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">الطلبات الناجحة</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">التارجت</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">البونص</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">الخصومات</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">صافي الراتب</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {monthlyData.map((m, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-black text-gray-900">{m.payroll_month}</td>
                          <td className="px-6 py-4 text-sm font-bold text-blue-600">{m.successful_orders}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-600">{m.target}</td>
                          <td className="px-6 py-4 text-sm font-bold text-green-600">+{m.bonus}</td>
                          <td className="px-6 py-4 text-sm font-bold text-red-600">-{m.total_deduction}</td>
                          <td className="px-6 py-4 text-sm font-black text-gray-900">{Number(m.net_salary).toLocaleString()} ر.س</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "letters" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {letters.map((l) => (
                <div key={l.id} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-4 hover:border-[#9b59b6]/30 transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-[#9b59b6] shadow-sm">
                      <Mail size={20} />
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-white text-[10px] font-black text-gray-400 uppercase border border-gray-100">
                      {format(new Date(l.created_at), 'yyyy-MM-dd')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 mb-1">{l.letter_type}</h4>
                    <p className="text-xs font-bold text-gray-500 leading-relaxed">{l.letter_details}</p>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-gray-400">
                    <span>المدة: {l.duration_days} أيام</span>
                    <span className="text-red-500">مبلغ المخالفة: {l.violation_amount} ر.س</span>
                  </div>
                </div>
              ))}
              {letters.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 font-bold">لا توجد خطابات مسجلة</div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TabButton({ id, icon, label, active, onClick }: any) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
        active 
        ? 'bg-[#9b59b6] text-white shadow-lg shadow-[#9b59b6]/20' 
        : 'bg-white border border-gray-100 text-gray-400 hover:text-gray-600 hover:border-gray-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function InfoField({ label, value, onChange, editable, type = "text", className = "", icon }: any) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-black text-gray-400 mr-1 flex items-center gap-1.5 uppercase tracking-wider">
        {icon}
        {label}
      </label>
      {editable ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-2.5 px-4 text-sm font-bold text-gray-700 focus:border-[#9b59b6]/30 focus:ring-4 focus:ring-[#9b59b6]/5 outline-none transition-all"
        />
      ) : (
        <div className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 text-sm font-black text-gray-900 min-h-[42px] flex items-center">
          {value || '---'}
        </div>
      )}
    </div>
  );
}

function DocumentCard({ label, path }: any) {
  return (
    <div className="group space-y-3">
      <div className="relative overflow-hidden rounded-2xl border-4 border-white shadow-md bg-gray-50 aspect-[4/3] flex items-center justify-center">
        {path ? (
          <>
            <img src={path} alt={label} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button className="h-10 px-4 rounded-xl bg-white text-black text-xs font-black flex items-center gap-2">
                عرض المكبر
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300">
            <FileText size={40} className="opacity-20" />
            <span className="text-[10px] font-black uppercase tracking-wider">لم يتم الرفع</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-black text-gray-900 uppercase tracking-tight">{label}</span>
        <button className="h-7 w-7 rounded-lg bg-gray-100 text-gray-400 hover:bg-[#9b59b6] hover:text-white transition-all flex items-center justify-center">
          <PlusCircle size={14} />
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value, color, unit = "" }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-red-50 text-red-600 border-red-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100"
  };

  return (
    <div className={`p-5 rounded-2xl border ${colors[color]} text-center space-y-1`}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</p>
      <div className="text-2xl font-black">
        {value}
        {unit && <span className="text-xs mr-1">{unit}</span>}
      </div>
    </div>
);
}
