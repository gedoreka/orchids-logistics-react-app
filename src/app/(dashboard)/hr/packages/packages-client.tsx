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
  Car,
  Sparkles,
  BadgeCheck,
  TrendingUp,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Settings,
  Zap
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
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredPackages = packages.filter(pkg =>
    pkg.group_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: packages.length,
    targetType: packages.filter(p => p.work_type === 'target').length,
    salaryType: packages.filter(p => p.work_type === 'salary').length,
    commissionType: packages.filter(p => p.work_type === 'commission').length,
  };

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen pb-20">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[95%] mx-auto px-4 pt-6 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Package className="text-white" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                <Link href="/hr" className="hover:text-purple-600 transition-colors flex items-center gap-1">
                  <LayoutDashboard size={12} />
                  شؤون الموظفين
                </Link>
                <ArrowRight size={12} className="rotate-180" />
                <span className="text-purple-600">إدارة الباقات</span>
              </div>
              <h1 className="text-xl font-black text-gray-900">باقات الموظفين</h1>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="text-xs font-black text-purple-700">{packages.length} باقة</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 transition-all font-black text-sm shadow-lg shadow-purple-500/30"
            >
              <Plus size={18} />
              إنشاء باقة جديدة
            </motion.button>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 p-5 shadow-lg shadow-purple-500/30">
              <div className="flex items-start justify-between">
                <div className="text-white/90"><Package size={22} /></div>
                <span className="text-[10px] font-black text-white/70 bg-white/10 px-2 py-0.5 rounded-full">إجمالي</span>
              </div>
              <div className="mt-4">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">إجمالي الباقات</p>
                <motion.p 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-3xl font-black text-white mt-1"
                >
                  {stats.total}
                </motion.p>
                <p className="text-white/60 text-[10px] font-bold mt-1">جميع مجموعات العمل</p>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-5 shadow-lg shadow-blue-500/30">
              <div className="flex items-start justify-between">
                <div className="text-white/90"><Target size={22} /></div>
                <span className="text-[10px] font-black text-white/90 bg-white/20 px-2 py-0.5 rounded-full">تارجت</span>
              </div>
              <div className="mt-4">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">نظام التارجت</p>
                <motion.p 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-3xl font-black text-white mt-1"
                >
                  {stats.targetType}
                </motion.p>
                <p className="text-white/60 text-[10px] font-bold mt-1">باقات بنظام الهدف</p>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 shadow-lg shadow-emerald-500/30">
              <div className="flex items-start justify-between">
                <div className="text-white/90"><DollarSign size={22} /></div>
                <span className="text-[10px] font-black text-white/90 bg-white/20 px-2 py-0.5 rounded-full">راتب</span>
              </div>
              <div className="mt-4">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">نظام الراتب</p>
                <motion.p 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="text-3xl font-black text-white mt-1"
                >
                  {stats.salaryType}
                </motion.p>
                <p className="text-white/60 text-[10px] font-bold mt-1">باقات بنظام الراتب</p>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 shadow-lg shadow-amber-500/30">
              <div className="flex items-start justify-between">
                <div className="text-white/90"><Zap size={22} /></div>
                <span className="text-[10px] font-black text-white/90 bg-white/20 px-2 py-0.5 rounded-full">عمولة</span>
              </div>
              <div className="mt-4">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">نظام العمولة</p>
                <motion.p 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="text-3xl font-black text-white mt-1"
                >
                  {stats.commissionType}
                </motion.p>
                <p className="text-white/60 text-[10px] font-bold mt-1">باقات بنظام العمولة</p>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Package className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-black">قائمة الباقات</h3>
                  <p className="text-slate-400 text-xs font-bold">{filteredPackages.length} باقة في القائمة</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 sm:min-w-[300px]">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="البحث باسم الباقة..."
                    className="w-full pr-12 pl-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:bg-white/20 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all font-bold text-xs border border-white/10"
                >
                  <Filter size={16} />
                  تصفية
                </motion.button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                {filteredPackages.map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-gray-50 rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-purple-200 hover:bg-white transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center text-purple-600 group-hover:from-purple-500 group-hover:to-violet-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-purple-500/20">
                        <Package size={26} />
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-gray-900 mb-2 line-clamp-1">{pkg.group_name}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                          pkg.work_type === 'target' 
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200' 
                            : pkg.work_type === 'salary' 
                            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-gradient-to-r from-amber-50 to-orange-50 text-orange-700 border border-orange-200'
                        }`}>
                          {pkg.work_type === 'target' && <Target size={12} />}
                          {pkg.work_type === 'salary' && <DollarSign size={12} />}
                          {pkg.work_type === 'commission' && <Zap size={12} />}
                          {pkg.work_type === 'target' ? 'نظام التارجت' : pkg.work_type === 'salary' ? 'نظام الراتب' : 'نظام العمولة'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-xl p-4 border border-gray-100 group-hover:border-purple-100 transition-colors">
                          <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                            <Target size={12} />
                            <span className="text-[9px] font-black uppercase tracking-wider">التارجت</span>
                          </div>
                          <div className="text-xl font-black text-gray-900">{pkg.monthly_target}</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 group-hover:border-purple-100 transition-colors">
                          <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                            <Trophy size={12} />
                            <span className="text-[9px] font-black uppercase tracking-wider">البونص</span>
                          </div>
                          <div className="text-xl font-black text-gray-900">{pkg.bonus_after_target}</div>
                        </div>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedPackage(pkg);
                            setIsAddEmployeesModalOpen(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3.5 rounded-xl text-xs font-black shadow-lg shadow-purple-500/20 hover:from-purple-700 hover:to-violet-700 transition-all"
                        >
                          <UserPlus size={16} />
                          <span>إضافة موظفين</span>
                        </motion.button>
                        <Link 
                          href={`/hr/packages/${pkg.id}`}
                          className="h-[50px] w-[50px] rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-all group-hover:shadow-lg"
                        >
                          <Eye size={20} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredPackages.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center gap-4">
                  <div className="h-24 w-24 rounded-3xl bg-gray-100 flex items-center justify-center">
                    <Package size={48} className="text-gray-300" />
                  </div>
                  <p className="text-lg font-black text-gray-400">لا توجد باقات مطابقة للبحث</p>
                  <p className="text-sm font-bold text-gray-300">جرب البحث بكلمات مختلفة أو أنشئ باقة جديدة</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(true)}
                    className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all font-bold text-sm"
                  >
                    <Plus size={16} />
                    إنشاء باقة جديدة
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <span>إجمالي الباقات: {filteredPackages.length}</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Target size={14} className="text-blue-500" />
                  {stats.targetType} تارجت
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign size={14} className="text-emerald-500" />
                  {stats.salaryType} راتب
                </span>
                <span className="flex items-center gap-1">
                  <Zap size={14} className="text-amber-500" />
                  {stats.commissionType} عمولة
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-purple-500" />
            <span>نظام إدارة الباقات - ZoolSpeed Logistics</span>
          </div>
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-md" 
              onClick={() => setIsModalOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[95vw] h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-6 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Package className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">إنشاء باقة وموظفين</h3>
                    <p className="text-white/70 font-bold text-xs mt-0.5">تحديد نظام العمل وإدخال بيانات الفريق</p>
                  </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                        <Package size={12} className="text-purple-500" />
                        اسم الباقة
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.group_name}
                        onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                        placeholder="أدخل اسم الباقة"
                        className="w-full bg-white border-2 border-purple-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-700 focus:border-purple-400 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                        <Target size={12} className="text-purple-500" />
                        التارجت الشهري
                      </label>
                      <input
                        type="number"
                        disabled={formData.work_type === 'salary' || formData.work_type === 'commission'}
                        value={formData.monthly_target}
                        onChange={(e) => setFormData({ ...formData, monthly_target: parseInt(e.target.value) })}
                        placeholder="أدخل التارجت الشهري"
                        className="w-full bg-white border-2 border-purple-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-700 focus:border-purple-400 outline-none transition-all disabled:opacity-50 disabled:bg-gray-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                        <Trophy size={12} className="text-purple-500" />
                        البونص بعد التارجت
                      </label>
                      <input
                        type="number"
                        disabled={formData.work_type === 'salary' || formData.work_type === 'commission'}
                        value={formData.bonus_after_target}
                        onChange={(e) => setFormData({ ...formData, bonus_after_target: parseFloat(e.target.value) })}
                        className="w-full bg-white border-2 border-purple-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-700 focus:border-purple-400 outline-none transition-all disabled:opacity-50 disabled:bg-gray-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                        <Settings size={12} className="text-purple-500" />
                        نظام العمل
                      </label>
                      <select
                        value={formData.work_type}
                        onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                        className="w-full bg-white border-2 border-purple-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-700 focus:border-purple-400 outline-none transition-all"
                      >
                        <option value="target">نظام تارجت</option>
                        <option value="salary">نظام راتب</option>
                        <option value="commission">نظام عمولة</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => downloadTemplate(false)}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-black hover:bg-blue-100 transition-all border border-blue-100"
                    >
                      <Download size={18} />
                      تحميل قالب Excel
                    </motion.button>
                    <label className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-black hover:bg-emerald-100 transition-all border border-emerald-100 cursor-pointer">
                      <Upload size={18} />
                      رفع ملف Excel
                      <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFileUpload(e, false)} />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Users size={20} className="text-purple-500" />
                        بيانات الموظفين (نظام {formData.work_type === 'target' ? 'التارجت' : formData.work_type === 'salary' ? 'الراتب' : 'العمولة'})
                      </h4>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => addEmployeeRow(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-xl text-xs font-black hover:bg-purple-200 transition-all"
                      >
                        <Plus size={16} />
                        إضافة موظف
                      </motion.button>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                      <table className="w-full text-right border-collapse">
                        <thead className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
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
                            <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="اسم الموظف"
                                  value={emp.name}
                                  onChange={(e) => updateEmployee(idx, "name", e.target.value, false)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
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
                                      className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      placeholder="المسمى الوظيفي"
                                      value={emp.job_title}
                                      onChange={(e) => updateEmployee(idx, "job_title", e.target.value, false)}
                                      className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
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
                                      className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      placeholder="رقم المستخدم"
                                      value={emp.user_code}
                                      onChange={(e) => updateEmployee(idx, "user_code", e.target.value, false)}
                                      className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
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
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="966XXXXXXXXX"
                                  value={emp.phone}
                                  onChange={(e) => updateEmployee(idx, "phone", e.target.value, false)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="email"
                                  placeholder="example@mail.com"
                                  value={emp.email}
                                  onChange={(e) => updateEmployee(idx, "email", e.target.value, false)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={emp.basic_salary}
                                  onChange={(e) => updateEmployee(idx, "basic_salary", parseFloat(e.target.value), false)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={emp.housing_allowance}
                                  onChange={(e) => updateEmployee(idx, "housing_allowance", parseFloat(e.target.value), false)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                />
                              </td>
                              {formData.work_type !== 'salary' && (
                                <td className="p-2">
                                  <input
                                    type="text"
                                    placeholder="لوحة المركبة"
                                    value={emp.vehicle_plate}
                                    onChange={(e) => updateEmployee(idx, "vehicle_plate", e.target.value, false)}
                                    className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                  />
                                </td>
                              )}
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="SA..."
                                  value={emp.iban}
                                  onChange={(e) => updateEmployee(idx, "iban", e.target.value, false)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                />
                              </td>
                              <td className="p-4">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  type="button"
                                  onClick={() => removeEmployeeRow(idx, false)}
                                  className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                                >
                                  <Trash2 size={14} />
                                </motion.button>
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
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  form="packageForm"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl text-base font-black shadow-lg shadow-emerald-500/20 disabled:opacity-50 hover:from-emerald-600 hover:to-teal-700 transition-all"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={20} />
                      <span>حفظ الباقة والموظفين</span>
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 bg-white border-2 border-gray-200 text-gray-500 py-4 rounded-2xl text-base font-black hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  إلغاء
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

        {isAddEmployeesModalOpen && selectedPackage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-md" 
              onClick={() => setIsAddEmployeesModalOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[95vw] h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-6 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <UserPlus className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">إضافة موظفين لباقة: {selectedPackage.group_name}</h3>
                    <p className="text-white/70 font-bold text-xs mt-0.5">نظام العمل: {selectedPackage.work_type === 'target' ? 'تارجت' : selectedPackage.work_type === 'salary' ? 'راتب' : 'عمولة'}</p>
                  </div>
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
                  <div className="flex justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => downloadTemplate(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-black hover:bg-blue-100 transition-all border border-blue-100"
                    >
                      <Download size={18} />
                      تحميل قالب Excel
                    </motion.button>
                    <label className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-black hover:bg-emerald-100 transition-all border border-emerald-100 cursor-pointer">
                      <Upload size={18} />
                      رفع ملف Excel
                      <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFileUpload(e, true)} />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Users size={20} className="text-purple-500" />
                        بيانات الموظفين المضافين
                      </h4>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => addEmployeeRow(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-xl text-xs font-black hover:bg-purple-200 transition-all"
                      >
                        <Plus size={16} />
                        إضافة موظف جديد
                      </motion.button>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                      <table className="w-full text-right border-collapse">
                        <thead className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
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
                            <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="اسم الموظف"
                                  value={emp.name}
                                  onChange={(e) => updateEmployee(idx, "name", e.target.value, true)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
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
                                      className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      placeholder="المسمى الوظيفي"
                                      value={emp.job_title}
                                      onChange={(e) => updateEmployee(idx, "job_title", e.target.value, true)}
                                      className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
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
                                      className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      placeholder="رقم المستخدم"
                                      value={emp.user_code}
                                      onChange={(e) => updateEmployee(idx, "user_code", e.target.value, true)}
                                      className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
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
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="966XXXXXXXXX"
                                  value={emp.phone}
                                  onChange={(e) => updateEmployee(idx, "phone", e.target.value, true)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="email"
                                  placeholder="example@mail.com"
                                  value={emp.email}
                                  onChange={(e) => updateEmployee(idx, "email", e.target.value, true)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={emp.basic_salary}
                                  onChange={(e) => updateEmployee(idx, "basic_salary", parseFloat(e.target.value), true)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={emp.housing_allowance}
                                  onChange={(e) => updateEmployee(idx, "housing_allowance", parseFloat(e.target.value), true)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                />
                              </td>
                              {selectedPackage.work_type !== 'salary' && (
                                <td className="p-2">
                                  <input
                                    type="text"
                                    placeholder="لوحة المركبة"
                                    value={emp.vehicle_plate}
                                    onChange={(e) => updateEmployee(idx, "vehicle_plate", e.target.value, true)}
                                    className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                  />
                                </td>
                              )}
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="SA..."
                                  value={emp.iban}
                                  onChange={(e) => updateEmployee(idx, "iban", e.target.value, true)}
                                  className="w-full bg-transparent border-0 focus:ring-0 text-sm font-bold px-3 py-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                                />
                              </td>
                              <td className="p-4">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  type="button"
                                  onClick={() => removeEmployeeRow(idx, true)}
                                  className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                                >
                                  <Trash2 size={14} />
                                </motion.button>
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
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  form="addEmployeesForm"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl text-base font-black shadow-lg shadow-emerald-500/20 disabled:opacity-50 hover:from-emerald-600 hover:to-teal-700 transition-all"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={20} />
                      <span>إضافة الموظفين للباقة</span>
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={() => setIsAddEmployeesModalOpen(false)}
                  className="px-8 bg-white border-2 border-gray-200 text-gray-500 py-4 rounded-2xl text-base font-black hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  إلغاء
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
