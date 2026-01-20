"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
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
  Building,
  CheckCircle2,
  AlertCircle,
  Package,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { saveEmployees } from "@/lib/actions/hr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "@/lib/locale-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AddEmployeesClientProps {
  package: any;
  companyId: number;
}

export function AddEmployeesClient({ package: pkg, companyId }: AddEmployeesClientProps) {
  const router = useRouter();
  const t = useTranslations("packages.addEmployeesPage");
  const common = useTranslations("common");
  const { isRTL: isRtl } = useLocale();
  
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
      toast.error(t("mustHaveOneEmployee") || "يجب إضافة موظف واحد على الأقل");
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
        toast.success(t("successMessage"));
        router.push(`/hr/packages/${pkg.id}`);
      } else {
        toast.error(result.error || t("errorMessage"));
      }
    } catch (error) {
      toast.error(t("errorMessage"));
    } finally {
      setIsLoading(false);
    }
  };

  const isTargetSystem = pkg.work_type === 'target';

  return (
    <div className="p-4 md:p-6 space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header Card - Using Balance Sheet Style */}
      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-[#1a2234]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-8 md:p-12">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
          </div>
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 text-center md:text-right">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl rotate-3">
                  <UserPlus className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                    {t("title")}
                  </h1>
                  <p className="text-white/60 font-medium mt-2 text-lg">
                    {t("subtitle")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Link href={`/hr/packages/${pkg.id}`}>
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl font-bold">
                    {isRtl ? <ArrowRight className="ml-2 w-4 h-4" /> : <ArrowLeft className="mr-2 w-4 h-4" />}
                    {t("cancelBtn")}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[1.5rem] group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Package className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-black uppercase tracking-widest">{t("packageName")}</p>
                    <p className="text-xl font-black text-white">{pkg.group_name}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[1.5rem] group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <Building className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-black uppercase tracking-widest">{t("workSystem")}</p>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold">
                      {isTargetSystem ? t("targetSystem") || "نظام التارجت" : t("salarySystem") || "نظام الراتب"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[1.5rem] group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/20 rounded-xl">
                    <UserPlus className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-black uppercase tracking-widest">{t("employeesList")}</p>
                    <p className="text-xl font-black text-white">{employees.length} {t("employees") || common("records")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-between items-center bg-white/50 backdrop-blur-xl p-4 rounded-[2rem] border border-white/20 shadow-lg">
          <h2 className="text-xl font-black text-[#1a2234] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Plus className="w-5 h-5" />
            </div>
            {t("employeesData") || "بيانات الموظفين"}
          </h2>
          <Button
            type="button"
            onClick={addRow}
            className="bg-[#1a2234] hover:bg-[#2c3e50] text-white font-black rounded-xl px-6 h-12 shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t("addNewEmployee") || "إضافة موظف جديد"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <AnimatePresence mode="popLayout">
            {employees.map((emp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative"
              >
                <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl hover:bg-white transition-all group border-2 border-transparent hover:border-blue-200">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-indigo-600 opacity-50" />
                  
                  <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl shadow-inner">
                        {index + 1}
                      </div>
                      <CardTitle className="text-lg font-black text-slate-800">
                        {emp.name || (t("employeeName") || "اسم الموظف")}
                      </CardTitle>
                    </div>
                    {employees.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeRow(index)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </CardHeader>
                  
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {/* Personal Info Group */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <User className="w-3 h-3" /> {t("employeeName")}
                        </label>
                        <div className="relative group/input">
                          <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-500 transition-colors" size={18} />
                          <Input
                            required
                            placeholder={t("employeeName")}
                            value={emp.name}
                            onChange={(e) => handleChange(index, 'name', e.target.value)}
                            className="h-14 rounded-2xl pr-12 bg-white/50 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 font-bold transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Hash className="w-3 h-3" /> {isTargetSystem ? t("iqamaNumber") : t("identityNumber")}
                        </label>
                        <div className="relative group/input">
                          <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-500 transition-colors" size={18} />
                          <Input
                            required
                            placeholder={isTargetSystem ? t("iqamaNumber") : t("identityNumber")}
                            value={isTargetSystem ? emp.iqama_number : emp.identity_number}
                            onChange={(e) => handleChange(index, isTargetSystem ? 'iqama_number' : 'identity_number', e.target.value)}
                            className="h-14 rounded-2xl pr-12 bg-white/50 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 font-bold transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Globe className="w-3 h-3" /> {t("nationality")}
                        </label>
                        <div className="relative group/input">
                          <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-500 transition-colors" size={18} />
                          <Input
                            required
                            placeholder={t("nationality")}
                            value={emp.nationality}
                            onChange={(e) => handleChange(index, 'nationality', e.target.value)}
                            className="h-14 rounded-2xl pr-12 bg-white/50 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 font-bold transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Building className="w-3 h-3" /> {isTargetSystem ? t("userCode") : t("jobTitle")}
                        </label>
                        <div className="relative group/input">
                          {isTargetSystem ? <Code className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} /> : <Building className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />}
                          <Input
                            placeholder={isTargetSystem ? t("userCode") : t("jobTitle")}
                            value={isTargetSystem ? emp.user_code : emp.job_title}
                            onChange={(e) => handleChange(index, isTargetSystem ? 'user_code' : 'job_title', e.target.value)}
                            className="h-14 rounded-2xl pr-12 bg-white/50 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 font-bold transition-all"
                          />
                        </div>
                      </div>

                      {/* Contact & Finance Info */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Phone className="w-3 h-3" /> {t("phoneNumber")}
                        </label>
                        <div className="relative group/input">
                          <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <Input
                            placeholder={t("phoneNumber")}
                            value={emp.phone}
                            onChange={(e) => handleChange(index, 'phone', e.target.value)}
                            className="h-14 rounded-2xl pr-12 bg-white/50 border-slate-200 focus:border-blue-400 font-bold transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Mail className="w-3 h-3" /> {common("email")}
                        </label>
                        <div className="relative group/input">
                          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <Input
                            type="email"
                            placeholder={common("email")}
                            value={emp.email}
                            onChange={(e) => handleChange(index, 'email', e.target.value)}
                            className="h-14 rounded-2xl pr-12 bg-white/50 border-slate-200 focus:border-blue-400 font-bold transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Wallet className="w-3 h-3" /> {t("basicSalary")}
                        </label>
                        <div className="relative group/input">
                          <Wallet className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <Input
                            type="number"
                            required
                            placeholder="0.00"
                            value={emp.basic_salary}
                            onChange={(e) => handleChange(index, 'basic_salary', parseFloat(e.target.value))}
                            className="h-14 rounded-2xl pr-12 bg-white/50 border-slate-200 focus:border-blue-400 font-black text-lg text-blue-600 transition-all text-center"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Home className="w-3 h-3" /> {t("housingAllowance")}
                        </label>
                        <div className="relative group/input">
                          <Home className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={emp.housing_allowance}
                            onChange={(e) => handleChange(index, 'housing_allowance', parseFloat(e.target.value))}
                            className="h-14 rounded-2xl pr-12 bg-white/50 border-slate-200 focus:border-blue-400 font-black text-lg text-blue-600 transition-all text-center"
                          />
                        </div>
                      </div>

                      {isTargetSystem && (
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Truck className="w-3 h-3" /> {t("vehiclePlate")}
                          </label>
                          <div className="relative group/input">
                            <Truck className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <Input
                              placeholder={t("vehiclePlate")}
                              value={emp.vehicle_plate}
                              onChange={(e) => handleChange(index, 'vehicle_plate', e.target.value)}
                              className="h-14 rounded-2xl pr-12 bg-white/50 border-slate-200 focus:border-blue-400 font-bold transition-all"
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-4 lg:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Code className="w-3 h-3" /> IBAN
                        </label>
                        <div className="relative group/input">
                          <Code className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <Input
                            placeholder="SA0000000000000000000000"
                            value={emp.iban}
                            onChange={(e) => handleChange(index, 'iban', e.target.value)}
                            className="h-14 rounded-2xl pr-12 bg-white/50 border-slate-200 focus:border-blue-400 font-mono font-bold transition-all uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-12">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto min-w-[300px] h-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-[2rem] font-black text-2xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {isLoading ? (
              <div className="h-8 w-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-8 h-8 ml-3" />
                {t("addBtn")}
              </>
            )}
          </Button>
          
          <Link href={`/hr/packages/${pkg.id}`} className="w-full md:w-auto">
            <Button 
              type="button"
              variant="outline"
              className="w-full md:w-auto min-w-[200px] h-20 border-slate-200 bg-white text-slate-500 rounded-[2rem] font-black text-2xl hover:bg-slate-50 transition-all"
            >
              {t("cancelBtn")}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
