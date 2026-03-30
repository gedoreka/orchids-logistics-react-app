"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/locale-context";
import { Save, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ACCOUNT_KEYS = [
  { key: "cash", labelAr: "حساب الصندوق", labelEn: "Cash Account" },
  { key: "bank", labelAr: "حساب البنك", labelEn: "Bank Account" },
  { key: "customers", labelAr: "حساب العملاء", labelEn: "Customers Account" },
  { key: "suppliers", labelAr: "حساب الموردين", labelEn: "Suppliers Account" },
  { key: "vat", labelAr: "ضريبة القيمة المضافة", labelEn: "VAT Account" },
  { key: "sales_revenue", labelAr: "إيرادات المبيعات", labelEn: "Sales Revenue" },
  { key: "other_revenue", labelAr: "إيرادات أخرى", labelEn: "Other Revenue" },
  { key: "salaries", labelAr: "الرواتب والأجور", labelEn: "Salaries & Wages" },
  { key: "rent", labelAr: "الإيجار", labelEn: "Rent" },
  { key: "utilities", labelAr: "الكهرباء والمياه", labelEn: "Utilities" },
  { key: "admin_expenses", labelAr: "مصاريف إدارية", labelEn: "Administrative Expenses" },
];

export default function DefaultAccountsPage() {
  const { locale, isRTL } = useLocale();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [mappings, setMappings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/default-accounts");
      const data = await res.json();
      setAccounts(data.accounts || []);
      const map: Record<string, number> = {};
      (data.defaults || []).forEach((d: any) => {
        map[d.account_key] = d.account_id;
      });
      setMappings(map);
    } catch (err) {
      toast.error(isRTL ? "فشل في تحميل البيانات" : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const mappingsList = Object.entries(mappings)
        .filter(([_, v]) => v)
        .map(([account_key, account_id]) => ({ account_key, account_id }));

      const res = await fetch("/api/default-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mappings: mappingsList }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isRTL ? "تم حفظ الحسابات الافتراضية بنجاح" : "Default accounts saved successfully");
      } else {
        toast.error(data.error || (isRTL ? "فشل في الحفظ" : "Failed to save"));
      }
    } catch {
      toast.error(isRTL ? "فشل في الحفظ" : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isRTL ? "الحسابات الافتراضية" : "Default Accounts"}
          </h1>
          <p className="text-sm text-gray-500">
            {isRTL
              ? "ربط أنواع العمليات المالية بالحسابات المحاسبية لإنشاء القيود اليومية تلقائياً"
              : "Link financial operation types to accounting accounts for automatic journal entries"}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">
            {isRTL ? "ربط الحسابات" : "Account Mappings"}
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {ACCOUNT_KEYS.map((item) => (
            <div key={item.key} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[200px]">
                {isRTL ? item.labelAr : item.labelEn}
              </label>
              <select
                value={mappings[item.key] || ""}
                onChange={(e) =>
                  setMappings((prev) => ({
                    ...prev,
                    [item.key]: parseInt(e.target.value) || 0,
                  }))
                }
                className="flex-1 max-w-md px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{isRTL ? "-- اختر حساب --" : "-- Select Account --"}</option>
                {accounts.map((acc: any) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_code} - {acc.account_name} ({acc.type})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isRTL ? "حفظ الإعدادات" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
