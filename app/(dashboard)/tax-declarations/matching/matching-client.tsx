"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileSearch, 
  Search, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Filter,
  DollarSign,
  Calendar,
  ExternalLink,
  ChevronLeft
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UnmatchedExpense {
  id: string;
  expense_date: string;
  description: string;
  amount: number;
  tax_value: number;
  expense_type: string;
  tax_matching_status: string;
}

export function TaxMatchingClient({ companyId }: { companyId: number }) {
  const router = useRouter();
  const [expenses, setExpenses] = useState<UnmatchedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [matchingId, setMatchingId] = useState<string | null>(null);
  const [docIdInput, setDocIdIdInput] = useState("");

  useEffect(() => {
    fetchUnmatched();
  }, [companyId]);

  const fetchUnmatched = async () => {
    try {
      const response = await fetch(`/api/taxes/matching?company_id=${companyId}`);
      const data = await response.json();
      if (data.success) {
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (expenseId: string) => {
    if (!docIdInput.trim()) {
      toast.error("يرجى إدخال رقم المستند الضريبي");
      return;
    }

    try {
      const response = await fetch("/api/taxes/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expense_id: expenseId,
          tax_document_id: docIdInput,
          status: "matched"
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("تم مطابقة المنصرف بنجاح");
        setExpenses(expenses.filter(e => e.id !== expenseId));
        setMatchingId(null);
        setDocIdIdInput("");
      } else {
        toast.error("فشل في مطابقة المنصرف");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.expense_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">أداة مطابقة المنصرفات</h1>
          <p className="text-gray-500 mt-1">ربط المنصرفات بالمستندات الضريبية (الفواتير الواردة)</p>
        </div>
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          رجوع
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="البحث في المنصرفات غير المطابقة..." 
            className="pr-10 bg-white border-none shadow-sm h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 bg-white border-none shadow-sm gap-2">
          <Filter className="w-4 h-4" />
          تصفية متقدمة
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-6 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg font-bold">منصرفات بانتظار المطابقة</CardTitle>
            <CardDescription>عرض المصروفات التي لم يتم ربطها بمستند ضريبي بعد</CardDescription>
          </div>
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            {expenses.length} عملية معلقة
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-500 text-sm font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">تاريخ المنصرف</th>
                  <th className="px-6 py-4">البيان / الوصف</th>
                  <th className="px-6 py-4">النوع</th>
                  <th className="px-6 py-4">المبلغ الرئيسي</th>
                  <th className="px-6 py-4">قيمة الضريبة</th>
                  <th className="px-6 py-4">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">جاري التحميل...</td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-20" />
                        <p>كافة المنصرفات مطابقة حالياً</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((e) => (
                    <motion.tr 
                      key={e.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {e.expense_date}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{e.description}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{e.expense_type}</td>
                      <td className="px-6 py-4 font-bold">{Number(e.amount).toLocaleString()} ر.س</td>
                      <td className="px-6 py-4 text-rose-600 font-medium">
                        {Number(e.tax_value).toLocaleString()} ر.س
                      </td>
                      <td className="px-6 py-4">
                        {matchingId === e.id ? (
                          <div className="flex items-center gap-2">
                            <Input 
                              placeholder="رقم الفاتورة..." 
                              className="w-32 h-8 text-xs"
                              autoFocus
                              value={docIdInput}
                              onChange={(e) => setDocIdIdInput(e.target.value)}
                            />
                            <Button size="sm" className="h-8 px-3" onClick={() => handleMatch(e.id)}>حفظ</Button>
                            <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setMatchingId(null)}>إلغاء</Button>
                          </div>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-2"
                            onClick={() => {
                              setMatchingId(e.id);
                              setDocIdIdInput("");
                            }}
                          >
                            <LinkIcon className="w-3 h-3" />
                            مطابقة الآن
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-indigo-50 border-none shadow-sm">
          <CardContent className="p-6 flex gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600 h-fit">
              <FileSearch className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-indigo-900 mb-1 text-base">تقرير الفجوات الضريبية</h3>
              <p className="text-sm text-indigo-700 opacity-80 leading-relaxed">
                يساعدك هذا القسم في التعرف على المصروفات التي تفتقر لمستندات ضريبية رسمية، مما يسهل عملية المراجعة قبل تقديم الإقرار النهائي.
              </p>
              <Button variant="link" className="text-indigo-600 p-0 h-auto mt-3 font-bold gap-1">
                تنزيل تقرير الفجوات
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-none shadow-sm">
          <CardContent className="p-6 flex gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 h-fit">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-900 mb-1 text-base">مطابقة الفواتير الواردة</h3>
              <p className="text-sm text-emerald-700 opacity-80 leading-relaxed">
                يمكنك الآن ربط فواتير المشتريات والمصروفات مباشرة بالمنظومة الضريبية لضمان استرداد ضريبة المدخلات بشكل صحيح وقانوني.
              </p>
              <Button variant="link" className="text-emerald-600 p-0 h-auto mt-3 font-bold gap-1">
                عرض الفواتير المطابقة
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
