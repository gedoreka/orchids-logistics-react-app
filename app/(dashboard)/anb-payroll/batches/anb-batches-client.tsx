"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Send, Trash2, Eye, AlertTriangle, CheckCircle2,
  Clock, XCircle, Loader2, FileText, Building2
} from "lucide-react";

interface Batch {
  id: number;
  batch_reference: string;
  payroll_month: string;
  debit_account: string;
  total_amount: number;
  employee_count: number;
  status: string;
  anb_uuid: string | null;
  auto_wps: number;
  submitted_at: string | null;
  created_at: string;
  item_count: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "مسودة", color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300", icon: FileText },
  submitted: { label: "تم الإرسال", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Send },
  processing: { label: "قيد المعالجة", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
  failed: { label: "فشل", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

export function AnbBatchesClient({
  batches: initialBatches,
  companyId,
  hasCredentials,
}: {
  batches: Batch[];
  companyId: number;
  hasCredentials: boolean;
}) {
  const router = useRouter();
  const [batches, setBatches] = useState(initialBatches);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleSubmit = async (batchId: number) => {
    if (!confirm("هل أنت متأكد من إرسال هذه الدفعة إلى ANB؟")) return;
    setSubmitting(batchId);
    try {
      const res = await fetch("/api/anb-payroll/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch_id: batchId, company_id: companyId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "تم الإرسال بنجاح");
        router.refresh();
      } else {
        alert(data.error || "فشل في الإرسال");
      }
    } catch {
      alert("حدث خطأ في الاتصال");
    } finally {
      setSubmitting(null);
    }
  };

  const handleDelete = async (batchId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الدفعة؟")) return;
    setDeleting(batchId);
    try {
      const res = await fetch(`/api/anb-payroll/batches/${batchId}`, { method: "DELETE" });
      if (res.ok) {
        setBatches(batches.filter((b) => b.id !== batchId));
      } else {
        const data = await res.json();
        alert(data.error || "فشل في الحذف");
      }
    } catch {
      alert("حدث خطأ");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-7 w-7 text-green-600" />
            دفعات رواتب ANB
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إدارة دفعات تحويل الرواتب عبر البنك العربي الوطني</p>
        </div>
        {hasCredentials ? (
          <Link
            href="/anb-payroll/batches/new"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            دفعة جديدة
          </Link>
        ) : (
          <Link
            href="/anb-payroll/settings"
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
          >
            <AlertTriangle className="h-5 w-5" />
            إعداد الاتصال أولاً
          </Link>
        )}
      </div>

      {!hasCredentials && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">يجب إعداد بيانات اعتماد ANB Connect قبل إنشاء دفعات الرواتب</span>
          </div>
        </div>
      )}

      {batches.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد دفعات حتى الآن</p>
          {hasCredentials && (
            <Link
              href="/anb-payroll/batches/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              إنشاء أول دفعة
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">المرجع</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">الشهر</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">الموظفين</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">المبلغ</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">الحالة</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">حماية أجور</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">التاريخ</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {batches.map((batch) => {
                  const status = statusConfig[batch.status] || statusConfig.draft;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={batch.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{batch.batch_reference}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{batch.payroll_month}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{batch.item_count || batch.employee_count}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {parseFloat(String(batch.total_amount)).toLocaleString("ar-SA")} ر.س
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {batch.auto_wps ? "نعم" : "لا"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(batch.created_at).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {batch.status === "draft" && (
                            <>
                              <button
                                onClick={() => handleSubmit(batch.id)}
                                disabled={submitting === batch.id}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                                title="إرسال إلى ANB"
                              >
                                {submitting === batch.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => handleDelete(batch.id)}
                                disabled={deleting === batch.id}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                title="حذف"
                              >
                                {deleting === batch.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
