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
  Target
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "loading";
  title: string;
  message: string;
}

export function PayrollEditClient({ payroll, companyId }: PayrollEditClientProps) {
  const router = useRouter();
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
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
    if (type !== "loading") {
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
    }
  };

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

  const handleSave = async () => {
    setLoading(true);
    showNotification("loading", "جاري الحفظ", "جاري حفظ التعديلات...");

    try {
      const res = await fetch(`/api/payrolls/${payroll.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });

      if (res.ok) {
        showNotification("success", "تم الحفظ بنجاح", "تم حفظ التعديلات بنجاح");
        setTimeout(() => {
          router.push("/salary-payrolls");
          router.refresh();
        }, 1500);
      } else {
        const data = await res.json();
        showNotification("error", "فشل الحفظ", data.error || "فشل حفظ التعديلات");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  const getWorkTypeLabel = () => {
    switch (workType) {
      case 'salary': return 'رواتب ثابتة';
      case 'target': return 'نظام التارقت';
      case 'tiers': return 'نظام الشرائح';
      case 'commission': return 'نظام العمولة';
      default: return workType;
    }
  };

  const totals = getTotals();

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence>
        {notification.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => notification.type !== "loading" && setNotification(prev => ({ ...prev, show: false }))}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className={`bg-white rounded-3xl p-8 shadow-2xl border-t-4 ${
                notification.type === "success" ? "border-emerald-500" :
                notification.type === "error" ? "border-red-500" : "border-blue-500"
              }`}>
                <div className="text-center">
                  <div className={`h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                    notification.type === "success" ? "bg-emerald-100 text-emerald-500" :
                    notification.type === "error" ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-500"
                  }`}>
                    {notification.type === "success" && <CheckCircle size={40} />}
                    {notification.type === "error" && <AlertCircle size={40} />}
                    {notification.type === "loading" && <Loader2 size={40} className="animate-spin" />}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{notification.title}</h3>
                  <p className="text-gray-500 mb-6">{notification.message}</p>
                  {notification.type !== "loading" && (
                    <button
                      onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                      className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${
                        notification.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      حسناً
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a237e] to-[#283593] rounded-2xl p-6 text-white shadow-xl">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black">تعديل مسير الرواتب</h1>
                    <p className="text-white/60 text-sm">{payroll.payroll_month} - {payroll.package_name} ({getWorkTypeLabel()})</p>
                  </div>
                </div>
                <Link href={`/salary-payrolls/${payroll.id}`}>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/10">
                    <ArrowRight size={16} />
                    <span>العودة</span>
                  </button>
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-[#1a237e] to-[#283593] px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <Calculator size={18} />
                <h3 className="font-bold text-sm">تعديل بيانات الموظفين</h3>
              </div>
              <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-bold">
                {items.length} موظف
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-100">
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">#</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">الاسم</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">الإقامة</th>
                    {!isSalaryType && (
                      <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">الكود</th>
                    )}
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">الراتب</th>
                    {isSalaryType ? (
                      <>
                        <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">السكن</th>
                        <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">خصم داخلي</th>
                        <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">مكافأة</th>
                      </>
                    ) : (
                      <>
                        <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">التارقت</th>
                        <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">الطلبات</th>
                        <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">خصم تارقت</th>
                        <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">بونص</th>
                        <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">خصم مشغل</th>
                        <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">خصم داخلي</th>
                        <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">خصم محفظة</th>
                        <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">مكافأة</th>
                      </>
                    )}
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">صافي</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">الدفع</th>
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
                          <option value="غير محدد">غير محدد</option>
                          <option value="مدد">مدد</option>
                          <option value="كاش">كاش</option>
                          <option value="تحويل">تحويل بنكي</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
                    <DollarSign size={18} />
                    <span className="text-sm font-bold">إجمالي الرواتب</span>
                  </div>
                  <p className="text-2xl font-black text-emerald-600">
                    {totals.totalSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال
                  </p>
                </div>
                {!isSalaryType && (
                  <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                    <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                      <Target size={18} />
                      <span className="text-sm font-bold">الطلبات الناجحة</span>
                    </div>
                    <p className="text-2xl font-black text-blue-600">{totals.totalOrders}</p>
                  </div>
                )}
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
                    <AlertCircle size={18} />
                    <span className="text-sm font-bold">إجمالي الخصومات</span>
                  </div>
                  <p className="text-2xl font-black text-red-600">
                    {totals.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pb-6">
            <Link href={`/salary-payrolls/${payroll.id}`}>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all">
                <ArrowRight size={16} />
                <span>إلغاء</span>
              </button>
            </Link>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/25"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
