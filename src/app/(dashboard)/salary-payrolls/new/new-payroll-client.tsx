"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText,
  Calendar,
  Users,
  Search,
  Save,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  DollarSign,
  Target,
  Gift,
  Layers,
  Calculator,
  FileCheck,
  AlertTriangle,
  Clock
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Package {
  id: number;
  group_name: string;
  work_type: string;
  monthly_target: number;
  bonus_after_target: number;
}

interface Employee {
  id: number;
  name: string;
  iqama_number: string;
  user_code: string;
  basic_salary: number;
  housing_allowance: number;
  nationality: string;
  job_title: string;
}

interface Tier {
  id: number;
  min_orders: number;
  base_salary: number;
  increment_per_order: number;
  bonus: number;
}

interface Slab {
  id: number;
  from_orders: number;
  to_orders: number | null;
  value_per_order: number;
}

interface Debt {
  id: number;
  employee_name: string;
  iqama_number: string;
  month_reference: string;
  amount: number;
}

interface EmployeeRow {
  employee_name: string;
  iqama_number: string;
  user_code: string;
  basic_salary: number;
  housing_allowance: number;
  nationality: string;
  job_title: string;
  target: number;
  bonus_per_order: number;
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

interface NewPayrollClientProps {
  packages: Package[];
  debts: Debt[];
  companyId: number;
  userName: string;
}

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "loading";
  title: string;
  message: string;
}

export function NewPayrollClient({ packages, debts, companyId, userName }: NewPayrollClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingPackage, setFetchingPackage] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });

  const [payrollMonth, setPayrollMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [slabs, setSlabs] = useState<Slab[]>([]);
  const [employeeRows, setEmployeeRows] = useState<EmployeeRow[]>([]);
  const [tierSystemActive, setTierSystemActive] = useState(false);

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
    if (type !== "loading") {
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
    }
  };

  const fetchPackageData = useCallback(async (packageId: string) => {
    if (!packageId) return;
    
    setFetchingPackage(true);
    try {
      const res = await fetch(`/api/packages?company_id=${companyId}&package_id=${packageId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPackage(data.package);
        setEmployees(data.employees || []);
        setTiers((data.tiers || []).map((t: Tier) => ({
          ...t,
          min_orders: Number(t.min_orders) || 0,
          base_salary: Number(t.base_salary) || 0,
          increment_per_order: Number(t.increment_per_order) || 0,
          bonus: Number(t.bonus) || 0
        })));
        setSlabs((data.slabs || []).map((s: Slab) => ({
          ...s,
          from_orders: Number(s.from_orders) || 0,
          to_orders: s.to_orders ? Number(s.to_orders) : null,
          value_per_order: Number(s.value_per_order) || 0
        })));

        const rows: EmployeeRow[] = (data.employees || []).map((emp: Employee) => {
          const basicSalary = Number(emp.basic_salary) || 0;
          const housingAllowance = Number(emp.housing_allowance) || 0;
          const target = Number(data.package?.monthly_target) || 0;
          const bonusPerOrder = Number(data.package?.bonus_after_target) || 0;

          return {
            employee_name: emp.name,
            iqama_number: emp.iqama_number,
            user_code: emp.user_code || '',
            basic_salary: basicSalary,
            housing_allowance: housingAllowance,
            nationality: emp.nationality || '',
            job_title: emp.job_title || '',
            target: target,
            bonus_per_order: bonusPerOrder,
            successful_orders: 0,
            target_deduction: 0,
            monthly_bonus: 0,
            operator_deduction: 0,
            internal_deduction: 0,
            wallet_deduction: 0,
            internal_bonus: 0,
            net_salary: basicSalary + housingAllowance,
            payment_method: 'غير محدد',
            achieved_tier: '',
            tier_bonus: 0,
            extra_amount: 0
          };
        });
        setEmployeeRows(rows);
      }
    } catch (error) {
      console.error("Error fetching package:", error);
    } finally {
      setFetchingPackage(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (selectedPackageId) {
      fetchPackageData(selectedPackageId);
    }
  }, [selectedPackageId, fetchPackageData]);

  const calculateTierSystem = (orders: number, operator: number, internal: number, wallet: number, reward: number) => {
    const ordersVal = Number(orders) || 0;
    const operatorVal = Number(operator) || 0;
    const internalVal = Number(internal) || 0;
    const walletVal = Number(wallet) || 0;
    const rewardVal = Number(reward) || 0;

    let calculatedSalary = 0;
    let achievedTier = '';
    
    if (ordersVal < 1) {
      calculatedSalary = 0;
      achievedTier = 'لا توجد طلبات';
    } else if (ordersVal < 301) {
      calculatedSalary = ordersVal * 2;
      achievedTier = 'من 1 إلى 300 طلب (2 ريال/طلب)';
    } else if (ordersVal < 401) {
      calculatedSalary = ordersVal * 3;
      achievedTier = 'من 301 إلى 400 طلب (3 ريال/طلب)';
    } else if (ordersVal < 450) {
      calculatedSalary = ordersVal * 4;
      achievedTier = 'من 401 إلى 449 طلب (4 ريال/طلب)';
    } else if (ordersVal < 520) {
      calculatedSalary = 2450 + (ordersVal - 450) * 7;
      achievedTier = 'الشريحة 1 (450-519 طلب)';
    } else if (ordersVal < 560) {
      calculatedSalary = 3000 + (ordersVal - 520) * 8;
      achievedTier = 'الشريحة 2 (520-559 طلب)';
    } else {
      calculatedSalary = 3450 + (ordersVal - 560) * 10;
      achievedTier = 'الشريحة 3 (560+ طلب)';
    }
    
    const totalDeductions = operatorVal + internalVal + walletVal;
    return {
      net: Number(calculatedSalary + rewardVal - totalDeductions),
      achievedTier,
      baseSalary: calculatedSalary
    };
  };

  const calculateRow = useCallback((row: EmployeeRow): EmployeeRow => {
    const workType = selectedPackage?.work_type || 'salary';
    let net = 0;
    let targetDeduction = 0;
    let monthlyBonus = 0;
    let achievedTier = '';
    let tierBonus = 0;
    let extraAmount = 0;

    const operatorVal = Number(row.operator_deduction) || 0;
    const internalVal = Number(row.internal_deduction) || 0;
    const walletVal = Number(row.wallet_deduction) || 0;
    const rewardVal = Number(row.internal_bonus) || 0;
    const ordersVal = Number(row.successful_orders) || 0;
    const basicSalaryVal = Number(row.basic_salary) || 0;
    const housingVal = Number(row.housing_allowance) || 0;

    const totalDeductions = operatorVal + internalVal + walletVal;

    if (workType === 'salary') {
      net = basicSalaryVal + housingVal + rewardVal - totalDeductions;
    } else if (workType === 'target') {
      const target = Number(row.target || selectedPackage?.monthly_target || 0);
      const bonusPerOrder = Number(row.bonus_per_order || selectedPackage?.bonus_after_target || 0);
      
      if (ordersVal < target) {
        targetDeduction = target > 0 ? (target - ordersVal) * (basicSalaryVal / target) : 0;
      } else {
        monthlyBonus = (ordersVal - target) * bonusPerOrder;
      }
      
      net = basicSalaryVal + monthlyBonus + rewardVal - targetDeduction - totalDeductions;
    } else if (workType === 'tiers') {
      if (tierSystemActive) {
        const result = calculateTierSystem(
          ordersVal,
          operatorVal,
          internalVal,
          walletVal,
          rewardVal
        );
        net = result.net;
        achievedTier = result.achievedTier;
      } else {
        let matchedTier: Tier | null = null;
        for (const tier of tiers) {
          if (ordersVal >= tier.min_orders) {
            matchedTier = tier;
          } else {
            break;
          }
        }

        if (matchedTier) {
          const baseSalary = Number(matchedTier.base_salary);
          extraAmount = (ordersVal - Number(matchedTier.min_orders)) * Number(matchedTier.increment_per_order);
          tierBonus = Number(matchedTier.bonus) || 0;
          net = baseSalary + extraAmount + tierBonus + rewardVal - totalDeductions;
          achievedTier = `من ${matchedTier.min_orders} طلب`;
        } else {
          let matchedSlab: Slab | null = null;
          for (const slab of slabs) {
            if (ordersVal >= slab.from_orders && 
                (slab.to_orders === null || slab.to_orders === 0 || ordersVal <= slab.to_orders)) {
              matchedSlab = slab;
              break;
            }
          }

          if (matchedSlab) {
            net = ordersVal * Number(matchedSlab.value_per_order) + rewardVal - totalDeductions;
            achievedTier = `انخفاض (${matchedSlab.from_orders}-${matchedSlab.to_orders || 'فوق'})`;
          } else {
            net = rewardVal - totalDeductions;
            achievedTier = 'لا توجد شريحة مناسبة';
          }
        }
      }
    } else if (workType === 'commission') {
      const commissionRate = (Number(selectedPackage?.bonus_after_target) || 0) / 100;
      const commission = ordersVal * commissionRate;
      net = basicSalaryVal + commission + rewardVal - totalDeductions;
    }

    return {
      ...row,
      target_deduction: targetDeduction,
      monthly_bonus: monthlyBonus,
      net_salary: net,
      achieved_tier: achievedTier,
      tier_bonus: tierBonus,
      extra_amount: extraAmount
    };
  }, [selectedPackage, tiers, slabs, tierSystemActive]);

  const handleRowChange = (index: number, field: keyof EmployeeRow, value: number | string) => {
    setEmployeeRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      updated[index] = calculateRow(updated[index]);
      return updated;
    });
  };

  const recalculateAll = useCallback(() => {
    setEmployeeRows(prev => prev.map(row => calculateRow(row)));
  }, [calculateRow]);

  useEffect(() => {
    if (employeeRows.length > 0) {
      recalculateAll();
    }
  }, [tierSystemActive]);

  const getTotals = () => {
    let totalSalary = 0;
    let totalOrders = 0;
    let totalDeductions = 0;

    employeeRows.forEach(row => {
      if (row.net_salary >= 0) totalSalary += row.net_salary;
      totalOrders += row.successful_orders;
      totalDeductions += row.target_deduction + row.operator_deduction + row.internal_deduction + row.wallet_deduction;
    });

    return { totalSalary, totalOrders, totalDeductions };
  };

  const handleSave = async (isDraft: boolean) => {
    if (!selectedPackageId || !payrollMonth) {
      showNotification("error", "خطأ", "يرجى تحديد شهر المسير والباقة");
      return;
    }

    setLoading(true);
    showNotification("loading", "جاري الحفظ", isDraft ? "جاري حفظ المسودة..." : "جاري حفظ المسير...");

    try {
      const items = employeeRows.map(row => ({
        employee_name: row.employee_name,
        iqama_number: row.iqama_number,
        user_code: row.user_code,
        basic_salary: row.basic_salary,
        target: row.target,
        successful_orders: row.successful_orders,
        target_deduction: row.target_deduction,
        monthly_bonus: row.monthly_bonus,
        operator_deduction: row.operator_deduction,
        internal_deduction: row.internal_deduction,
        wallet_deduction: row.wallet_deduction,
        internal_bonus: row.internal_bonus,
        net_salary: row.net_salary,
        payment_method: row.payment_method,
        housing_allowance: row.housing_allowance,
        achieved_tier: row.achieved_tier,
        tier_bonus: row.tier_bonus,
        extra_amount: row.extra_amount
      }));

      const res = await fetch("/api/payrolls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          payroll_month: payrollMonth,
          package_id: selectedPackageId,
          saved_by: userName,
          is_draft: isDraft ? 1 : 0,
          items
        })
      });

      if (res.ok) {
        showNotification("success", "تم الحفظ بنجاح", isDraft ? "تم حفظ المسودة بنجاح" : "تم حفظ المسير بنجاح");
        setTimeout(() => {
          router.push("/salary-payrolls");
          router.refresh();
        }, 1500);
      } else {
        const data = await res.json();
        showNotification("error", "فشل الحفظ", data.error || "فشل حفظ المسير");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  const getWorkTypeLabel = (type: string) => {
    switch (type) {
      case 'salary': return 'الراتب الثابت';
      case 'target': return 'نظام التارقت';
      case 'tiers': return 'نظام الشرائح';
      case 'commission': return 'نظام العمولة';
      default: return type;
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
        <div className="max-w-[1800px] mx-auto space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a237e] to-[#283593] rounded-2xl p-6 text-white shadow-xl">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black">إنشاء مسير رواتب جديد</h1>
                    <p className="text-white/60 text-sm">يمكنك من هنا إنشاء مسير رواتب جديد للموظفين</p>
                  </div>
                </div>
                <Link href="/salary-payrolls">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/10">
                    <ArrowRight size={16} />
                    <span>العودة للقائمة</span>
                  </button>
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                  <Calendar size={14} className="text-gray-400" />
                  شهر المسير
                </label>
                <input
                  type="month"
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                  <Users size={14} className="text-gray-400" />
                  باقة الموظفين
                </label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-sm"
                >
                  <option value="">-- اختر الباقة --</option>
                  {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>{pkg.group_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={() => selectedPackageId && fetchPackageData(selectedPackageId)}
                  disabled={!selectedPackageId || fetchingPackage}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  {fetchingPackage ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  <span>بحث</span>
                </button>
              </div>
            </div>
          </div>

          {selectedPackage && (
            <>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={18} className="text-blue-500" />
                  <h3 className="font-bold text-blue-900">معلومات النظام</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-3 border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <Layers size={14} />
                      <span className="text-xs font-bold">نظام العمل</span>
                    </div>
                    <p className="font-bold text-gray-900">{getWorkTypeLabel(selectedPackage.work_type)}</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <Target size={14} />
                      <span className="text-xs font-bold">التارقت الشهري</span>
                    </div>
                    <p className="font-bold text-gray-900">{selectedPackage.monthly_target || 0} طلب</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <Gift size={14} />
                      <span className="text-xs font-bold">قيمة البونص</span>
                    </div>
                    <p className="font-bold text-gray-900">{selectedPackage.bonus_after_target || 0} ريال لكل طلب</p>
                  </div>
                </div>

                {selectedPackage.work_type === 'tiers' && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <button
                      onClick={() => setTierSystemActive(!tierSystemActive)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                        tierSystemActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tierSystemActive ? <CheckCircle size={16} /> : <Clock size={16} />}
                      {tierSystemActive ? 'نظام الشرائح مفعل' : 'تفعيل نظام الشرائح المخصص'}
                    </button>
                  </div>
                )}
              </div>

              {debts.length > 0 && (
                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={18} className="text-amber-600" />
                    <h3 className="font-bold text-amber-900">ديون غير مسددة</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    {debts.slice(0, 6).map(debt => (
                      <div key={debt.id} className="bg-white rounded-xl p-3 border border-amber-100">
                        <p className="font-bold text-gray-900 text-sm">{debt.employee_name}</p>
                        <p className="text-xs text-gray-500">{debt.iqama_number}</p>
                        <p className="text-red-600 font-bold text-sm mt-1">{Number(debt.amount).toLocaleString('ar-SA')} ر.س</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {employeeRows.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-br from-[#1a237e] to-[#283593] px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-white">
                      <Calculator size={18} />
                      <h3 className="font-bold text-sm">
                        {selectedPackage.work_type === 'salary' ? 'جدول الرواتب' :
                         selectedPackage.work_type === 'target' ? 'جدول التارقت' :
                         selectedPackage.work_type === 'tiers' ? 'جدول الشرائح' : 'جدول الرواتب'}
                      </h3>
                    </div>
                    <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-bold">
                      {employeeRows.length} موظف
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr className="border-b border-gray-100">
                          <th className="text-right px-3 py-2 text-xs font-bold text-gray-600 whitespace-nowrap">اسم الموظف</th>
                          <th className="text-right px-3 py-2 text-xs font-bold text-gray-600 whitespace-nowrap">الإقامة</th>
                          {selectedPackage.work_type !== 'salary' && (
                            <th className="text-right px-3 py-2 text-xs font-bold text-gray-600 whitespace-nowrap">الكود</th>
                          )}
                          <th className="text-right px-3 py-2 text-xs font-bold text-gray-600 whitespace-nowrap">الراتب</th>
                          {selectedPackage.work_type === 'salary' && (
                            <>
                              <th className="text-right px-3 py-2 text-xs font-bold text-gray-600 whitespace-nowrap">السكن</th>
                              <th className="text-right px-3 py-2 text-xs font-bold text-gray-600 whitespace-nowrap">الجنسية</th>
                            </>
                          )}
                          {selectedPackage.work_type !== 'salary' && (
                            <>
                              <th className="text-right px-3 py-2 text-xs font-bold text-gray-600 whitespace-nowrap">التارقت</th>
                              <th className="text-right px-3 py-2 text-xs font-bold text-gray-600 whitespace-nowrap">البونص</th>
                              <th className="text-right px-3 py-2 text-xs font-bold text-gray-600 whitespace-nowrap">الطلبات</th>
                              <th className="text-right px-3 py-2 text-xs font-bold text-gray-600 whitespace-nowrap">خصم</th>
                              <th className="text-right px-3 py-2 text-xs font-bold text-gray-600 whitespace-nowrap">بونص</th>
                            </>
                          )}
                          <th className="text-right px-3 py-2 text-xs font-bold text-gray-600 whitespace-nowrap">مشغل</th>
                          <th className="text-right px-3 py-2 text-xs font-bold text-gray-600 whitespace-nowrap">داخلي</th>
                          <th className="text-right px-3 py-2 text-xs font-bold text-gray-600 whitespace-nowrap">محفظة</th>
                          <th className="text-right px-3 py-2 text-xs font-bold text-gray-600 whitespace-nowrap">مكافأة</th>
                          <th className="text-right px-3 py-2 text-xs font-bold text-gray-600 whitespace-nowrap">صافي</th>
                          <th className="text-right px-3 py-2 text-xs font-bold text-gray-600 whitespace-nowrap">التحويل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {employeeRows.map((row, index) => (
                          <tr key={index} className={`hover:bg-gray-50/50 ${row.net_salary < 0 ? 'bg-red-50' : ''}`}>
                            <td className="px-3 py-2 font-bold text-gray-900 whitespace-nowrap">{row.employee_name}</td>
                            <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{row.iqama_number}</td>
                            {selectedPackage.work_type !== 'salary' && (
                              <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{row.user_code}</td>
                            )}
                            <td className="px-3 py-2 font-bold text-gray-900">{row.basic_salary.toLocaleString('ar-SA')}</td>
                            {selectedPackage.work_type === 'salary' && (
                              <>
                                <td className="px-3 py-2 text-gray-600">{row.housing_allowance.toLocaleString('ar-SA')}</td>
                                <td className="px-3 py-2 text-gray-600">{row.nationality}</td>
                              </>
                            )}
                            {selectedPackage.work_type !== 'salary' && (
                              <>
                                <td className="px-3 py-2 text-gray-600">{row.target}</td>
                                <td className="px-3 py-2 text-gray-600">{row.bonus_per_order}</td>
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    value={row.successful_orders}
                                    onChange={(e) => handleRowChange(index, 'successful_orders', parseFloat(e.target.value) || 0)}
                                    className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm"
                                    min="0"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="text"
                                    value={row.target_deduction.toFixed(2)}
                                    readOnly
                                    className="w-16 px-2 py-1 rounded-lg border border-gray-100 bg-gray-50 text-center text-sm"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="text"
                                    value={row.monthly_bonus.toFixed(2)}
                                    readOnly
                                    className="w-16 px-2 py-1 rounded-lg border border-gray-100 bg-gray-50 text-center text-sm"
                                  />
                                </td>
                              </>
                            )}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={row.operator_deduction}
                                onChange={(e) => handleRowChange(index, 'operator_deduction', parseFloat(e.target.value) || 0)}
                                className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm"
                                min="0"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={row.internal_deduction}
                                onChange={(e) => handleRowChange(index, 'internal_deduction', parseFloat(e.target.value) || 0)}
                                className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm"
                                min="0"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={row.wallet_deduction}
                                onChange={(e) => handleRowChange(index, 'wallet_deduction', parseFloat(e.target.value) || 0)}
                                className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm"
                                min="0"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={row.internal_bonus}
                                onChange={(e) => handleRowChange(index, 'internal_bonus', parseFloat(e.target.value) || 0)}
                                className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm"
                                min="0"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={row.net_salary.toFixed(2)}
                                readOnly
                                className={`w-20 px-2 py-1 rounded-lg border text-center text-sm font-bold ${
                                  row.net_salary < 0 ? 'bg-red-100 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                }`}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={row.payment_method}
                                onChange={(e) => handleRowChange(index, 'payment_method', e.target.value)}
                                className="w-20 px-2 py-1 rounded-lg border border-gray-200 text-sm"
                              >
                                <option value="غير محدد">غير محدد</option>
                                <option value="مدد">مدد</option>
                                <option value="كاش">كاش</option>
                                <option value="تحويل">تحويل</option>
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
                          {totals.totalSalary.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ريال
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                        <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                          <Target size={18} />
                          <span className="text-sm font-bold">الطلبات الناجحة</span>
                        </div>
                        <p className="text-2xl font-black text-blue-600">{totals.totalOrders}</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                        <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
                          <AlertCircle size={18} />
                          <span className="text-sm font-bold">إجمالي الخصومات</span>
                        </div>
                        <p className="text-2xl font-black text-red-600">
                          {totals.totalDeductions.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ريال
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-4 pb-6">
                <Link href="/salary-payrolls">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all">
                    <ArrowRight size={16} />
                    <span>إلغاء</span>
                  </button>
                </Link>
                <button
                  onClick={() => handleSave(true)}
                  disabled={loading || employeeRows.length === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <FileCheck size={16} />}
                  <span>حفظ كمسودة</span>
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={loading || employeeRows.length === 0}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/25"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>حفظ المسير</span>
                </button>
              </div>
            </>
          )}

          {!selectedPackage && !fetchingPackage && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Info size={48} className="mx-auto text-blue-300 mb-4" />
              <h4 className="text-lg font-bold text-gray-600 mb-2">مرحباً بك في إنشاء مسير الرواتب</h4>
              <p className="text-gray-400 text-sm">يرجى تحديد شهر المسير والباقة لبدء إنشاء المسير</p>
            </div>
          )}

          {fetchingPackage && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Loader2 size={48} className="mx-auto text-blue-500 mb-4 animate-spin" />
              <h4 className="text-lg font-bold text-gray-600 mb-2">جاري تحميل البيانات...</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
