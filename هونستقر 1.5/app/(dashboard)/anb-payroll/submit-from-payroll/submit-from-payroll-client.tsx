"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight, Send, AlertCircle, CheckCircle2, Building2,
  Users, Loader2, XCircle, Shield
} from "lucide-react";
import Link from "next/link";

interface AnbEmployee {
  employee_name: string;
  iqama_number: string;
  user_code: string;
  basic_salary: number;
  housing_allowance: number;
  net_salary: number;
  target_deduction: number;
  operator_deduction: number;
  internal_deduction: number;
  wallet_deduction: number;
  monthly_bonus: number;
  internal_bonus: number;
  extra_amount: number;
}

interface AnbPayrollData {
  payroll_month: string;
  package_name: string;
  company_id: number;
  employees: AnbEmployee[];
}

interface Credentials {
  corporate_id: string;
  debit_account: string;
  mol_establishment_id: string;
  national_unified_no: string;
  api_url: string;
}

export function SubmitFromPayrollClient() {
  const [data, setData] = useState<AnbPayrollData | null>(null);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string; reference?: string } | null>(null);
  const [debitAccount, setDebitAccount] = useState("");

  useEffect(() => {
    // Load payroll data from sessionStorage
    const stored = sessionStorage.getItem("anb_payroll_data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AnbPayrollData;
        setData(parsed);

        // Fetch ANB credentials via API
        fetch(`/api/anb-payroll/credentials?company_id=${parsed.company_id}`)
          .then(res => res.ok ? res.json() : null)
          .then(creds => {
            if (creds) {
              setCredentials(creds);
              setDebitAccount(creds.debit_account || "");
            }
          })
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="text-gray-500">جاري التحميل...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" dir="rtl">
        <AlertCircle className="h-16 w-16 text-amber-400" />
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">لا توجد بيانات رواتب</h2>
        <p className="text-gray-500 text-sm">يرجى إنشاء مسير رواتب واختيار طريقة الدفع &quot;مدد&quot; أولاً</p>
        <Link
          href="/salary-payrolls/new"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          العودة لإنشاء مسير الرواتب
        </Link>
      </div>
    );
  }

  if (!credentials) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" dir="rtl">
        <Shield className="h-16 w-16 text-red-400" />
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">لم يتم إعداد بيانات بنك ANB</h2>
        <p className="text-gray-500 text-sm">يرجى إعداد بيانات الربط مع بنك ANB من إعدادات النظام أولاً</p>
        <Link
          href="/settings"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          الذهاب للإعدادات
        </Link>
      </div>
    );
  }

  const totalNetSalary = data.employees.reduce((sum, emp) => sum + (Number(emp.net_salary) || 0), 0);
  const totalBasicSalary = data.employees.reduce((sum, emp) => sum + (Number(emp.basic_salary) || 0), 0);
  const totalHousing = data.employees.reduce((sum, emp) => sum + (Number(emp.housing_allowance) || 0), 0);
  const totalDeductions = data.employees.reduce((sum, emp) => {
    return sum + (Number(emp.target_deduction) || 0) + (Number(emp.operator_deduction) || 0) +
      (Number(emp.internal_deduction) || 0) + (Number(emp.wallet_deduction) || 0);
  }, 0);

  const handleSubmit = async () => {
    if (!debitAccount) {
      setSubmitResult({ success: false, message: "يرجى إدخال رقم حساب الخصم" });
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const batchRes = await fetch("/api/anb-payroll/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: data.company_id,
          payroll_month: data.payroll_month,
          debit_account: debitAccount,
          auto_wps: true,
          mol_establishment_id: credentials.mol_establishment_id,
          national_unified_no: credentials.national_unified_no,
          items: data.employees.map(emp => ({
            employee_id: null,
            employee_name: emp.employee_name,
            identity_number: emp.iqama_number,
            iban: "",
            bank_code: "030",
            basic_salary: emp.basic_salary,
            housing_allowance: emp.housing_allowance,
            other_earnings: (Number(emp.monthly_bonus) || 0) + (Number(emp.internal_bonus) || 0) + (Number(emp.extra_amount) || 0),
            deductions: (Number(emp.target_deduction) || 0) + (Number(emp.operator_deduction) || 0) +
              (Number(emp.internal_deduction) || 0) + (Number(emp.wallet_deduction) || 0),
            net_salary: emp.net_salary,
          })),
        }),
      });

      const batchData = await batchRes.json();
      if (!batchRes.ok) {
        setSubmitResult({ success: false, message: batchData.error || "فشل في إنشاء الدفعة" });
        return;
      }

      const submitRes = await fetch("/api/anb-payroll/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch_id: batchData.batch_id }),
      });

      const submitData = await submitRes.json();
      if (submitRes.ok) {
        setSubmitResult({
          success: true,
          message: "تم إرسال دفعة الرواتب بنجاح عبر بنك ANB",
          reference: batchData.batch_reference,
        });
        sessionStorage.removeItem("anb_payroll_data");
      } else {
        setSubmitResult({
          success: false,
          message: submitData.error || "فشل في إرسال الدفعة لبنك ANB",
          reference: batchData.batch_reference,
        });
      }
    } catch {
      setSubmitResult({ success: false, message: "حدث خطأ في الاتصال" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/salary-payrolls" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ArrowRight className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            إرسال رواتب عبر بنك ANB (مُدد)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            مراجعة وتأكيد إرسال الرواتب للموظفين المحددين بطريقة &quot;مدد&quot;
          </p>
        </div>
      </div>

      {/* Payroll Info */}
      <div className="bg-gradient-to-l from-blue-600 to-blue-800 rounded-2xl p-6 mb-6 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-blue-200 text-xs mb-1">شهر المسير</p>
            <p className="font-bold text-lg">{data.payroll_month}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs mb-1">الباقة</p>
            <p className="font-bold text-lg">{data.package_name || "-"}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs mb-1">عدد الموظفين</p>
            <p className="font-bold text-lg flex items-center gap-1">
              <Users className="h-5 w-5" />
              {data.employees.length}
            </p>
          </div>
          <div>
            <p className="text-blue-200 text-xs mb-1">إجمالي صافي الرواتب</p>
            <p className="font-bold text-xl">{totalNetSalary.toLocaleString("ar-SA")} ر.س</p>
          </div>
        </div>
      </div>

      {/* ANB Connection Info */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          بيانات الربط مع البنك
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block mb-1">رقم المنشأة</span>
            <span className="font-medium text-gray-900 dark:text-white">{credentials.corporate_id || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">رقم منشأة وزارة العمل</span>
            <span className="font-medium text-gray-900 dark:text-white">{credentials.mol_establishment_id || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">الرقم الموحد</span>
            <span className="font-medium text-gray-900 dark:text-white">{credentials.national_unified_no || "-"}</span>
          </div>
          <div>
            <label className="text-gray-500 block mb-1">حساب الخصم *</label>
            <input
              type="text"
              value={debitAccount}
              onChange={(e) => setDebitAccount(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              placeholder="رقم الحساب البنكي"
            />
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            الموظفين ({data.employees.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                <th className="px-4 py-3 text-right font-medium">#</th>
                <th className="px-4 py-3 text-right font-medium">اسم الموظف</th>
                <th className="px-4 py-3 text-right font-medium">رقم الهوية</th>
                <th className="px-4 py-3 text-right font-medium">الكود</th>
                <th className="px-4 py-3 text-right font-medium">الراتب الأساسي</th>
                <th className="px-4 py-3 text-right font-medium">بدل السكن</th>
                <th className="px-4 py-3 text-right font-medium">الخصومات</th>
                <th className="px-4 py-3 text-right font-medium">المكافآت</th>
                <th className="px-4 py-3 text-right font-medium">صافي الراتب</th>
              </tr>
            </thead>
            <tbody>
              {data.employees.map((emp, idx) => {
                const deductions = (Number(emp.target_deduction) || 0) + (Number(emp.operator_deduction) || 0) +
                  (Number(emp.internal_deduction) || 0) + (Number(emp.wallet_deduction) || 0);
                const bonuses = (Number(emp.monthly_bonus) || 0) + (Number(emp.internal_bonus) || 0) + (Number(emp.extra_amount) || 0);
                return (
                  <tr key={idx} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{emp.employee_name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{emp.iqama_number}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{emp.user_code}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{Number(emp.basic_salary).toLocaleString("ar-SA")}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{Number(emp.housing_allowance).toLocaleString("ar-SA")}</td>
                    <td className="px-4 py-3 text-red-600">{deductions > 0 ? `-${deductions.toLocaleString("ar-SA")}` : "0"}</td>
                    <td className="px-4 py-3 text-green-600">{bonuses > 0 ? `+${bonuses.toLocaleString("ar-SA")}` : "0"}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">{Number(emp.net_salary).toLocaleString("ar-SA")}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-t-2 border-gray-300 dark:border-gray-600 font-bold">
                <td className="px-4 py-3" colSpan={4}>الإجمالي</td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">{totalBasicSalary.toLocaleString("ar-SA")}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">{totalHousing.toLocaleString("ar-SA")}</td>
                <td className="px-4 py-3 text-red-600">{totalDeductions > 0 ? `-${totalDeductions.toLocaleString("ar-SA")}` : "0"}</td>
                <td className="px-4 py-3 text-green-600">-</td>
                <td className="px-4 py-3 text-emerald-600 text-lg">{totalNetSalary.toLocaleString("ar-SA")} ر.س</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Submit Result */}
      {submitResult && (
        <div className={`rounded-xl p-5 mb-6 flex items-start gap-3 ${
          submitResult.success
            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        }`}>
          {submitResult.success ? (
            <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`font-bold ${submitResult.success ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
              {submitResult.message}
            </p>
            {submitResult.reference && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                رقم المرجع: <span className="font-mono font-bold">{submitResult.reference}</span>
              </p>
            )}
            {submitResult.success && (
              <Link
                href="/settings"
                className="inline-block mt-3 text-sm text-green-700 dark:text-green-300 underline hover:no-underline"
              >
                عرض إعدادات ANB
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Link
          href="/salary-payrolls"
          className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          إلغاء والعودة
        </Link>
        <button
          onClick={handleSubmit}
          disabled={submitting || submitResult?.success === true}
          className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-green-600/25"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              تأكيد وإرسال لبنك ANB
            </>
          )}
        </button>
      </div>
    </div>
  );
}
