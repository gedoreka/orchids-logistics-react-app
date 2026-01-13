"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  X, 
  Save, 
  UserPlus,
  ArrowRight,
  User,
  Hash,
  Globe,
  Code,
  Phone,
  Mail,
  Wallet,
  Home,
  Truck,
  Building
} from "lucide-react";
import { toast } from "sonner";
import { saveEmployees } from "@/lib/actions/hr";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AddEmployeesClientProps {
  package: any;
  companyId: number;
}

export function AddEmployeesClient({ package: pkg, companyId }: AddEmployeesClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState([
    {
      name: "",
      iqama_number: "",
      identity_number: "",
      nationality: "",
      user_code: "",
      phone: "",
      email: "",
      job_title: "",
      basic_salary: 0,
      housing_allowance: 0,
      vehicle_plate: "",
      iban: "",
      company_id: companyId
    }
  ]);

  const addRow = () => {
    setEmployees([
      ...employees,
      {
        name: "",
        iqama_number: "",
        identity_number: "",
        nationality: "",
        user_code: "",
        phone: "",
        email: "",
        job_title: "",
        basic_salary: 0,
        housing_allowance: 0,
        vehicle_plate: "",
        iban: "",
        company_id: companyId
      }
    ]);
  };

  const removeRow = (index: number) => {
    if (employees.length === 1) {
      toast.error("يجب إضافة موظف واحد على الأقل");
      return;
    }
    setEmployees(employees.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string | number) => {
    const newEmployees = [...employees];
    (newEmployees[index] as any)[field] = value;
    setEmployees(newEmployees);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await saveEmployees(pkg.id, employees);
      if (result.success) {
        toast.success(result.message);
        router.push("/hr");
      } else {
        toast.error(result.error || "حدث خطأ أثناء الحفظ");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const isTargetSystem = pkg.work_type === 'target';

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-[#2c3e50] to-[#34495e] rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <UserPlus size={200} />
        </div>
        
        <div className="relative z-10 space-y-6">
          <Link 
            href="/hr"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors font-black text-sm uppercase tracking-widest"
          >
            <ArrowRight size={16} />
            العودة للموارد البشرية
          </Link>

          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">إضافة موظفين جدد</h1>
            <p className="text-white/70 font-bold text-lg">
              جاري الإضافة إلى باقة: <span className="text-[#3498db]">{pkg.group_name}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-black text-sm uppercase tracking-wider">
                {isTargetSystem ? 'نظام التارجت' : 'نظام الشرائح'}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
              <span className="text-white/50 text-[10px] font-black uppercase tracking-wider">العدد الحالي</span>
              <span className="font-black text-sm">{employees.length} موظف</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-end gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 bg-white border-2 border-gray-100 text-gray-900 px-6 py-3 rounded-2xl font-black shadow-sm hover:border-[#3498db] transition-all"
          >
            <Plus size={20} />
            <span>إضافة حقل جديد</span>
          </motion.button>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border-2 border-gray-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">الموظف</th>
                  {isTargetSystem ? (
                    <>
                      <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">الإقامة</th>
                      <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">الجنسية</th>
                      <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">الكود</th>
                    </>
                  ) : (
                    <>
                      <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">رقم الهوية</th>
                      <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">المسمى الوظيفي</th>
                      <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">الجنسية</th>
                    </>
                  )}
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">الاتصال</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">الراتب الأساسي</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">بدل السكن</th>
                  {isTargetSystem && (
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">رقم اللوحة</th>
                  )}
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">IBAN</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {employees.map((emp, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="group border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="relative">
                          <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            required
                            placeholder="اسم الموظف"
                            value={emp.name}
                            onChange={(e) => handleChange(index, 'name', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-12 pl-4 text-sm font-bold text-gray-700 focus:border-[#3498db] outline-none transition-all shadow-sm"
                          />
                        </div>
                      </td>

                      {isTargetSystem ? (
                        <>
                          <td className="p-4 w-[180px]">
                            <div className="relative">
                              <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                              <input
                                type="text"
                                required
                                placeholder="رقم الإقامة"
                                value={emp.iqama_number}
                                onChange={(e) => handleChange(index, 'iqama_number', e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-12 pl-4 text-sm font-bold text-gray-700 focus:border-[#3498db] outline-none transition-all shadow-sm"
                              />
                            </div>
                          </td>
                          <td className="p-4 w-[150px]">
                            <div className="relative">
                              <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                              <input
                                type="text"
                                required
                                placeholder="الجنسية"
                                value={emp.nationality}
                                onChange={(e) => handleChange(index, 'nationality', e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-12 pl-4 text-sm font-bold text-gray-700 focus:border-[#3498db] outline-none transition-all shadow-sm"
                              />
                            </div>
                          </td>
                          <td className="p-4 w-[150px]">
                            <div className="relative">
                              <Code className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                              <input
                                type="text"
                                placeholder="رقم المستخدم"
                                value={emp.user_code}
                                onChange={(e) => handleChange(index, 'user_code', e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-12 pl-4 text-sm font-bold text-gray-700 focus:border-[#3498db] outline-none transition-all shadow-sm"
                              />
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-4 w-[180px]">
                            <div className="relative">
                              <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                              <input
                                type="text"
                                required
                                placeholder="رقم الهوية"
                                value={emp.identity_number}
                                onChange={(e) => handleChange(index, 'identity_number', e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-12 pl-4 text-sm font-bold text-gray-700 focus:border-[#3498db] outline-none transition-all shadow-sm"
                              />
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="relative">
                              <Building className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                              <input
                                type="text"
                                required
                                placeholder="المسمى الوظيفي"
                                value={emp.job_title}
                                onChange={(e) => handleChange(index, 'job_title', e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-12 pl-4 text-sm font-bold text-gray-700 focus:border-[#3498db] outline-none transition-all shadow-sm"
                              />
                            </div>
                          </td>
                          <td className="p-4 w-[150px]">
                            <div className="relative">
                              <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                              <input
                                type="text"
                                required
                                placeholder="الجنسية"
                                value={emp.nationality}
                                onChange={(e) => handleChange(index, 'nationality', e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-12 pl-4 text-sm font-bold text-gray-700 focus:border-[#3498db] outline-none transition-all shadow-sm"
                              />
                            </div>
                          </td>
                        </>
                      )}

                      <td className="p-4 space-y-2">
                        <div className="relative">
                          <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                          <input
                            type="text"
                            placeholder="الجوال"
                            value={emp.phone}
                            onChange={(e) => handleChange(index, 'phone', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl py-2 pr-10 pl-4 text-xs font-bold text-gray-700 focus:border-[#3498db] outline-none transition-all"
                          />
                        </div>
                        <div className="relative">
                          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                          <input
                            type="email"
                            placeholder="البريد"
                            value={emp.email}
                            onChange={(e) => handleChange(index, 'email', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl py-2 pr-10 pl-4 text-xs font-bold text-gray-700 focus:border-[#3498db] outline-none transition-all"
                          />
                        </div>
                      </td>

                      <td className="p-4 w-[150px]">
                        <div className="relative">
                          <Wallet className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="number"
                            required
                            placeholder="0.00"
                            value={emp.basic_salary}
                            onChange={(e) => handleChange(index, 'basic_salary', parseFloat(e.target.value))}
                            className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-12 pl-4 text-sm font-black text-gray-900 focus:border-[#3498db] outline-none transition-all shadow-sm text-center"
                          />
                        </div>
                      </td>

                      <td className="p-4 w-[150px]">
                        <div className="relative">
                          <Home className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="number"
                            placeholder="0.00"
                            value={emp.housing_allowance}
                            onChange={(e) => handleChange(index, 'housing_allowance', parseFloat(e.target.value))}
                            className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-12 pl-4 text-sm font-black text-gray-900 focus:border-[#3498db] outline-none transition-all shadow-sm text-center"
                          />
                        </div>
                      </td>

                      {isTargetSystem && (
                        <td className="p-4 w-[150px]">
                          <div className="relative">
                            <Truck className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                              type="text"
                              placeholder="رقم اللوحة"
                              value={emp.vehicle_plate}
                              onChange={(e) => handleChange(index, 'vehicle_plate', e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-12 pl-4 text-sm font-bold text-gray-700 focus:border-[#3498db] outline-none transition-all shadow-sm"
                            />
                          </div>
                        </td>
                      )}

                      <td className="p-4">
                        <input
                          type="text"
                          placeholder="IBAN"
                          value={emp.iban}
                          onChange={(e) => handleChange(index, 'iban', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold text-gray-700 focus:border-[#3498db] outline-none transition-all shadow-sm"
                        />
                      </td>

                      <td className="p-4">
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => removeRow(index)}
                          className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 pt-10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white px-12 py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={24} />
                <span>حفظ جميع الموظفين</span>
              </>
            )}
          </motion.button>
          
          <Link 
            href="/hr"
            className="px-12 py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black text-xl hover:bg-gray-200 transition-all"
          >
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}
