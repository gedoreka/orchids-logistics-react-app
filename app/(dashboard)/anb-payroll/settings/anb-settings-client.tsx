"use client";

import { useState } from "react";
import { Building2, Key, Shield, Save, CheckCircle, AlertCircle, Upload, Eye, EyeOff } from "lucide-react";

interface AnbCredentials {
  id: number;
  company_id: number;
  client_id: string;
  client_secret_masked: string;
  has_certificate: number;
  has_private_key: number;
  mol_establishment_id: string | null;
  national_unified_no: string | null;
  debit_account: string | null;
  bank_code: string;
  is_active: number;
  updated_at?: string;
  created_at?: string;
}

export function AnbSettingsClient({
  credentials,
  companyId,
}: {
  credentials: AnbCredentials | null;
  companyId: number;
}) {
  const [form, setForm] = useState({
    client_id: credentials?.client_id || "",
    client_secret: "",
    mol_establishment_id: credentials?.mol_establishment_id || "",
    national_unified_no: credentials?.national_unified_no || "",
    debit_account: credentials?.debit_account || "",
    bank_code: credentials?.bank_code || "030",
  });
  const [certificate, setCertificate] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  const handleFileRead = (file: File, setter: (val: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setter(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload: any = {
        company_id: companyId,
        client_id: form.client_id,
        client_secret: form.client_secret || "********",
        mol_establishment_id: form.mol_establishment_id,
        national_unified_no: form.national_unified_no,
        debit_account: form.debit_account,
        bank_code: form.bank_code,
      };

      if (certificate) payload.mtls_certificate = certificate;
      if (privateKey) payload.mtls_private_key = privateKey;

      const res = await fetch("/api/anb-payroll/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message || "تم الحفظ بنجاح" });
      } else {
        setMessage({ type: "error", text: data.error || "فشل في الحفظ" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "حدث خطأ في الاتصال" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Building2 className="h-7 w-7 text-green-600" />
          إعدادات بوابة ANB Connect
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          قم بإدخال بيانات اعتماد ANB Connect الخاصة بشركتك لتحويل الرواتب عبر البنك العربي الوطني
        </p>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
          message.type === "success"
            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
        }`}>
          {message.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      {credentials && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>تم إعداد الاتصال - آخر تحديث: {new Date(credentials.updated_at || credentials.created_at || "").toLocaleDateString("ar-SA")}</span>
          </div>
          <div className="mt-2 flex gap-4 text-xs text-blue-600 dark:text-blue-300">
            <span>الشهادة: {credentials.has_certificate ? "✓ موجودة" : "✗ غير موجودة"}</span>
            <span>المفتاح الخاص: {credentials.has_private_key ? "✓ موجود" : "✗ غير موجود"}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* API Credentials */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Key className="h-5 w-5 text-amber-500" />
            بيانات API
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="أدخل Client ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client Secret <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={form.client_secret}
                  onChange={(e) => setForm({ ...form, client_secret: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm pl-10"
                  placeholder={credentials ? "اتركه فارغاً للاحتفاظ بالقيمة الحالية" : "أدخل Client Secret"}
                  required={!credentials}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* mTLS Certificates */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-blue-500" />
            شهادة mTLS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                شهادة SSL (Certificate .pem / .crt)
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {certificate ? "تم اختيار الملف" : "اختر ملف الشهادة"}
                  </span>
                  <input
                    type="file"
                    accept=".pem,.crt,.cert"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileRead(file, setCertificate);
                    }}
                  />
                </label>
              </div>
              {certificate && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">تم تحميل الشهادة بنجاح</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                المفتاح الخاص (Private Key .key / .pem)
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {privateKey ? "تم اختيار الملف" : "اختر ملف المفتاح الخاص"}
                  </span>
                  <input
                    type="file"
                    accept=".pem,.key"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileRead(file, setPrivateKey);
                    }}
                  />
                </label>
              </div>
              {privateKey && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">تم تحميل المفتاح الخاص بنجاح</p>
              )}
            </div>
          </div>
        </div>

        {/* Bank & WPS Settings */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-green-500" />
            بيانات البنك وحماية الأجور
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                رقم حساب الخصم (Debit Account)
              </label>
              <input
                type="text"
                value={form.debit_account}
                onChange={(e) => setForm({ ...form, debit_account: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="رقم الحساب البنكي (16 رقم)"
                maxLength={16}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                رمز البنك (Bank Code)
              </label>
              <input
                type="text"
                value={form.bank_code}
                onChange={(e) => setForm({ ...form, bank_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="030"
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                رقم المنشأة - وزارة العمل (MOL Establishment ID)
              </label>
              <input
                type="text"
                value={form.mol_establishment_id}
                onChange={(e) => setForm({ ...form, mol_establishment_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="لنظام حماية الأجور (مُدد)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الرقم الوطني الموحد (National Unified No)
              </label>
              <input
                type="text"
                value={form.national_unified_no}
                onChange={(e) => setForm({ ...form, national_unified_no: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="لنظام حماية الأجور (مُدد)"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            <Save className="h-5 w-5" />
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      </form>
    </div>
  );
}
