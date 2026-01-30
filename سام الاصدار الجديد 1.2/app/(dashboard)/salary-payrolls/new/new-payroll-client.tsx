"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Clock,
  X,
  CheckSquare,
  Square,
  Trash2,
  RefreshCw,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/locale-context";

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
  selected: boolean;
  has_debt: boolean;
  debt_amount: number;
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
  details?: {
    month?: string;
    employeeCount?: number;
    totalAmount?: number;
    packageName?: string;
  };
}

export function NewPayrollClient({ packages, debts, companyId, userName }: NewPayrollClientProps) {
  const router = useRouter();
  const t = useTranslations("financialVouchersPage.salaryPayrollsPage");
  const [loading, setLoading] = useState(false);
  const [fetchingPackage, setFetchingPackage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: "",
    details: undefined
  });
  const [showDebtsPanel, setShowDebtsPanel] = useState(false);

  const [payrollMonth, setPayrollMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [slabs, setSlabs] = useState<Slab[]>([]);
  const [employeeRows, setEmployeeRows] = useState<EmployeeRow[]>([]);
  const [tierSystemActive, setTierSystemActive] = useState(false);

  const workType = selectedPackage?.work_type || 'salary';
  const isSalaryType = workType === 'salary';

  const showNotification = (
    type: "success" | "error" | "loading", 
    title: string, 
    message: string,
    details?: NotificationState['details']
  ) => {
    setNotification({ show: true, type, title, message, details });
    if (type !== "loading") {
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
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

        const pkgWorkType = data.package?.work_type || 'salary';
        const rows: EmployeeRow[] = (data.employees || []).map((emp: Employee) => {
          const basicSalary = Number(emp.basic_salary) || 0;
          const housingAllowance = Number(emp.housing_allowance) || 0;
          const target = Number(data.package?.monthly_target) || 0;
          const bonusPerOrder = Number(data.package?.bonus_after_target) || 0;
          
          const employeeDebt = debts.find(d => d.iqama_number === emp.iqama_number);
          const debtAmount = employeeDebt ? Math.abs(Number(employeeDebt.amount)) : 0;

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
            internal_deduction: debtAmount,
            wallet_deduction: 0,
            internal_bonus: 0,
            net_salary: pkgWorkType === 'salary' ? basicSalary + housingAllowance - debtAmount : basicSalary - debtAmount,
            payment_method: 'غير محدد',
            achieved_tier: '',
            tier_bonus: 0,
            extra_amount: 0,
            selected: true,
            has_debt: debtAmount > 0,
            debt_amount: debtAmount
          };
        });
        setEmployeeRows(rows);
      }
    } catch (error) {
      console.error("Error fetching package:", error);
    } finally {
      setFetchingPackage(false);
    }
  }, [companyId, debts, t]);

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
      achievedTier = t("newPayroll.noOrders");
    } else if (ordersVal < 301) {
      calculatedSalary = ordersVal * 2;
      achievedTier = t("newPayroll.tierRange", { from: 1, to: 300, rate: 2 });
    } else if (ordersVal < 401) {
      calculatedSalary = ordersVal * 3;
      achievedTier = t("newPayroll.tierRange", { from: 301, to: 400, rate: 3 });
    } else if (ordersVal < 450) {
      calculatedSalary = ordersVal * 4;
      achievedTier = t("newPayroll.tierRange", { from: 401, to: 449, rate: 4 });
    } else if (ordersVal < 520) {
      calculatedSalary = 2450 + (ordersVal - 450) * 7;
      achievedTier = t("newPayroll.tierLevel", { level: 1, range: '450-519' });
    } else if (ordersVal < 560) {
      calculatedSalary = 3000 + (ordersVal - 520) * 8;
      achievedTier = t("newPayroll.tierLevel", { level: 2, range: '520-559' });
    } else {
      calculatedSalary = 3450 + (ordersVal - 560) * 10;
      achievedTier = t("newPayroll.tierLevel", { level: 3, range: '560+' });
    }
    
    const totalDeductions = operatorVal + internalVal + walletVal;
    return {
      net: Number(calculatedSalary + rewardVal - totalDeductions),
      achievedTier,
      baseSalary: calculatedSalary
    };
  };

  const calculateRow = useCallback((row: EmployeeRow): EmployeeRow => {
    const currentWorkType = selectedPackage?.work_type || 'salary';
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

    if (currentWorkType === 'salary') {
      net = basicSalaryVal + housingVal + rewardVal - internalVal;
    } else if (currentWorkType === 'target') {
      const target = Number(row.target || selectedPackage?.monthly_target || 0);
      const bonusPerOrder = Number(row.bonus_per_order || selectedPackage?.bonus_after_target || 0);
      const totalDeductions = operatorVal + internalVal + walletVal;
      
      if (ordersVal < target) {
        targetDeduction = target > 0 ? (target - ordersVal) * (basicSalaryVal / target) : 0;
      } else {
        monthlyBonus = (ordersVal - target) * bonusPerOrder;
      }
      
      net = basicSalaryVal + monthlyBonus + rewardVal - targetDeduction - totalDeductions;
    } else if (currentWorkType === 'tiers') {
      const totalDeductions = operatorVal + internalVal + walletVal;
      
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
    } else if (currentWorkType === 'commission') {
      const totalDeductions = operatorVal + internalVal + walletVal;
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

  const handleRowChange = (index: number, field: keyof EmployeeRow, value: number | string | boolean) => {
    setEmployeeRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field !== 'selected') {
        updated[index] = calculateRow(updated[index]);
      }
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

  const toggleSelectAll = () => {
    const allSelected = employeeRows.every(row => row.selected);
    setEmployeeRows(prev => prev.map(row => ({ ...row, selected: !allSelected })));
  };

  const removeUnselected = () => {
    setEmployeeRows(prev => prev.filter(row => row.selected));
  };

  const selectedCount = employeeRows.filter(row => row.selected).length;

  const getTotals = () => {
    let totalSalary = 0;
    let totalOrders = 0;
    let totalDeductions = 0;

    employeeRows.filter(row => row.selected).forEach(row => {
      const netSalary = Number(row.net_salary) || 0;
      const orders = Number(row.successful_orders) || 0;
      
      if (netSalary >= 0) totalSalary += netSalary;
      totalOrders += orders;
      
      const targetDed = Number(row.target_deduction) || 0;
      const operatorDed = Number(row.operator_deduction) || 0;
      const internalDed = Number(row.internal_deduction) || 0;
      const walletDed = Number(row.wallet_deduction) || 0;
      
      if (isSalaryType) {
        totalDeductions += internalDed;
      } else {
        totalDeductions += targetDed + operatorDed + internalDed + walletDed;
      }
    });

    return { totalSalary, totalOrders, totalDeductions };
  };

  const handleSave = async (isDraft: boolean) => {
    if (!selectedPackageId || !payrollMonth) {
      showNotification("error", t("newPayroll.notifications.error"), t("newPayroll.notifications.selectMonthAndPackage"));
      return;
    }

    const selectedRows = employeeRows.filter(row => row.selected);
    if (selectedRows.length === 0) {
      showNotification("error", t("newPayroll.notifications.error"), t("newPayroll.notifications.selectEmployee"));
      return;
    }

    setLoading(true);
    showNotification("loading", t("newPayroll.notifications.saving"), isDraft ? t("newPayroll.notifications.savingDraft") : t("newPayroll.notifications.savingPayroll"));

    try {
      const items = selectedRows.map(row => ({
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
        const totalAmount = selectedRows.reduce((sum, row) => sum + (Number(row.net_salary) || 0), 0);
        showNotification(
          "success", 
          isDraft ? t("newPayroll.notifications.savedDraft") : t("newPayroll.notifications.savedPayroll"), 
          isDraft ? t("newPayroll.notifications.savedDraftDesc") : t("newPayroll.notifications.savedPayrollDesc"),
          {
            month: payrollMonth,
            employeeCount: selectedRows.length,
            totalAmount: totalAmount,
            packageName: selectedPackage?.group_name
          }
        );
        setTimeout(() => {
          router.push("/salary-payrolls");
          router.refresh();
        }, 2500);
      } else {
        const data = await res.json();
        showNotification("error", t("newPayroll.notifications.saveFailed"), data.error || t("newPayroll.notifications.errorSaving"));
      }
    } catch {
      showNotification("error", t("newPayroll.notifications.error"), t("newPayroll.notifications.errorSaving"));
    } finally {
      setLoading(false);
    }
  };

  const getWorkTypeLabel = (type: string) => {
    switch (type) {
      case 'salary': return t("workTypes.salary");
      case 'target': return t("workTypes.target");
      case 'tiers': return t("workTypes.tiers");
      case 'commission': return t("workTypes.commission");
      default: return type;
    }
  };

  const totals = getTotals();
  const totalDebts = debts.reduce((sum, d) => sum + Math.abs(Number(d.amount)), 0);
  const employeesWithDebts = employeeRows.filter(row => row.has_debt);

  const filteredEmployeeRows = useMemo(() => {
    if (!searchQuery.trim()) return employeeRows;
    const query = searchQuery.toLowerCase().trim();
    return employeeRows.filter(row => 
      row.employee_name.toLowerCase().includes(query) ||
      row.iqama_number.includes(query) ||
      row.user_code.includes(query)
    );
  }, [employeeRows, searchQuery]);

  const getFilteredIndex = (filteredIdx: number) => {
    if (!searchQuery.trim()) return filteredIdx;
    const filteredRow = filteredEmployeeRows[filteredIdx];
    return employeeRows.findIndex(row => row.iqama_number === filteredRow.iqama_number);
  };

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
                  <p className="text-gray-500 mb-4">{notification.message}</p>
                  
                  {notification.type === "success" && notification.details && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 mb-6 border border-emerald-100">
                      <div className="grid grid-cols-2 gap-3 text-right" dir="rtl">
                        {notification.details.month && (
                          <div className="bg-white rounded-xl p-3 border border-emerald-100">
                            <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                              <Calendar size={12} />
                              <span className="text-[10px] font-bold">شهر المسير</span>
                            </div>
                            <p className="font-black text-gray-900 text-sm">{notification.details.month}</p>
                          </div>
                        )}
                        {notification.details.packageName && (
                          <div className="bg-white rounded-xl p-3 border border-emerald-100">
                            <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                              <Users size={12} />
                              <span className="text-[10px] font-bold">الباقة</span>
                            </div>
                            <p className="font-black text-gray-900 text-sm truncate">{notification.details.packageName}</p>
                          </div>
                        )}
                        {notification.details.employeeCount !== undefined && (
                          <div className="bg-white rounded-xl p-3 border border-emerald-100">
                            <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                              <Users size={12} />
                              <span className="text-[10px] font-bold">عدد الموظفين</span>
                            </div>
                            <p className="font-black text-gray-900 text-sm">{notification.details.employeeCount} موظف</p>
                          </div>
                        )}
                        {notification.details.totalAmount !== undefined && (
                          <div className="bg-white rounded-xl p-3 border border-emerald-100">
                            <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                              <DollarSign size={12} />
                                <span className="text-[10px] font-bold">{t("newPayroll.notifications.totalPayroll")}</span>
                              </div>
                              <p className="font-black text-gray-900 text-sm">{notification.details.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {t("stats.sar")}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {notification.type !== "loading" && (
                      <button
                        onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                        className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${
                          notification.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {t("newPayroll.notifications.ok")}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
      </AnimatePresence>

      <AnimatePresence>
        {showDebtsPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowDebtsPanel(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-0 left-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black">{t("newPayroll.previousDebts")}</h2>
                      <p className="text-white/70 text-sm">{t("newPayroll.debtsCount", { count: debts.length })}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowDebtsPanel(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-4 space-y-3">
                {debts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
                    <p className="text-gray-500 font-bold">{t("newPayroll.noDebts")}</p>
                  </div>
                ) : (
                  debts.map(debt => (
                    <div key={debt.id} className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border border-red-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-gray-900">{debt.employee_name}</p>
                          <p className="text-xs text-gray-500">{debt.iqama_number}</p>
                          <p className="text-xs text-gray-400 mt-1">{t("newPayroll.debtMonth")} {debt.month_reference}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-red-600 font-black text-lg">{Math.abs(Number(debt.amount)).toLocaleString('en-US')}</p>
                          <p className="text-xs text-red-400">{t("newPayroll.sar")}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {debts.length > 0 && (
                <div className="p-4 bg-gray-50 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600 font-bold">{t("newPayroll.totalDebts")}</span>
                    <span className="text-red-600 font-black text-xl">{totalDebts.toLocaleString('en-US')} {t("newPayroll.sar")}</span>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    {t("newPayroll.debtsNote")}
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-full mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a237e] to-[#283593] p-6 text-white border-b border-white/10">
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-black">{t("newPayroll.title")}</h1>
                      <p className="text-white/60 text-sm">{t("newPayroll.subtitle")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {debts.length > 0 && (
                      <button 
                        onClick={() => setShowDebtsPanel(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all animate-pulse"
                      >
                        <AlertTriangle size={16} />
                        <span>{t("newPayroll.debtsCount", { count: debts.length })}</span>
                      </button>
                    )}
                    <Link href="/salary-payrolls">
                      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/10">
                        <ArrowRight size={16} />
                        <span>{t("backToList")}</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
            </div>

            <div className="p-6 space-y-6">
              {debts.length > 0 && employeesWithDebts.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 rounded-2xl border-2 border-red-200 p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                        <AlertTriangle size={24} className="text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-black text-red-900 text-lg">{t("newPayroll.debtsWarning")}</h3>
                        <p className="text-red-600 text-sm">{t("newPayroll.debtsWarningDesc", { count: employeesWithDebts.length })}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowDebtsPanel(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all"
                    >
                      <CreditCard size={16} />
                      <span>{t("newPayroll.viewDebtsDetails")}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {employeesWithDebts.slice(0, 4).map(emp => (
                      <div key={emp.iqama_number} className="bg-white rounded-xl p-3 border border-red-100">
                        <p className="font-bold text-gray-900 text-sm truncate">{emp.employee_name}</p>
                        <p className="text-red-600 font-bold">{emp.debt_amount.toLocaleString('en-US')} {t("newPayroll.sar")}</p>
                      </div>
                    ))}
                    {employeesWithDebts.length > 4 && (
                      <div className="bg-red-100 rounded-xl p-3 flex items-center justify-center">
                        <p className="text-red-700 font-bold">{t("newPayroll.others", { count: employeesWithDebts.length - 4 })}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                      <Calendar size={14} className="text-gray-400" />
                      {t("newPayroll.payrollMonth")}
                    </label>
                    <input
                      type="month"
                      value={payrollMonth}
                      onChange={(e) => setPayrollMonth(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                      <Users size={14} className="text-gray-400" />
                      {t("newPayroll.selectPackage")}
                    </label>
                    <select
                      value={selectedPackageId}
                      onChange={(e) => setSelectedPackageId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-sm bg-white"
                    >
                      <option value="">{t("newPayroll.selectPackagePlaceholder")}</option>
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
                      <span>{t("newPayroll.search")}</span>
                    </button>
                  </div>
                </div>
              </div>

              {selectedPackage && (
                <>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Info size={18} className="text-blue-500" />
                      <h3 className="font-bold text-blue-900">{t("newPayroll.systemInfo")}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-xl p-3 border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                          <Layers size={14} />
                          <span className="text-xs font-bold">{t("newPayroll.workSystem")}</span>
                        </div>
                        <p className="font-bold text-gray-900">{getWorkTypeLabel(selectedPackage.work_type)}</p>
                      </div>
                      {!isSalaryType && (
                        <>
                          <div className="bg-white rounded-xl p-3 border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                              <Target size={14} />
                              <span className="text-xs font-bold">{t("newPayroll.monthlyTarget")}</span>
                            </div>
                            <p className="font-bold text-gray-900">{selectedPackage.monthly_target || 0} {t("newPayroll.orderUnit")}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                              <Gift size={14} />
                              <span className="text-xs font-bold">{t("newPayroll.bonusValue")}</span>
                            </div>
                            <p className="font-bold text-gray-900">{selectedPackage.bonus_after_target || 0} {t("newPayroll.perOrder")}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {selectedPackage.work_type === 'tiers' && (
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <button
                          onClick={() => setTierSystemActive(!tierSystemActive)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                            tierSystemActive
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          {tierSystemActive ? <CheckCircle size={16} /> : <Clock size={16} />}
                          {tierSystemActive ? t("newPayroll.tiersSystem") : t("newPayroll.activateTiers")}
                        </button>
                      </div>
                    )}
                  </div>

                  {employeeRows.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 420px)', minHeight: '500px' }}>
                      <div className="bg-gradient-to-br from-[#1a237e] to-[#283593] px-4 py-3 flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-2 text-white">
                          <Calculator size={18} />
                          <h3 className="font-bold text-sm">
                            {isSalaryType ? t("newPayroll.salaryTable") :
                             workType === 'target' ? t("newPayroll.targetTable") :
                             workType === 'tiers' ? t("newPayroll.tiersTable") : t("newPayroll.salaryTable")}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={toggleSelectAll}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all border border-white/20"
                            >
                              {employeeRows.every(row => row.selected) ? <CheckSquare size={14} /> : <Square size={14} />}
                              {employeeRows.every(row => row.selected) ? t("newPayroll.deselectAll") : t("newPayroll.selectAll")}
                            </button>
                            <button
                              onClick={removeUnselected}
                              disabled={selectedCount === employeeRows.length}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/80 text-white text-xs font-bold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={14} />
                              {t("newPayroll.deleteUnselected")}
                            </button>
                            <button
                              onClick={() => fetchPackageData(selectedPackageId)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/80 text-white text-xs font-bold hover:bg-emerald-600 transition-all"
                            >
                              <RefreshCw size={14} />
                              {t("newPayroll.reload")}
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder={t("newPayroll.searchEmployee")}
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-56 pl-8 pr-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-xs focus:bg-white/20 focus:border-white/40 outline-none transition-all"
                            />
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/50" />
                            {searchQuery && (
                              <button 
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                          <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-bold">
                            {selectedCount} / {employeeRows.length} {t("newPayroll.selected")}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr className="border-b border-gray-200">
                              <th className="text-center px-2 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">
                                <input
                                  type="checkbox"
                                  checked={employeeRows.every(row => row.selected)}
                                  onChange={toggleSelectAll}
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </th>
                              <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.no")}</th>
                              <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.employeeName")}</th>
                              <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.iqama")}</th>
                              {!isSalaryType && (
                                <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.code")}</th>
                              )}
                              <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.salary")}</th>
                              {isSalaryType ? (
                                <>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.housing")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.nationality")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.internalDeduction")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.reward")}</th>
                                </>
                              ) : (
                                <>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.target")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.bonus")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.orders")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.targetDeduction")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.monthlyBonus")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.operatorDeduction")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.internal")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.wallet")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.reward")}</th>
                                </>
                              )}
                              <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.netSalary")}</th>
                              <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap">{t("newPayroll.columns.paymentMethod")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredEmployeeRows.map((row, filteredIdx) => {
                              const realIndex = getFilteredIndex(filteredIdx);
                              return (
                                <tr 
                                  key={realIndex} 
                                  className={`border-b border-gray-100 transition-colors duration-100 ${
                                    !row.selected ? 'bg-gray-100 opacity-60' :
                                    row.has_debt ? 'bg-amber-50 hover:bg-amber-100/60' :
                                    row.net_salary < 0 ? 'bg-red-50 hover:bg-red-100/60' : 
                                    'hover:bg-blue-50/60'
                                  }`}
                                >
                                  <td className="px-2 py-2 text-center border-l border-gray-100">
                                    <input
                                      type="checkbox"
                                      checked={row.selected}
                                      onChange={(e) => handleRowChange(realIndex, 'selected', e.target.checked)}
                                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-gray-400 text-center border-l border-gray-100 text-xs">{realIndex + 1}</td>
                                  <td className="px-3 py-2 font-bold text-gray-900 whitespace-nowrap border-l border-gray-100">
                                    <div className="flex items-center gap-2">
                                      {row.has_debt && (
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600" title={`دين سابق: ${row.debt_amount} ريال`}>
                                          <AlertTriangle size={12} />
                                        </span>
                                      )}
                                      {row.employee_name}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap border-l border-gray-100 text-xs">{row.iqama_number}</td>
                                  {!isSalaryType && (
                                    <td className="px-3 py-2 text-gray-600 border-l border-gray-100 text-xs">{row.user_code}</td>
                                  )}
                                  <td className="px-3 py-2 font-black text-gray-900 border-l border-gray-100">
                                    {row.basic_salary.toLocaleString('en-US')}
                                  </td>
                                  {isSalaryType ? (
                                    <>
                                      <td className="px-3 py-2 text-gray-600 border-l border-gray-100 text-xs">{row.housing_allowance.toLocaleString('en-US')}</td>
                                      <td className="px-3 py-2 text-gray-500 border-l border-gray-100 text-xs">{row.nationality}</td>
                                      <td className="px-3 py-2 border-l border-gray-100">
                                        <input
                                          type="number"
                                          value={row.internal_deduction}
                                          onChange={(e) => handleRowChange(realIndex, 'internal_deduction', parseFloat(e.target.value) || 0)}
                                          className={`w-20 px-2 py-1 rounded-lg border text-center text-sm focus:border-blue-500 outline-none ${
                                            row.has_debt ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                          }`}
                                          min="0"
                                        />
                                      </td>
                                      <td className="px-3 py-2 border-l border-gray-100">
                                        <input
                                          type="number"
                                          value={row.internal_bonus}
                                          onChange={(e) => handleRowChange(realIndex, 'internal_bonus', parseFloat(e.target.value) || 0)}
                                          className="w-20 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm focus:border-blue-500 outline-none"
                                          min="0"
                                        />
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="px-3 py-2 text-gray-500 border-l border-gray-100 text-xs">{row.target}</td>
                                      <td className="px-3 py-2 text-gray-500 border-l border-gray-100 text-xs">{row.bonus_per_order}</td>
                                      <td className="px-3 py-2 border-l border-gray-100">
                                        <input
                                          type="number"
                                          value={row.successful_orders}
                                          onChange={(e) => handleRowChange(realIndex, 'successful_orders', parseFloat(e.target.value) || 0)}
                                          className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm focus:border-blue-500 outline-none"
                                          min="0"
                                        />
                                      </td>
                                        <td className="px-3 py-2 border-l border-gray-100">
                                          <input
                                            type="text"
                                            value={(Number(row.target_deduction) || 0).toFixed(2)}
                                            readOnly
                                            className="w-16 px-2 py-1 rounded-lg border border-gray-100 bg-gray-50 text-center text-sm text-red-600 font-bold"
                                          />
                                        </td>
                                        <td className="px-3 py-2 border-l border-gray-100">
                                          <input
                                            type="text"
                                            value={(Number(row.monthly_bonus) || 0).toFixed(2)}
                                            readOnly
                                            className="w-16 px-2 py-1 rounded-lg border border-gray-100 bg-gray-50 text-center text-sm text-emerald-600 font-bold"
                                          />
                                        </td>
                                      <td className="px-3 py-2 border-l border-gray-100">
                                        <input
                                          type="number"
                                          value={row.operator_deduction}
                                          onChange={(e) => handleRowChange(realIndex, 'operator_deduction', parseFloat(e.target.value) || 0)}
                                          className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm focus:border-blue-500 outline-none"
                                          min="0"
                                        />
                                      </td>
                                      <td className="px-3 py-2 border-l border-gray-100">
                                        <input
                                          type="number"
                                          value={row.internal_deduction}
                                          onChange={(e) => handleRowChange(realIndex, 'internal_deduction', parseFloat(e.target.value) || 0)}
                                          className={`w-16 px-2 py-1 rounded-lg border text-center text-sm focus:border-blue-500 outline-none ${
                                            row.has_debt ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                          }`}
                                          min="0"
                                        />
                                      </td>
                                      <td className="px-3 py-2 border-l border-gray-100">
                                        <input
                                          type="number"
                                          value={row.wallet_deduction}
                                          onChange={(e) => handleRowChange(realIndex, 'wallet_deduction', parseFloat(e.target.value) || 0)}
                                          className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm focus:border-blue-500 outline-none"
                                          min="0"
                                        />
                                      </td>
                                      <td className="px-3 py-2 border-l border-gray-100">
                                        <input
                                          type="number"
                                          value={row.internal_bonus}
                                          onChange={(e) => handleRowChange(realIndex, 'internal_bonus', parseFloat(e.target.value) || 0)}
                                          className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm focus:border-blue-500 outline-none"
                                          min="0"
                                        />
                                      </td>
                                    </>
                                  )}
                                  <td className="px-3 py-2 border-l border-gray-100">
                                    <input
                                      type="text"
                                      value={(Number(row.net_salary) || 0).toFixed(2)}
                                      readOnly
                                      className={`w-24 px-2 py-1 rounded-lg border text-center text-sm font-bold ${
                                        row.net_salary < 0 ? 'bg-red-100 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                      }`}
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <select
                                      value={row.payment_method}
                                      onChange={(e) => handleRowChange(realIndex, 'payment_method', e.target.value)}
                                      className="w-full min-w-[100px] px-2 py-1 rounded-lg border border-gray-200 text-xs focus:border-blue-500 outline-none bg-white"
                                    >
                                      <option value="غير محدد">{t("newPayroll.paymentMethods.notSpecified")}</option>
                                      <option value="مدد">{t("newPayroll.paymentMethods.mudad")}</option>
                                      <option value="كاش">{t("newPayroll.paymentMethods.cash")}</option>
                                      <option value="تحويل بنكي">{t("newPayroll.paymentMethods.transfer")}</option>
                                    </select>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-gray-50 border-t border-gray-100 p-4 flex-shrink-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                              <DollarSign size={14} />
                              <span className="text-xs font-bold">{t("newPayroll.totals.totalSalaries")}</span>
                            </div>
                            <p className="text-xl font-black text-blue-600">{totals.totalSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs">{t("stats.sar")}</span></p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                              <Target size={14} />
                              <span className="text-xs font-bold">{t("newPayroll.totals.totalOrders")}</span>
                            </div>
                            <p className="text-xl font-black text-gray-900">{totals.totalOrders.toLocaleString('en-US')}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                              <AlertTriangle size={14} />
                              <span className="text-xs font-bold">{t("newPayroll.totals.totalDeductions")}</span>
                            </div>
                            <p className="text-xl font-black text-red-600">{totals.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs">{t("stats.sar")}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <Link href="/salary-payrolls">
                      <button className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">
                        {t("newPayroll.cancel")}
                      </button>
                    </Link>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSave(true)}
                        disabled={loading || selectedCount === 0}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all disabled:opacity-50"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <FileCheck size={16} />}
                        <span>{t("newPayroll.saveDraft")}</span>
                      </button>
                      <button
                        onClick={() => handleSave(false)}
                        disabled={loading || selectedCount === 0}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/25"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        <span>{t("newPayroll.savePayroll", { count: selectedCount })}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {!selectedPackage && !fetchingPackage && (
                <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-12 text-center">
                  <Info size={48} className="mx-auto text-blue-300 mb-4" />
                  <h4 className="text-lg font-bold text-gray-600 mb-2">{t("newPayroll.welcomeTitle")}</h4>
                  <p className="text-gray-400 text-sm">{t("newPayroll.welcomeDesc")}</p>
                </div>
              )}

              {fetchingPackage && (
                <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-12 text-center">
                  <Loader2 size={48} className="mx-auto text-blue-500 mb-4 animate-spin" />
                  <h4 className="text-lg font-bold text-gray-600 mb-2">{t("newPayroll.loadingData")}</h4>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
