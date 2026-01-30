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
    <div className="min-h-screen bg-[#f8fafc] pb-12" dir="rtl">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200/60 pb-8 pt-6 px-6 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <FileSearch className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">أداة مطابقة المنصرفات</h1>
            </div>
            <p className="text-gray-500 mr-11 text-sm font-medium">ربط المنصرفات بالمستندات الضريبية (الفواتير الواردة)</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="gap-2 text-gray-500 hover:text-gray-900 font-bold"
          >
            <ChevronLeft className="w-5 h-5" />
            رجوع للوحدة الضريبية
          </Button>
        </div>
      </div>

      <div className="px-6 max-w-7xl mx-auto space-y-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              placeholder="البحث في المنصرفات غير المطابقة..." 
              className="pr-12 bg-white border-none shadow-[0_4px_20px_rgb(0,0,0,0.03)] h-14 font-medium focus:ring-2 focus:ring-indigo-500/20 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-14 bg-white border-gray-100 shadow-sm gap-2 font-bold px-6">
            <Filter className="w-5 h-5" />
            تصفية متقدمة
          </Button>
        </div>

        {/* Main Content Table */}
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
          <CardHeader className="p-8 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-xl font-black flex items-center gap-2 text-gray-900">
                <AlertCircle className="w-6 h-6 text-amber-500" />
                منصرفات بانتظار المطابقة
              </CardTitle>
              <CardDescription className="text-gray-500 font-medium mt-1">عرض المصروفات التي لم يتم ربطها بمستند ضريبي بعد لاسترداد ضريبة المدخلات</CardDescription>
            </div>
            <Badge className="bg-amber-50 text-amber-700 border-none font-black px-4 py-1.5 text-sm uppercase tracking-wider">
              {expenses.length} عملية معلقة
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-gray-50/80 text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-5">تاريخ المنصرف</th>
                    <th className="px-6 py-5">البيان / الوصف</th>
                    <th className="px-6 py-5">النوع</th>
                    <th className="px-6 py-5">المبلغ الرئيسي</th>
                    <th className="px-6 py-5">قيمة الضريبة</th>
                    <th className="px-8 py-5 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin opacity-20" />
                          <p className="text-gray-400 font-bold">جاري تحميل المنصرفات...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-900 font-bold text-lg">كافة المنصرفات مطابقة</p>
                            <p className="text-gray-400 text-sm">تم ربط جميع المصروفات بالمستندات الضريبية بنجاح</p>
                          </div>
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
                        className="hover:bg-indigo-50/30 transition-colors group"
                      >
                        <td className="px-8 py-5 text-gray-500 font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 opacity-40" />
                            {e.expense_date}
                          </div>
                        </td>
                        <td className="px-6 py-5 font-black text-gray-900">{e.description}</td>
                        <td className="px-6 py-5">
                          <Badge variant="outline" className="border-gray-200 text-gray-500 font-bold bg-gray-50/50">
                            {e.expense_type}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 font-black text-gray-900">
                          {Number(e.amount).toLocaleString()} 
                          <span className="text-[10px] mr-1 opacity-50 font-bold">ر.س</span>
                        </td>
                        <td className="px-6 py-5 text-rose-500 font-black">
                          {Number(e.tax_value).toLocaleString()} 
                          <span className="text-[10px] mr-1 opacity-70">ر.س</span>
                        </td>
                        <td className="px-8 py-5">
                          {matchingId === e.id ? (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-lg border border-indigo-100"
                            >
                              <Input 
                                placeholder="رقم الفاتورة الضريبية..." 
                                className="w-48 h-10 text-sm font-bold border-none bg-gray-50"
                                autoFocus
                                value={docIdInput}
                                onChange={(e) => setDocIdIdInput(e.target.value)}
                              />
                              <Button size="sm" className="h-10 px-4 bg-indigo-600 font-black" onClick={() => handleMatch(e.id)}>حفظ</Button>
                              <Button size="sm" variant="ghost" className="h-10 px-3 text-gray-400" onClick={() => setMatchingId(null)}>إلغاء</Button>
                            </motion.div>
                          ) : (
                            <div className="flex justify-center">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-indigo-600 hover:text-white hover:bg-indigo-600 gap-2 font-black px-4 rounded-lg h-10 transition-all border border-transparent hover:border-indigo-600"
                                onClick={() => {
                                  setMatchingId(e.id);
                                  setDocIdIdInput("");
                                }}
                              >
                                <LinkIcon className="w-4 h-4" />
                                مطابقة المستند
                              </Button>
                            </div>
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

        {/* Informational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-indigo-950 text-white border-none shadow-xl overflow-hidden relative group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-600/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-600/20 transition-all" />
            <CardContent className="p-8 flex gap-6 relative z-10">
              <div className="p-4 bg-white/5 rounded-2xl text-indigo-300 h-fit border border-white/10 group-hover:scale-110 transition-transform">
                <FileSearch className="w-8 h-8" />
              </div>
              <div className="space-y-3">
                <h3 className="font-black text-white text-xl">تقرير الفجوات الضريبية</h3>
                <p className="text-sm text-indigo-200/70 font-medium leading-relaxed">
                  يحلل النظام آلياً كافة المصروفات التي تفتقر لمستندات ضريبية رسمية، مما يجنبك المخاطر الضريبية ويضمن جاهزية ملفاتك للمراجعة.
                </p>
                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 font-black gap-2 h-11 mt-2">
                  تنزيل التقرير التحليلي
                  <ExternalLink className="w-4 h-4 opacity-50" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-950 text-white border-none shadow-xl overflow-hidden relative group">
            <div className="absolute left-0 bottom-0 w-32 h-32 bg-emerald-600/10 rounded-full -ml-16 -mb-16 blur-2xl group-hover:bg-emerald-600/20 transition-all" />
            <CardContent className="p-8 flex gap-6 relative z-10">
              <div className="p-4 bg-white/5 rounded-2xl text-emerald-300 h-fit border border-white/10 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-3">
                <h3 className="font-black text-white text-xl">استرداد ضريبة المدخلات</h3>
                <p className="text-sm text-emerald-200/70 font-medium leading-relaxed">
                  بربطك للفواتير الضريبية الواردة، تضمن الشركة حقها القانوني في خصم ضريبة المشتريات من إجمالي الضريبة المستحقة للسداد للدولة.
                </p>
                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 font-black gap-2 h-11 mt-2">
                  عرض السجلات المطابقة
                  <ExternalLink className="w-4 h-4 opacity-50" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
