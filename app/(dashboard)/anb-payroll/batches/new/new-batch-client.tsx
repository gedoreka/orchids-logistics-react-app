"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Users, Plus, Trash2, Save, CheckSquare, Square,
  Search, Building2, AlertCircle
} from "lucide-react";
import Link from "next/link";

interface Employee {
  id: number;
  name: string;
  identity_number: string;
  basic_salary: number;
  housing_allowance: number;
  other_allowances: number;
  iban: string | null;
  bank_name: string | null;
  bank_code: string | null;
}

interface BatchItem {
  employee_id: number | null;
  employee_name: string;
  identity_number: string;
  iban: string;
  bank_code: string;
  basic_salary: number;
  housing_allowance: number;
  other_earnings: number;
  deductions: number;
  net_salary: number;
}

export function NewBatchClient({
  employees,
  companyId,
  credentials,
}: {
  employees: Employee[];
  companyId: number;
  credentials: { debit_account: string; mol_establishment_id: string; national_unified_no: string } | null;
}) {
  const router = useRouter();
  const [payrollMonth, setPayrollMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  const [debitAccount, setDebitAccount] = useState(credentials?.debit_account || "");
  const [autoWps, setAutoWps] = useState(false);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<number>>(new Set());

  const filteredEmployees = useMemo(() => {
    if (!search) return employees;
    const q = search.toLowerCase();
    return employees.filter(
      (e) => e.name.toLowerCase().includes(q) || e.identity_number?.includes(q)
    );
  }, [employees, search]);

  const toggleEmployee = (empId: number) => {
    const next = new Set(selectedEmployees);
    if (next.has(empId)) {
      next.delete(empId);
      setItems(items.filter((i) => i.employee_id !== empId));
    } else {
      next.add(empId);
      const emp = employees.find((e) => e.id === empId);
      if (emp) {
        const basic = parseFloat(String(emp.basic_salary || 0));
        const housing = parseFloat(String(emp.housing_allowance || 0));
        const other = parseFloat(String(emp.other_allowances || 0));
        setItems([
          ...items,
          {
            employee_id: emp.id,
            employee_name: emp.name,
            identity_number: emp.identity_number || "",
            iban: emp.iban || "",
            bank_code: emp.bank_code || "030",
            basic_salary: basic,
            housing_allowance: housing,
            other_earnings: other,
            deductions: 0,
            net_salary: basic + housing + other,
          },
        ]);
      }
    }
    setSelectedEmployees(next);
  };

  const selectAll = () => {
    if (selectedEmployees.size === filteredEmployees.length) {
      setSelectedEmployees(new Set());
      setItems([]);
    } else {
      const allIds = new Set(filteredEmployees.map((e) => e.id));
      setSelectedEmployees(allIds);
      setItems(
        filteredEmployees.map((emp) => {
          const basic = parseFloat(String(emp.basic_salary || 0));
          const housing = parseFloat(String(emp.housing_allowance || 0));
          const other = parseFloat(String(emp.other_allowances || 0));
          return {
            employee_id: emp.id,
            employee_name: emp.name,
            identity_number: emp.identity_number || "",
            iban: emp.iban || "",
            bank_code: emp.bank_code || "030",
            basic_salary: basic,
            housing_allowance: housing,
            other_earnings: other,
            deductions: 0,
            net_salary: basic + housing + other,
          };
        })
      );
    }
  };

  const updateItem = (index: number, field: keyof BatchItem, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    // Recalculate net salary
    const item = updated[index];
    item.net_salary =
      parseFloat(String(item.basic_salary || 0)) +
      parseFloat(String(item.housing_allowance || 0)) +
      parseFloat(String(item.other_earnings || 0)) -
      parseFloat(String(item.deductions || 0));
    setItems(updated);
  };

  const removeItem = (index: number) => {
    const item = items[index];
    if (item.employee_id) {
      const next = new Set(selectedEmployees);
      next.delete(item.employee_id);
      setSelectedEmployees(next);
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const addManualItem = () => {
    setItems([
      ...items,
      {
        employee_id: null,
        employee_name: "",
        identity_number: "",
        iban: "",
        bank_code: "030",
        basic_salary: 0,
        housing_allowance: 0,
        other_earnings: 0,
        deductions: 0,
        net_salary: 0,
      },
    ]);
  };

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(String(item.net_salary)) || 0), 0);

  const handleSave = async () => {
    if (items.length === 0) {
      alert("يرجى إضافة موظف واحد على الأقل");
      return;
    }
    if (!debitAccount) {
      alert("يرجى إدخال رقم حساب الخصم");
      return;
    }

    // Validate items
    for (const item of items) {
      if (!item.employee_name || !item.identity_number || !item.iban) {
        alert(`يرجى إكمال بيانات جميع الموظفين (الاسم، رقم الهوية، IBAN)`);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/anb-payroll/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          payroll_month: payrollMonth,
          debit_account: debitAccount,
          auto_wps: autoWps,
          mol_establishment_id: credentials?.mol_establishment_id,
          national_unified_no: credentials?.national_unified_no,
          items,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`تم إنشاء الدفعة بنجاح - المرجع: ${data.batch_reference}`);
        router.push("/anb-payroll/batches");
      } else {
        alert(data.error || "فشل في إنشاء الدفعة");
      }
    } catch {
      alert("حدث خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/anb-payroll/batches" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ArrowRight className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إنشاء دفعة رواتب جديدة</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">اختر الموظفين وحدد تفاصيل الدفعة</p>
        </div>
      </div>

      {/* Batch Details */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تفاصيل الدفعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شهر الرواتب</label>
            <input
              type="month"
              value={payrollMonth}
              onChange={(e) => setPayrollMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">حساب الخصم</label>
            <input
              type="text"
              value={debitAccount}
              onChange={(e) => setDebitAccount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              placeholder="رقم الحساب البنكي"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoWps}
                onChange={(e) => setAutoWps(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">رفع تلقائي لحماية الأجور (مُدد)</span>
            </label>
          </div>
          <div className="flex items-end">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2 w-full">
              <p className="text-xs text-green-600 dark:text-green-400">إجمالي المبلغ</p>
              <p className="text-lg font-bold text-green-700 dark:text-green-300">{totalAmount.toLocaleString("ar-SA")} ر.س</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Employee List */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            الموظفين ({employees.length})
          </h3>
          <div className="relative mb-3">
            <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-9 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              placeholder="بحث بالاسم أو رقم الهوية..."
            />
          </div>
          <button
            onClick={selectAll}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg mb-2"
          >
            {selectedEmployees.size === filteredEmployees.length ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            {selectedEmployees.size === filteredEmployees.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
          </button>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {filteredEmployees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => toggleEmployee(emp.id)}
                className={`w-full text-right flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedEmployees.has(emp.id)
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent"
                }`}
              >
                {selectedEmployees.has(emp.id) ? (
                  <CheckSquare className="h-4 w-4 text-green-600 shrink-0" />
                ) : (
                  <Square className="h-4 w-4 text-gray-300 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{emp.name}</p>
                  <p className="text-xs text-gray-500">{emp.identity_number || "بدون هوية"}</p>
                </div>
                <span className="text-xs text-gray-500 shrink-0">{parseFloat(String(emp.basic_salary || 0)).toLocaleString()} ر.س</span>
              </button>
            ))}
            {filteredEmployees.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-4">لا يوجد موظفين</p>
            )}
          </div>
        </div>

        {/* Right: Selected Items */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              الموظفين المختارين ({items.length})
            </h3>
            <button
              onClick={addManualItem}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              إضافة يدوية
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>اختر موظفين من القائمة أو أضف يدوياً</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.employee_name || "موظف جديد"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-green-600">
                        {parseFloat(String(item.net_salary || 0)).toLocaleString()} ر.س
                      </span>
                      <button
                        onClick={() => removeItem(index)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {!item.employee_id && (
                      <>
                        <input
                          type="text"
                          value={item.employee_name}
                          onChange={(e) => updateItem(index, "employee_name", e.target.value)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="الاسم"
                        />
                        <input
                          type="text"
                          value={item.identity_number}
                          onChange={(e) => updateItem(index, "identity_number", e.target.value)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="رقم الهوية"
                        />
                      </>
                    )}
                    <input
                      type="text"
                      value={item.iban}
                      onChange={(e) => updateItem(index, "iban", e.target.value)}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="IBAN"
                    />
                    <input
                      type="number"
                      value={item.basic_salary}
                      onChange={(e) => updateItem(index, "basic_salary", parseFloat(e.target.value) || 0)}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="الراتب الأساسي"
                    />
                    <input
                      type="number"
                      value={item.housing_allowance}
                      onChange={(e) => updateItem(index, "housing_allowance", parseFloat(e.target.value) || 0)}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="بدل السكن"
                    />
                    <input
                      type="number"
                      value={item.other_earnings}
                      onChange={(e) => updateItem(index, "other_earnings", parseFloat(e.target.value) || 0)}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="بدلات أخرى"
                    />
                    <input
                      type="number"
                      value={item.deductions}
                      onChange={(e) => updateItem(index, "deductions", parseFloat(e.target.value) || 0)}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="خصومات"
                    />
                  </div>
                  {(!item.iban || !item.identity_number) && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                      <AlertCircle className="h-3 w-3" />
                      يرجى إكمال IBAN ورقم الهوية
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {items.length} موظف | إجمالي: <span className="font-bold text-gray-900 dark:text-white">{totalAmount.toLocaleString("ar-SA")} ر.س</span>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                <Save className="h-5 w-5" />
                {saving ? "جاري الحفظ..." : "حفظ الدفعة"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
