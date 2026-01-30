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
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">وحدة الإقرارات الضريبية</h1>
          <p className="text-gray-500 mt-1">إدارة وأتمتة الإقرارات الضريبية ربع السنوية</p>
        </div>
        <Link href="/tax-declarations/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            إنشاء إقرار جديد
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">إجمالي الضريبة المستحقة</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {declarations.reduce((sum, d) => sum + Number(d.net_tax_payable), 0).toLocaleString()} <span className="text-sm font-normal text-gray-500">ر.س</span>
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">إقرارات مقدمة</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {declarations.filter(d => d.status === 'submitted').length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">إقرارات معلقة</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {declarations.filter(d => d.status !== 'submitted').length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="p-6 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              سجل الإقرارات الضريبية
            </CardTitle>
            <CardDescription>عرض وتدقيق الإقرارات الضريبية السابقة</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="بحث (السنة، الربع...)" 
                className="pr-10 bg-gray-50 border-none w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="border-gray-200">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-500 text-sm font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">الفترة الضريبية</th>
                  <th className="px-6 py-4">تاريخ البداية</th>
                  <th className="px-6 py-4">تاريخ النهاية</th>
                  <th className="px-6 py-4">ضريبة المخرجات</th>
                  <th className="px-6 py-4">ضريبة المدخلات</th>
                  <th className="px-6 py-4">صافي الضريبة</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4">تاريخ الإنشاء</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-400">جاري التحميل...</td>
                  </tr>
                ) : filteredDeclarations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 opacity-20" />
                        <p>لا يوجد إقرارات ضريبية مسجلة</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDeclarations.map((d) => (
                    <motion.tr 
                      key={d.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-gray-900">
                        الربع {d.period_quarter} - {d.period_year}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{d.start_date}</td>
                      <td className="px-6 py-4 text-gray-600">{d.end_date}</td>
                      <td className="px-6 py-4 text-emerald-600 font-medium">
                        {Number(d.total_output_tax).toLocaleString()} ر.س
                      </td>
                      <td className="px-6 py-4 text-rose-600 font-medium">
                        {Number(d.total_input_tax).toLocaleString()} ر.س
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {Number(d.net_tax_payable).toLocaleString()} ر.س
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(d.status)}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {format(new Date(d.created_at), "yyyy-MM-dd")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
                            <MoreVertical className="w-4 h-4" />
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
  );
}
