"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Users, 
  Trash2, 
  X, 
  Save, 
  ChevronRight,
  Package,
  Target,
  Trophy,
  UserPlus,
  ArrowRight,
  LayoutDashboard,
  Download,
  Upload,
  User,
  CreditCard,
  Briefcase,
  Globe,
  Phone,
  Mail,
  DollarSign,
  Home,
  Car
} from "lucide-react";
import { toast } from "sonner";
import { createPackageWithEmployees, deleteEmployeePackage } from "@/lib/actions/hr";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PackagesClientProps {
  initialPackages: any[];
  companyId: number;
}

export function PackagesClient({ initialPackages, companyId }: PackagesClientProps) {
  const [packages, setPackages] = useState(initialPackages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddEmployeesModalOpen, setIsAddEmployeesModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    group_name: "",
    work_type: "target",
    monthly_target: 0,
    bonus_after_target: 10,
  });

  const [employees, setEmployees] = useState([
    {
      name: "",
      iqama_number: "",
      identity_number: "",
      job_title: "",
      nationality: "",
      user_code: "",
      phone: "",
      email: "",
      basic_salary: 0,
      housing_allowance: 0,
      vehicle_plate: "",
      iban: ""
    }
  ]);

  const [addEmployeesData, setAddEmployeesData] = useState([
    {
      name: "",
      iqama_number: "",
      identity_number: "",
      job_title: "",
      nationality: "",
      user_code: "",
      phone: "",
      email: "",
      basic_salary: 0,
      housing_allowance: 0,
      vehicle_plate: "",
      iban: ""
    }
  ]);

  const addEmployeeRow = (isAddModal = false) => {
    const newRow = {
      name: "",
      iqama_number: "",
      identity_number: "",
      job_title: "",
      nationality: "",
      user_code: "",
      phone: "",
      email: "",
      basic_salary: 0,
      housing_allowance: 0,
      vehicle_plate: "",
      iban: ""
    };
    if (isAddModal) {
      setAddEmployeesData([...addEmployeesData, newRow]);
    } else {
      setEmployees([...employees, newRow]);
    }
  };

  const removeEmployeeRow = (index: number, isAddModal = false) => {
    if (isAddModal) {
      if (addEmployeesData.length === 1) {
        toast.error("يجب وجود موظف واحد على الأقل");
        return;
      }
      setAddEmployeesData(addEmployeesData.filter((_, i) => i !== index));
    } else {
      if (employees.length === 1) {
        toast.error("يجب وجود موظف واحد على الأقل");
        return;
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createPackageWithEmployees({ 
        ...formData, 
        company_id: companyId,
        employees: employees.filter(emp => emp.name.trim() !== "")
      });

      if (result.success) {
        toast.success("تم إنشاء الباقة والموظفين بنجاح");
        router.refresh();
        setIsModalOpen(false);
        // Reset form
        setFormData({
          group_name: "",
          work_type: "target",
          monthly_target: 0,
          bonus_after_target: 10,
        });
        setEmployees([{
          name: "", iqama_number: "", identity_number: "", job_title: "",
          nationality: "", user_code: "", phone: "", email: "",
          basic_salary: 0, housing_allowance: 0, vehicle_plate: "", iban: ""
        }]);
      } else {
        toast.error(result.error || "حدث خطأ أثناء الإضافة");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployeesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;
    setIsLoading(true);

    try {
      const employeesToSave = addEmployeesData
        .filter(emp => emp.name.trim() !== "")
        .map(emp => ({ ...emp, company_id: companyId }));

      if (employeesToSave.length === 0) {
        toast.error("يرجى إدخال بيانات موظف واحد على الأقل");
        setIsLoading(false);
        return;
      }

      const { saveEmployees } = await import("@/lib/actions/hr");
      const result = await saveEmployees(selectedPackage.id, employeesToSave);

      if (result.success) {
        toast.success("تم إضافة الموظفين بنجاح");
        router.refresh();
        setIsAddEmployeesModalOpen(false);
        setAddEmployeesData([{
          name: "", iqama_number: "", identity_number: "", job_title: "",
          nationality: "", user_code: "", phone: "", email: "",
          basic_salary: 0, housing_allowance: 0, vehicle_plate: "", iban: ""
        }]);
      } else {
        toast.error(result.error || "حدث خطأ أثناء الإضافة");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الباقة؟ سيتم حذف جميع الموظفين المرتبطين بها.")) return;

    try {
      const result = await deleteEmployeePackage(id);
      if (result.success) {
        toast.success("تم حذف الباقة بنجاح");
        setPackages(prev => prev.filter(p => p.id !== id));
      } else {
        toast.error(result.error || "حدث خطأ أثناء الحذف");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    }
  };

  const downloadTemplate = (isAddModal = false) => {
    const workType = isAddModal ? selectedPackage?.work_type : formData.work_type;
    const isSalary = workType === 'salary';
    let headers;
    if (isSalary) {
      headers = ["الاسم", "رقم الهوية", "المسمى الوظيفي", "الجنسية", "رقم الهاتف", "البريد الإلكتروني", "الراتب الأساسي", "بدل السكن", "الآيبان"];
    } else {
      headers = ["الاسم", "رقم الإقامة", "الجنسية", "رقم المستخدم", "رقم الهاتف", "البريد الإلكتروني", "الراتب الأساسي", "بدل السكن", "لوحة المركبة", "الآيبان"];
    }
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + 
      (isSalary ? "أحمد محمد,1234567890,محاسب,سعودي,0555555555,ahmed@example.com,5000,1000,SA0000000000000000000000" 
                : "أحمد محمد,1234567890,سعودي,EMP001,0555555555,ahmed@example.com,3000,1000,أ ب ج 1234,SA0000000000000000000000");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `template_${workType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isAddModal = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n");
      const workType = isAddModal ? selectedPackage?.work_type : formData.work_type;
      const isSalary = workType === 'salary';
      
      const newEmployees = lines.slice(1).map(line => {
        const values = line.split(",");
        if (values.length < 5) return null;
        
        if (isSalary) {
          return {
            name: values[0],
            identity_number: values[1],
            job_title: values[2],
            nationality: values[3],
            phone: values[4],
            email: values[5],
            basic_salary: parseFloat(values[6]) || 0,
            housing_allowance: parseFloat(values[7]) || 0,
            iban: values[8],
            iqama_number: "", user_code: "", vehicle_plate: ""
          };
        } else {
          return {
            name: values[0],
            iqama_number: values[1],
            nationality: values[2],
            user_code: values[3],
            phone: values[4],
            email: values[5],
            basic_salary: parseFloat(values[6]) || 0,
            housing_allowance: parseFloat(values[7]) || 0,
            vehicle_plate: values[8],
            iban: values[9],
            identity_number: "", job_title: ""
          };
        }
      }).filter(emp => emp !== null) as any[];

      if (newEmployees.length > 0) {
        if (isAddModal) {
          setAddEmployeesData(newEmployees);
        } else {
          setEmployees(newEmployees);
        }
        toast.success(`تم استيراد ${newEmployees.length} موظف بنجاح`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full space-y-6 overflow-hidden max-w-[1800px] mx-auto px-4">
      <div className="flex items-center gap-2 text-sm font-bold text-gray-400 shrink-0">
        <Link href="/hr" className="hover:text-[#9b59b6] transition-colors flex items-center gap-1">
          <LayoutDashboard size={14} />
          شؤون الموظفين
        </Link>
        <ArrowRight size={14} />
        <span className="text-[#9b59b6]">إدارة الباقات</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#9b59b6] to-[#8e44ad] flex items-center justify-center text-white shadow-lg shadow-[#9b59b6]/20">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">باقات الموظفين</h1>
            <p className="text-gray-500 font-bold text-xs mt-0.5">إدارة المجموعات، ونظم العمل والعمولات</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#9b59b6] to-[#3498db] text-white px-6 py-3 rounded-xl text-sm font-black shadow-lg shadow-[#9b59b6]/20 transition-all"
        >
          <Plus size={18} />
          <span>إنشاء باقة جديدة</span>
        </motion.button>
      </div>

      <div className="flex-1 overflow-auto scrollbar-hide py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-[#9b59b6]/30 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(pkg.id)}
                  className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>

              <div className="space-y-5">
                <div className="h-12 w-12 rounded-xl bg-[#9b59b6]/10 flex items-center justify-center text-[#9b59b6]">
                  <Package size={24} />
                </div>

                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-1">{pkg.group_name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    pkg.work_type === 'target' ? 'bg-blue-50 text-blue-600' : 
                    pkg.work_type === 'salary' ? 'bg-green-50 text-green-600' : 
                    'bg-orange-50 text-orange-600'
                  }`}>
                    {pkg.work_type === 'target' ? 'نظام التارجت' : pkg.work_type === 'salary' ? 'نظام الراتب' : 'نظام العمولة'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                      <Target size={12} />
                      <span className="text-[9px] font-black uppercase tracking-wider">التارجت</span>
                    </div>
                    <div className="text-base font-black text-gray-900">{pkg.monthly_target}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                      <Trophy size={12} />
                      <span className="text-[9px] font-black uppercase tracking-wider">البونص</span>
                    </div>
                    <div className="text-base font-black text-gray-900">{pkg.bonus_after_target}</div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setIsAddEmployeesModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#9b59b6] text-white py-3 rounded-xl text-xs font-black shadow-lg shadow-[#9b59b6]/20 hover:bg-[#8e44ad] transition-all"
                  >
                    <UserPlus size={16} />
                    <span>إضافة موظفين</span>
                  </button>
                  <Link 
                    href={`/hr/packages/${pkg.id}`}
                    className="h-[42px] w-[42px] rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all"
                  >
                    <ChevronRight size={20} className="rotate-180" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}

          {packages.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center gap-3 opacity-30">
              <Users size={60} />
              <span className="text-xl font-black text-center">لا توجد باقات منشأة بعد</span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md" 
              onClick={() => setIsModalOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[95vw] h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-[#9b59b6] to-[#8e44ad] p-6 text-white flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-xl font-black">إنشاء باقة وموظفين</h3>
                  <p className="text-white/70 font-bold text-xs mt-0.5">تحديد نظام العمل وإدخال بيانات الفريق</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 scrollbar-hide">
                <form id="packageForm" onSubmit={handleSubmit} className="space-y-8">
                  {/* Package Info Section */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                        <Package size={12} className="text-[#9b59b6]" />
                        اسم الباقة
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.group_name}
                        onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                        placeholder="أدخل اسم الباقة"
                        className="w-full bg-white border-2 border-gray-100 rounded-xl py-2.5 px-4 text-sm font-bold text-gray-700 focus:border-[#9b59b6]/30 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                        <Target size={12} className="text-[#9b59b6]" />
                        التارجت الشهري
                      </label>
                      <input
                        type="number"
                        disabled={formData.work_type === 'salary' || formData.work_type === 'commission'}
                        value={formData.monthly_target}
                        onChange={(e) => setFormData({ ...formData, monthly_target: parseInt(e.target.value) })}
                        placeholder="أدخل التارجت الشهري"
                        className="w-full bg-white border-2 border-gray-100 rounded-xl py-2.5 px-4 text-sm font-bold text-gray-700 focus:border-[#9b59b6]/30 outline-none transition-all disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                        <Trophy size={12} className="text-[#9b59b6]" />
                        البونص بعد التارجت
                      </label>
                      <input
                        type="number"
                        disabled={formData.work_type === 'salary' || formData.work_type === 'commission'}
                        value={formData.bonus_after_target}
                        onChange={(e) => setFormData({ ...formData, bonus_after_target: parseFloat(e.target.value) })}
                        className="w-full bg-white border-2 border-gray-100 rounded-xl py-2.5 px-4 text-sm font-bold text-gray-700 focus:border-[#9b59b6]/30 outline-none transition-all disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                        <Save size={12} className="text-[#9b59b6]" />
                        نظام العمل
                      </label>
                      <select
                        value={formData.work_type}
                        onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                        className="w-full bg-white border-2 border-gray-100 rounded-xl py-2.5 px-4 text-sm font-bold text-gray-700 focus:border-[#9b59b6]/30 outline-none transition-all"
                      >
                        <option value="target">نظام تارجت</option>
                        <option value="salary">نظام راتب</option>
                        <option value="commission">نظام عمولة</option>
                      </select>
                    </div>
                  </div>

                  {/* Excel Actions */}
                  <div className="flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => downloadTemplate(false)}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-black hover:bg-blue-100 transition-all border border-blue-100"
                    >
                      <Download size={18} />
                      تحميل قالب Excel
                    </button>
                    <label className="flex items-center gap-2 px-6 py-3 bg-teal-50 text-teal-600 rounded-xl text-sm font-black hover:bg-teal-100 transition-all border border-teal-100 cursor-pointer">
                      <Upload size={18} />
                      رفع ملف Excel
                      <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFileUpload(e, false)} />
                    </label>
                  </div>

                  {/* Employees Table Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Users size={20} className="text-[#9b59b6]" />
                        بيانات الموظفين (نظام {formData.work_type === 'target' ? 'التارجت' : formData.work_type === 'salary' ? 'الراتب' : 'العمولة'})
                      </h4>
                      <button
                        type="button"
                        onClick={() => addEmployeeRow(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#9b59b6]/10 text-[#9b59b6] rounded-xl text-xs font-black hover:bg-[#9b59b6]/20 transition-all"
                      >
                        <Plus size={16} />
                        إضافة موظف
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
                      <table className="w-full text-right border-collapse">
                        <thead className="bg-[#9b59b6] text-white">
                          <tr>
                            <th className="p-4 text-xs font-black whitespace-nowrap">اسم الموظف</th>
                            {formData.work_type === 'salary' ? (
                              <>
                                <th className="p-4 text-xs font-black whitespace-nowrap">رقم الهوية</th>
                                <th className="p-4 text-xs font-black whitespace-nowrap">المسمى الوظيفي</th>
                              </>
                            ) : (
                              <>
                                <th className="p-4 text-xs font-black whitespace-nowrap">رقم الإقامة</th>
                                <th className="p-4 text-xs font-black whitespace-nowrap">رقم المستخدم</th>
                              </>
                            )}
                            <th className="p-4 text-xs font-black whitespace-nowrap">الجنسية</th>
                            <th className="p-4 text-xs font-black whitespace-nowrap">رقم الهاتف</th>
                            <th className="p-4 text-xs font-black whitespace-nowrap">البريد الإلكتروني</th>
                            <th className="p-4 text-xs font-black whitespace-nowrap">الراتب الأساسي</th>
                            <th className="p-4 text-xs font-black whitespace-nowrap">بدل السكن</th>
                            {formData.work_type !== 'salary' && (
                              <th className="p-4 text-xs font-black whitespace-nowrap">لوحة المركبة</th>
                            )}
                            <th className="p-4 text-xs font-black whitespace-nowrap">الآيبان</th>
                            <th className="p-4 text-xs font-black whitespace-nowrap">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {employees.map((emp, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="اسم الموظف"
                                  value={emp.name}
                                  onChange={(e) => updateEmployee(idx, "name", e.target.value, false)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                />
                              </td>
                              {formData.work_type === 'salary' ? (
                                <>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      placeholder="رقم الهوية"
                                      value={emp.identity_number}
                                      onChange={(e) => updateEmployee(idx, "identity_number", e.target.value, false)}
                                      className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      placeholder="المسمى الوظيفي"
                                      value={emp.job_title}
                                      onChange={(e) => updateEmployee(idx, "job_title", e.target.value, false)}
                                      className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                    />
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      placeholder="رقم الإقامة"
                                      value={emp.iqama_number}
                                      onChange={(e) => updateEmployee(idx, "iqama_number", e.target.value, false)}
                                      className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      placeholder="رقم المستخدم"
                                      value={emp.user_code}
                                      onChange={(e) => updateEmployee(idx, "user_code", e.target.value, false)}
                                      className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                    />
                                  </td>
                                </>
                              )}
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="الجنسية"
                                  value={emp.nationality}
                                  onChange={(e) => updateEmployee(idx, "nationality", e.target.value, false)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="966XXXXXXXXX"
                                  value={emp.phone}
                                  onChange={(e) => updateEmployee(idx, "phone", e.target.value, false)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="email"
                                  placeholder="example@mail.com"
                                  value={emp.email}
                                  onChange={(e) => updateEmployee(idx, "email", e.target.value, false)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={emp.basic_salary}
                                  onChange={(e) => updateEmployee(idx, "basic_salary", parseFloat(e.target.value), false)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={emp.housing_allowance}
                                  onChange={(e) => updateEmployee(idx, "housing_allowance", parseFloat(e.target.value), false)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                />
                              </td>
                              {formData.work_type !== 'salary' && (
                                <td className="p-2">
                                  <input
                                    type="text"
                                    placeholder="لوحة المركبة"
                                    value={emp.vehicle_plate}
                                    onChange={(e) => updateEmployee(idx, "vehicle_plate", e.target.value, false)}
                                    className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                  />
                                </td>
                              )}
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="SA..."
                                  value={emp.iban}
                                  onChange={(e) => updateEmployee(idx, "iban", e.target.value, false)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                />
                              </td>
                              <td className="p-4">
                                <button
                                  type="button"
                                  onClick={() => removeEmployeeRow(idx, false)}
                                  className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4 shrink-0">
                <button
                  type="submit"
                  form="packageForm"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white py-4 rounded-2xl text-base font-black shadow-lg shadow-green-500/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={20} />
                      <span>حفظ الباقة والموظفين</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 bg-white border-2 border-gray-200 text-gray-500 py-4 rounded-2xl text-base font-black hover:bg-gray-50 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Employees to Existing Package Modal */}
        {isAddEmployeesModalOpen && selectedPackage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md" 
              onClick={() => setIsAddEmployeesModalOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[95vw] h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-[#9b59b6] to-[#8e44ad] p-6 text-white flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-xl font-black">إضافة موظفين لباقة: {selectedPackage.group_name}</h3>
                  <p className="text-white/70 font-bold text-xs mt-0.5">نظام العمل: {selectedPackage.work_type === 'target' ? 'تارجت' : selectedPackage.work_type === 'salary' ? 'راتب' : 'عمولة'}</p>
                </div>
                <button
                  onClick={() => setIsAddEmployeesModalOpen(false)}
                  className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 scrollbar-hide">
                <form id="addEmployeesForm" onSubmit={handleAddEmployeesSubmit} className="space-y-8">
                  {/* Excel Actions */}
                  <div className="flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => downloadTemplate(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-black hover:bg-blue-100 transition-all border border-blue-100"
                    >
                      <Download size={18} />
                      تحميل قالب Excel
                    </button>
                    <label className="flex items-center gap-2 px-6 py-3 bg-teal-50 text-teal-600 rounded-xl text-sm font-black hover:bg-teal-100 transition-all border border-teal-100 cursor-pointer">
                      <Upload size={18} />
                      رفع ملف Excel
                      <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFileUpload(e, true)} />
                    </label>
                  </div>

                  {/* Employees Table Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Users size={20} className="text-[#9b59b6]" />
                        بيانات الموظفين المضافين
                      </h4>
                      <button
                        type="button"
                        onClick={() => addEmployeeRow(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#9b59b6]/10 text-[#9b59b6] rounded-xl text-xs font-black hover:bg-[#9b59b6]/20 transition-all"
                      >
                        <Plus size={16} />
                        إضافة موظف جديد
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
                      <table className="w-full text-right border-collapse">
                        <thead className="bg-[#9b59b6] text-white">
                          <tr>
                            <th className="p-4 text-xs font-black whitespace-nowrap">اسم الموظف</th>
                            {selectedPackage.work_type === 'salary' ? (
                              <>
                                <th className="p-4 text-xs font-black whitespace-nowrap">رقم الهوية</th>
                                <th className="p-4 text-xs font-black whitespace-nowrap">المسمى الوظيفي</th>
                              </>
                            ) : (
                              <>
                                <th className="p-4 text-xs font-black whitespace-nowrap">رقم الإقامة</th>
                                <th className="p-4 text-xs font-black whitespace-nowrap">رقم المستخدم</th>
                              </>
                            )}
                            <th className="p-4 text-xs font-black whitespace-nowrap">الجنسية</th>
                            <th className="p-4 text-xs font-black whitespace-nowrap">رقم الهاتف</th>
                            <th className="p-4 text-xs font-black whitespace-nowrap">البريد الإلكتروني</th>
                            <th className="p-4 text-xs font-black whitespace-nowrap">الراتب الأساسي</th>
                            <th className="p-4 text-xs font-black whitespace-nowrap">بدل السكن</th>
                            {selectedPackage.work_type !== 'salary' && (
                              <th className="p-4 text-xs font-black whitespace-nowrap">لوحة المركبة</th>
                            )}
                            <th className="p-4 text-xs font-black whitespace-nowrap">الآيبان</th>
                            <th className="p-4 text-xs font-black whitespace-nowrap">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {addEmployeesData.map((emp, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="اسم الموظف"
                                  value={emp.name}
                                  onChange={(e) => updateEmployee(idx, "name", e.target.value, true)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                />
                              </td>
                              {selectedPackage.work_type === 'salary' ? (
                                <>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      placeholder="رقم الهوية"
                                      value={emp.identity_number}
                                      onChange={(e) => updateEmployee(idx, "identity_number", e.target.value, true)}
                                      className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      placeholder="المسمى الوظيفي"
                                      value={emp.job_title}
                                      onChange={(e) => updateEmployee(idx, "job_title", e.target.value, true)}
                                      className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                    />
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      placeholder="رقم الإقامة"
                                      value={emp.iqama_number}
                                      onChange={(e) => updateEmployee(idx, "iqama_number", e.target.value, true)}
                                      className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      placeholder="رقم المستخدم"
                                      value={emp.user_code}
                                      onChange={(e) => updateEmployee(idx, "user_code", e.target.value, true)}
                                      className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                    />
                                  </td>
                                </>
                              )}
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="الجنسية"
                                  value={emp.nationality}
                                  onChange={(e) => updateEmployee(idx, "nationality", e.target.value, true)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="966XXXXXXXXX"
                                  value={emp.phone}
                                  onChange={(e) => updateEmployee(idx, "phone", e.target.value, true)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="email"
                                  placeholder="example@mail.com"
                                  value={emp.email}
                                  onChange={(e) => updateEmployee(idx, "email", e.target.value, true)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={emp.basic_salary}
                                  onChange={(e) => updateEmployee(idx, "basic_salary", parseFloat(e.target.value), true)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={emp.housing_allowance}
                                  onChange={(e) => updateEmployee(idx, "housing_allowance", parseFloat(e.target.value), true)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                />
                              </td>
                              {selectedPackage.work_type !== 'salary' && (
                                <td className="p-2">
                                  <input
                                    type="text"
                                    placeholder="لوحة المركبة"
                                    value={emp.vehicle_plate}
                                    onChange={(e) => updateEmployee(idx, "vehicle_plate", e.target.value, true)}
                                    className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                  />
                                </td>
                              )}
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="SA..."
                                  value={emp.iban}
                                  onChange={(e) => updateEmployee(idx, "iban", e.target.value, true)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold"
                                />
                              </td>
                              <td className="p-4">
                                <button
                                  type="button"
                                  onClick={() => removeEmployeeRow(idx, true)}
                                  className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4 shrink-0">
                <button
                  type="submit"
                  form="addEmployeesForm"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white py-4 rounded-2xl text-base font-black shadow-lg shadow-green-500/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={20} />
                      <span>إضافة الموظفين للباقة</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddEmployeesModalOpen(false)}
                  className="px-8 bg-white border-2 border-gray-200 text-gray-500 py-4 rounded-2xl text-base font-black hover:bg-gray-50 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
