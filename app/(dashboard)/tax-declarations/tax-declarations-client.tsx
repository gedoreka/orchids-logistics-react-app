"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  FileCheck, 
  AlertCircle, 
  ArrowRight, 
  Download,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  History
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TaxDeclaration {
  id: string;
  period_year: number;
  period_quarter: number;
  start_date: string;
  end_date: string;
  status: string;
  total_sales_taxable: number;
  total_output_tax: number;
  total_purchases_taxable: number;
  total_input_tax: number;
  net_tax_payable: number;
  created_at: string;
}

export function TaxDeclarationsClient({ companyId }: { companyId: number }) {
  const [declarations, setDeclarations] = useState<TaxDeclaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDeclarations();
  }, [companyId]);

  const fetchDeclarations = async () => {
    try {
      const response = await fetch(`/api/taxes/declarations?company_id=${companyId}`);
      const data = await response.json();
      if (data.success) {
        setDeclarations(data.declarations);
      }
    } catch (error) {
      console.error("Error fetching declarations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeclarations = declarations.filter(d => 
    d.period_year.toString().includes(searchTerm) || 
    `Q${d.period_quarter}`.includes(searchTerm.toUpperCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-green-100 text-green-800 border-green-200">مقدم</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">مكتمل</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">مسودة</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12" dir="rtl">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200/60 pb-8 pt-6 px-6 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <FileText className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">وحدة الإقرارات الضريبية</h1>
            </div>
            <p className="text-gray-500 mr-11 text-sm font-medium">إدارة وأتمتة الإقرارات الضريبية ربع السنوية بدقة</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/tax-declarations/matching">
              <Button variant="outline" className="border-gray-200 hover:bg-gray-50 gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                مطابقة المنصرفات
              </Button>
            </Link>
            <Link href="/tax-declarations/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-100 font-bold px-6">
                <Plus className="w-5 h-5" />
                إنشاء إقرار جديد
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 max-w-7xl mx-auto space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden group hover:shadow-indigo-100/50 transition-all duration-300">
              <CardContent className="p-7">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">إجمالي الضريبة المستحقة</p>
                    <h3 className="text-3xl font-black text-gray-900 mt-1">
                      {declarations.reduce((sum, d) => sum + Number(d.net_tax_payable), 0).toLocaleString()} 
                      <span className="text-sm font-bold text-gray-400 mr-2 uppercase">ر.س</span>
                    </h3>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
                    <FileCheck className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden group hover:shadow-emerald-100/50 transition-all duration-300">
              <CardContent className="p-7">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">إقرارات مقدمة</p>
                    <h3 className="text-3xl font-black text-gray-900 mt-1">
                      {declarations.filter(d => d.status === 'submitted').length}
                    </h3>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden group hover:shadow-amber-100/50 transition-all duration-300">
              <CardContent className="p-7">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">إقرارات معلقة</p>
                    <h3 className="text-3xl font-black text-gray-900 mt-1">
                      {declarations.filter(d => d.status !== 'submitted').length}
                    </h3>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
                    <Clock className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Table Section */}
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
          <CardHeader className="p-8 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-xl font-black flex items-center gap-2 text-gray-900">
                <History className="w-6 h-6 text-indigo-600" />
                سجل الإقرارات الضريبية
              </CardTitle>
              <CardDescription className="text-gray-500 font-medium">عرض وتدقيق ومتابعة كافة الإقرارات الضريبية السابقة</CardDescription>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="بحث بالسنة أو الربع..." 
                  className="pr-10 bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 w-full md:w-64 h-11 font-medium transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="h-11 w-11 border-gray-100 hover:bg-gray-50">
                <Filter className="w-4 h-4 text-gray-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-gray-50/80 text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-5">الفترة الضريبية</th>
                    <th className="px-6 py-5">تاريخ البداية</th>
                    <th className="px-6 py-5">تاريخ النهاية</th>
                    <th className="px-6 py-5">ضريبة المخرجات</th>
                    <th className="px-6 py-5">ضريبة المدخلات</th>
                    <th className="px-6 py-5">صافي الضريبة</th>
                    <th className="px-6 py-5 text-center">الحالة</th>
                    <th className="px-6 py-5">تاريخ الإنشاء</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin opacity-20" />
                          <p className="text-gray-400 font-bold">جاري تحميل سجل البيانات الضريبية...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredDeclarations.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-gray-200" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-900 font-bold text-lg">لا يوجد إقرارات ضريبية</p>
                            <p className="text-gray-400 text-sm">ابدأ بإنشاء إقرار ضريبي جديد للفترة الحالية</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDeclarations.map((d) => (
                      <motion.tr 
                        key={d.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-indigo-50/30 transition-colors group cursor-default"
                      >
                        <td className="px-8 py-5 font-black text-gray-900">
                          الربع {d.period_quarter} - {d.period_year}
                        </td>
                        <td className="px-6 py-5 text-gray-500 font-medium">{d.start_date}</td>
                        <td className="px-6 py-5 text-gray-500 font-medium">{d.end_date}</td>
                        <td className="px-6 py-5 text-emerald-600 font-black">
                          {Number(d.total_output_tax).toLocaleString()} 
                          <span className="text-[10px] mr-1 opacity-70">ر.س</span>
                        </td>
                        <td className="px-6 py-5 text-rose-500 font-black">
                          {Number(d.total_input_tax).toLocaleString()} 
                          <span className="text-[10px] mr-1 opacity-70">ر.س</span>
                        </td>
                        <td className="px-6 py-5 font-black text-gray-900 bg-gray-50/50">
                          {Number(d.net_tax_payable).toLocaleString()} 
                          <span className="text-[10px] mr-1 opacity-50 font-bold">ر.س</span>
                        </td>
                        <td className="px-6 py-5 text-center">{getStatusBadge(d.status)}</td>
                        <td className="px-6 py-5 text-gray-400 text-sm font-medium">
                          {format(new Date(d.created_at), "yyyy-MM-dd")}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-indigo-600 hover:bg-white shadow-sm border border-transparent hover:border-indigo-100">
                              <Download className="w-4.5 h-4.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-indigo-600 hover:bg-white shadow-sm border border-transparent hover:border-indigo-100">
                              <MoreVertical className="w-4.5 h-4.5" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
