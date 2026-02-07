"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText,
  Save,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calculator,
  DollarSign,
  Target,
  Users,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Edit3
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/locale-context";

interface PayrollItem {
  id: number;
  employee_name: string;
  iqama_number: string;
  user_code: string;
  basic_salary: number;
  housing_allowance: number;
  nationality: string;
  job_title: string;
  target: number;
  successful_orders: number;
  target_deduction: number;
  monthly_bonus: number;
  operator_deduction: number;
  internal_deduction: number;
  wallet_deduction: number;
  internal_bonus: number;
  net_salary: number;
  payment_method: string;
  achieved_tier: string;
  tier_bonus: number;
  extra_amount: number;
}

interface Payroll {
  id: number;
  payroll_month: string;
  package_name: string;
  work_type: string;
  monthly_target: number;
  bonus_after_target: number;
  is_draft: number;
  items: PayrollItem[];
}

interface PayrollEditClientProps {
  payroll: Payroll;
  companyId: number;
}

type ModalType = 'idle' | 'confirm-save' | 'saving' | 'save-success' | 'save-error';

interface ModalState {
  type: ModalType;
  errorMessage?: string;
}

export function PayrollEditClient({ payroll, companyId }: PayrollEditClientProps) {
  const router = useRouter();
  const t = useTranslations("financialVouchersPage.salaryPayrollsPage");
  void companyId;
  const [loading, setLoading] = useState(false);
  const workType = payroll.work_type || 'salary';
  const isSalaryType = workType === 'salary';
  
  const [items, setItems] = useState<PayrollItem[]>(() => {
    return (payroll.items || []).map(item => ({
      ...item,
      basic_salary: Number(item.basic_salary) || 0,
      housing_allowance: Number(item.housing_allowance) || 0,
      target: Number(item.target) || 0,
      successful_orders: Number(item.successful_orders) || 0,
      target_deduction: Number(item.target_deduction) || 0,
      monthly_bonus: Number(item.monthly_bonus) || 0,
      operator_deduction: Number(item.operator_deduction) || 0,
      internal_deduction: Number(item.internal_deduction) || 0,
      wallet_deduction: Number(item.wallet_deduction) || 0,
      internal_bonus: Number(item.internal_bonus) || 0,
      net_salary: Number(item.net_salary) || 0,
      tier_bonus: Number(item.tier_bonus) || 0,
      extra_amount: Number(item.extra_amount) || 0,
    }));
  });

  const [modal, setModal] = useState<ModalState>({ type: 'idle' });

  const calculateRow = useCallback((item: PayrollItem): PayrollItem => {
    let net = 0;
    let targetDeduction = 0;
    let monthlyBonus = 0;

    const basicSalaryVal = Number(item.basic_salary) || 0;
    const housingVal = Number(item.housing_allowance) || 0;
    const internalBonusVal = Number(item.internal_bonus) || 0;
    const operatorVal = Number(item.operator_deduction) || 0;
    const internalVal = Number(item.internal_deduction) || 0;
    const walletVal = Number(item.wallet_deduction) || 0;
    const successfulOrdersVal = Number(item.successful_orders) || 0;

    if (isSalaryType) {
      net = basicSalaryVal + housingVal + internalBonusVal - internalVal;
    } else if (workType === 'target') {
      const target = Number(item.target || payroll.monthly_target || 0);
      const bonusPerOrder = Number(payroll.bonus_after_target) || 10;
      const totalDeductions = operatorVal + internalVal + walletVal;
      
      if (successfulOrdersVal < target) {
        targetDeduction = target > 0 ? (target - successfulOrdersVal) * (basicSalaryVal / target) : 0;
      } else {
        monthlyBonus = (successfulOrdersVal - target) * bonusPerOrder;
      }
      
      net = basicSalaryVal + monthlyBonus + internalBonusVal - targetDeduction - totalDeductions;
    } else {
      const totalDeductions = operatorVal + internalVal + walletVal;
      net = basicSalaryVal + internalBonusVal - totalDeductions;
    }

    return {
      ...item,
      target_deduction: targetDeduction,
      monthly_bonus: monthlyBonus,
      net_salary: net
    };
  }, [payroll, isSalaryType, workType]);

  const handleRowChange = (index: number, field: keyof PayrollItem, value: number | string) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      updated[index] = calculateRow(updated[index]);
      return updated;
    });
  };

  const getTotals = () => {
    let totalSalary = 0;
    let totalOrders = 0;
    let totalDeductions = 0;

    items.forEach(item => {
      const netSalary = Number(item.net_salary) || 0;
      const orders = Number(item.successful_orders) || 0;
      const targetDed = Number(item.target_deduction) || 0;
      const operatorDed = Number(item.operator_deduction) || 0;
      const internalDed = Number(item.internal_deduction) || 0;
      const walletDed = Number(item.wallet_deduction) || 0;
      
      if (netSalary >= 0) totalSalary += netSalary;
      totalOrders += orders;
      
      if (isSalaryType) {
        totalDeductions += internalDed;
      } else {
        totalDeductions += targetDed + operatorDed + internalDed + walletDed;
      }
    });

    return { totalSalary, totalOrders, totalDeductions };
  };

  const closeModal = () => setModal({ type: 'idle' });

  const handleSaveClick = () => {
    setModal({ type: 'confirm-save' });
  };

  const executeSave = async () => {
    setLoading(true);
    setModal({ type: 'saving' });

    try {
      const res = await fetch(`/api/payrolls/${payroll.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });

      if (res.ok) {
        setModal({ type: 'save-success' });
        setTimeout(() => {
          router.push("/salary-payrolls");
          router.refresh();
        }, 3000);
      } else {
        const data = await res.json();
        setModal({ type: 'save-error', errorMessage: data.error || t("editPayroll.notifications.saveFailedMsg") });
      }
    } catch {
      setModal({ type: 'save-error', errorMessage: t("editPayroll.notifications.errorMsg") });
    } finally {
      setLoading(false);
    }
  };

  const getWorkTypeLabel = () => {
    switch (workType) {
      case 'salary': return t("workTypes.salary");
      case 'target': return t("workTypes.target");
      case 'tiers': return t("workTypes.tiers");
      case 'commission': return t("workTypes.commission");
      default: return workType;
    }
  };

  const totals = getTotals();

  return (
    <div className="h-full flex flex-col">
      {/* Premium Edit Modals */}
      <AnimatePresence>
        {modal.type !== 'idle' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !['saving'].includes(modal.type) && closeModal()}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
            />

            {/* Confirm Save */}
            {modal.type === 'confirm-save' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.3)] overflow-hidden border-4 border-blue-500/20"
              >
                <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 p-10 text-white text-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", damping: 15 }}
                    className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Edit3 size={48} className="text-white drop-shadow-lg" />
                    </motion.div>
                  </motion.div>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-black tracking-tight relative z-10"
                  >
                    تأكيد حفظ التعديلات
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/80 font-bold mt-2 relative z-10"
                  >
                    يرجى مراجعة التفاصيل قبل الحفظ
                  </motion.p>
                </div>

                <div className="p-8 text-center space-y-6" dir="rtl">
                  <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-xl p-3 border border-blue-100">
                        <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1">
                          <Calendar size={12} />
                          <span className="text-[10px] font-bold">شهر المسير</span>
                        </div>
                        <p className="font-black text-gray-900 text-sm">{payroll.payroll_month}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-blue-100">
                        <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1">
                          <Layers size={12} />
                          <span className="text-[10px] font-bold">الباقة</span>
                        </div>
                        <p className="font-black text-gray-900 text-sm truncate">{payroll.package_name}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-blue-100">
                        <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1">
                          <Users size={12} />
                          <span className="text-[10px] font-bold">عدد الموظفين</span>
                        </div>
                        <p className="font-black text-gray-900 text-sm">{items.length} موظف</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-blue-100">
                        <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                          <DollarSign size={12} />
                          <span className="text-[10px] font-bold">إجمالي الرواتب</span>
                        </div>
                        <p className="font-black text-emerald-600 text-sm">{totals.totalSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })} {t("stats.sar")}</p>
                      </div>
                    </div>
                    {totals.totalDeductions > 0 && (
                      <div className="mt-3 bg-red-50 rounded-xl p-3 border border-red-100">
                        <div className="flex items-center justify-center gap-1.5 text-red-600 mb-1">
                          <AlertTriangle size={12} />
                          <span className="text-[10px] font-bold">إجمالي الخصومات</span>
                        </div>
                        <p className="font-black text-red-600 text-sm">{totals.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })} {t("stats.sar")}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closeModal}
                      className="flex-1 flex items-center justify-center gap-3 bg-slate-100 text-slate-700 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 transition-colors"
                    >
                      <X size={20} />
                      إلغاء
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={executeSave}
                      className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 border-b-4 border-blue-700/50"
                    >
                      <Save size={20} />
                      تأكيد الحفظ
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Saving - Loading */}
            {modal.type === 'saving' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md bg-white rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.3)] overflow-hidden border-4 border-blue-500/20"
              >
                <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 p-10 text-white text-center overflow-hidden">
                  <motion.div className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30">
                    <Loader2 size={48} className="text-white animate-spin" />
                  </motion.div>
                  <h3 className="text-2xl font-black relative z-10">جاري حفظ التعديلات</h3>
                  <p className="text-white/80 font-bold mt-2 relative z-10">يرجى الانتظار...</p>
                </div>
                <div className="p-8">
                  <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-100">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <p className="text-blue-700 font-bold text-center mt-3 text-sm">
                      جاري تحديث بيانات الموظفين والرواتب...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Save Success */}
            {modal.type === 'save-success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-[0_0_100px_rgba(16,185,129,0.3)] overflow-hidden border-4 border-emerald-500/20"
              >
                <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-10 text-white text-center overflow-hidden">
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: -100, opacity: [0, 1, 0], x: Math.random() * 100 - 50 }}
                        transition={{ delay: i * 0.2, duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        className="absolute"
                        style={{ left: `${15 + i * 15}%` }}
                      >
                        <Sparkles size={20} className="text-white/40" />
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", damping: 12 }}
                    className="relative z-10 mx-auto w-28 h-28 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <CheckCircle2 size={56} className="text-white drop-shadow-lg" />
                    </motion.div>
                  </motion.div>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-black tracking-tight relative z-10"
                  >
                    {t("editPayroll.notifications.saveSuccess")}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/80 font-bold mt-2 relative z-10"
                  >
                    {t("editPayroll.notifications.saveSuccessMsg")}
                  </motion.p>
                </div>

                <div className="p-8 text-center space-y-6" dir="rtl">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-100"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-xl p-3 border border-emerald-100">
                        <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                          <Calendar size={12} />
                          <span className="text-[10px] font-bold">شهر المسير</span>
                        </div>
                        <p className="font-black text-gray-900 text-sm">{payroll.payroll_month}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-emerald-100">
                        <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                          <Layers size={12} />
                          <span className="text-[10px] font-bold">الباقة</span>
                        </div>
                        <p className="font-black text-gray-900 text-sm truncate">{payroll.package_name}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-emerald-100">
                        <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1">
                          <Users size={12} />
                          <span className="text-[10px] font-bold">عدد الموظفين</span>
                        </div>
                        <p className="font-black text-gray-900 text-sm">{items.length} موظف</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-emerald-100">
                        <div className="flex items-center justify-center gap-1.5 text-amber-600 mb-1">
                          <DollarSign size={12} />
                          <span className="text-[10px] font-bold">إجمالي الرواتب</span>
                        </div>
                        <p className="font-black text-emerald-600 text-sm">{totals.totalSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })} {t("stats.sar")}</p>
                      </div>
                    </div>
                    <div className="mt-3 bg-emerald-100 rounded-xl p-2">
                      <p className="text-emerald-700 text-xs font-bold text-center">جاري التوجيه لصفحة المسيرات...</p>
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { router.push("/salary-payrolls"); router.refresh(); }}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-700/50"
                  >
                    <CheckCircle2 size={24} />
                    {t("editPayroll.notifications.ok")}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Save Error */}
            {modal.type === 'save-error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md bg-white rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.3)] overflow-hidden border-4 border-red-500/20"
              >
                <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center overflow-hidden">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                  >
                    <AlertCircle size={48} className="text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-black relative z-10">فشل في حفظ التعديلات</h3>
                  <p className="text-white/80 font-bold mt-2 relative z-10">{modal.errorMessage}</p>
                </div>
                <div className="p-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeModal}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-500/30 border-b-4 border-red-700/50"
                  >
                    {t("editPayroll.notifications.ok")}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto p-4">
        <div className="w-[97%] mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a237e] to-[#283593] p-6 text-white">
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-black">{t("editPayroll.title")}</h1>
                      <p className="text-white/60 text-sm">{payroll.payroll_month} - {payroll.package_name} ({getWorkTypeLabel()})</p>
                    </div>
                  </div>
                  <Link href={`/salary-payrolls/${payroll.id}`}>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/10">
                      <ArrowRight size={16} />
                      <span>{t("editPayroll.back")}</span>
                    </button>
                  </Link>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-br from-[#1a237e] to-[#283593] px-4 py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-white">
                    <Calculator size={18} />
                    <h3 className="font-bold text-sm">{t("editPayroll.editEmployeesData")}</h3>
                  </div>
                  <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-bold">
                    {items.length} {t("editPayroll.employee")}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-100">
                        <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.no")}</th>
                        <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.name")}</th>
                        <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.iqama")}</th>
                        {!isSalaryType && (
                          <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.code")}</th>
                        )}
                        <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.salary")}</th>
                        {isSalaryType ? (
                          <>
                            <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.housing")}</th>
                            <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.internalDeduction")}</th>
                            <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.reward")}</th>
                          </>
                        ) : (
                          <>
                            <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.target")}</th>
                            <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.orders")}</th>
                            <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.targetDeduction")}</th>
                            <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.bonus")}</th>
                            <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.operatorDeduction")}</th>
                            <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.internal")}</th>
                            <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.wallet")}</th>
                            <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.reward")}</th>
                          </>
                        )}
                        <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.netSalary")}</th>
                        <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">{t("editPayroll.columns.paymentMethod")}</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-50">
                      {items.map((item, index) => (
                        <tr key={item.id} className={`hover:bg-gray-50/50 ${item.net_salary < 0 ? 'bg-red-50' : ''}`}>
                          <td className="px-3 py-2 text-gray-400 text-center text-xs">{index + 1}</td>
                          <td className="px-3 py-2 font-bold text-gray-900 whitespace-nowrap">{item.employee_name}</td>
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{item.iqama_number}</td>
                          {!isSalaryType && (
                            <td className="px-3 py-2 text-gray-600">{item.user_code}</td>
                          )}
                          <td className="px-3 py-2 font-bold">{Number(item.basic_salary).toLocaleString('en-US')}</td>
                          
                          {isSalaryType ? (
                            <>
                              <td className="px-3 py-2 text-gray-600">{Number(item.housing_allowance).toLocaleString('en-US')}</td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={item.internal_deduction}
                                  onChange={(e) => handleRowChange(index, 'internal_deduction', parseFloat(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm"
                                  min="0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={item.internal_bonus}
                                  onChange={(e) => handleRowChange(index, 'internal_bonus', parseFloat(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm"
                                  min="0"
                                />
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-3 py-2 text-gray-600">{item.target}</td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={item.successful_orders}
                                  onChange={(e) => handleRowChange(index, 'successful_orders', parseFloat(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm"
                                  min="0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={(Number(item.target_deduction) || 0).toFixed(2)}
                                  readOnly
                                  className="w-16 px-2 py-1 rounded-lg border border-gray-100 bg-gray-50 text-center text-sm text-red-600"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={(Number(item.monthly_bonus) || 0).toFixed(2)}
                                  readOnly
                                  className="w-16 px-2 py-1 rounded-lg border border-gray-100 bg-gray-50 text-center text-sm text-emerald-600"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={item.operator_deduction}
                                  onChange={(e) => handleRowChange(index, 'operator_deduction', parseFloat(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm"
                                  min="0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={item.internal_deduction}
                                  onChange={(e) => handleRowChange(index, 'internal_deduction', parseFloat(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm"
                                  min="0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={item.wallet_deduction}
                                  onChange={(e) => handleRowChange(index, 'wallet_deduction', parseFloat(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm"
                                  min="0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={item.internal_bonus}
                                  onChange={(e) => handleRowChange(index, 'internal_bonus', parseFloat(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm"
                                  min="0"
                                />
                              </td>
                            </>
                          )}
                          
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={(Number(item.net_salary) || 0).toFixed(2)}
                              readOnly
                              className={`w-24 px-2 py-1 rounded-lg border text-center text-sm font-bold ${
                                item.net_salary < 0 ? 'bg-red-100 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={item.payment_method}
                              onChange={(e) => handleRowChange(index, 'payment_method', e.target.value)}
                              className="w-24 px-2 py-1 rounded-lg border border-gray-200 text-sm"
                            >
                              <option value="غير محدد">{t("editPayroll.paymentMethods.notSpecified")}</option>
                              <option value="مدد">{t("editPayroll.paymentMethods.mudad")}</option>
                              <option value="كاش">{t("editPayroll.paymentMethods.cash")}</option>
                              <option value="تحويل">{t("editPayroll.paymentMethods.transfer")}</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
                        <DollarSign size={18} />
                        <span className="text-sm font-bold">{t("editPayroll.totals.totalSalaries")}</span>
                      </div>
                      <p className="text-2xl font-black text-emerald-600">
                        {totals.totalSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })} {t("stats.sar")}
                      </p>
                    </div>
                    {!isSalaryType && (
                      <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                        <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                          <Target size={18} />
                          <span className="text-sm font-bold">{t("editPayroll.totals.totalOrders")}</span>
                        </div>
                        <p className="text-2xl font-black text-blue-600">{totals.totalOrders}</p>
                      </div>
                    )}
                    <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
                        <AlertCircle size={18} />
                        <span className="text-sm font-bold">{t("editPayroll.totals.totalDeductions")}</span>
                      </div>
                      <p className="text-2xl font-black text-red-600">
                        {totals.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })} {t("stats.sar")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-2 p-4">
                  <Link href={`/salary-payrolls/${payroll.id}`}>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all">
                      <ArrowRight size={16} />
                      <span>{t("editPayroll.cancel")}</span>
                    </button>
                  </Link>
                  <button
                    onClick={handleSaveClick}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/25"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>{t("editPayroll.saveChanges")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
