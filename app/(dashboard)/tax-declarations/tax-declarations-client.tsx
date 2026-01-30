"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Eye, Pencil, Trash2, Printer, Search, Calendar, FileCheck, AlertCircle, ArrowRight, Download, Filter, MoreVertical, CheckCircle2, Clock, History, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DeleteNotification, useDeleteNotification } from "@/components/ui/delete-notification";

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
    const { 
      notification, 
      showDeleteConfirm, 
      showLoading, 
      showSuccess, 
      showError, 
      hideNotification 
    } = useDeleteNotification("indigo");
    
    const [declarations, setDeclarations] = useState<TaxDeclaration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDeclaration, setSelectedDeclaration] = useState<TaxDeclaration | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);


  useEffect(() => {
    fetchDeclarations();
  }, [companyId]);

  const fetchDeclarations = async () => {
    try {
      setLoading(true);
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

    const handleDelete = async (id: string) => {
      showDeleteConfirm(
        "تأكيد الحذف",
        "هل أنت متأكد من حذف هذا الإقرار الضريبي؟ لا يمكن التراجع عن هذا الإجراء.",
        async () => {
          try {
            showLoading("جاري الحذف...", "يتم الآن حذف الإقرار الضريبي نهائياً.");
            const response = await fetch(`/api/taxes/declarations/${id}`, {
              method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
              setDeclarations(declarations.filter(d => d.id !== id));
              showSuccess("تم الحذف بنجاح", "تمت إزالة الإقرار الضريبي من النظام.");
            } else {
              showError("فشل الحذف", data.error || "عذراً، حدث خطأ أثناء محاولة حذف الإقرار.");
            }
          } catch (error) {
            console.error("Error deleting declaration:", error);
            showError("خطأ في الاتصال", "تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى.");
          }
        }
      );
    };

    const handleUpdateStatus = async (status: string) => {
      if (!selectedDeclaration) return;

      try {
        showLoading("جاري التحديث...", "يتم الآن تحديث حالة الإقرار الضريبي.");
        const response = await fetch(`/api/taxes/declarations/${selectedDeclaration.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        const data = await response.json();
        if (data.success) {
          setDeclarations(declarations.map(d => d.id === selectedDeclaration.id ? { ...d, status } : d));
          setIsEditOpen(false);
          showSuccess("تم التحديث بنجاح", "تم تغيير حالة الإقرار الضريبي بنجاح.");
        } else {
          showError("فشل التحديث", "عذراً، حدث خطأ أثناء محاولة تحديث الحالة.");
        }
      } catch (error) {
        console.error("Error updating declaration:", error);
        showError("خطأ في الاتصال", "تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى.");
      }
    };


  const handlePrint = (d: TaxDeclaration) => {
    const printContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 40px;">
        <h1 style="text-align: center;">إقرار ضريبة القيمة المضافة</h1>
        <hr/>
        <p><strong>الفترة:</strong> الربع ${d.period_quarter} - ${d.period_year}</p>
        <p><strong>التاريخ:</strong> ${d.start_date} إلى ${d.end_date}</p>
        <p><strong>الحالة:</strong> ${d.status === 'submitted' ? 'مقدم' : d.status === 'completed' ? 'مكتمل' : 'مسودة'}</p>
        <br/>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #f0f0f0;">
            <th style="border: 1px solid #ddd; padding: 10px;">البيان</th>
            <th style="border: 1px solid #ddd; padding: 10px;">المبلغ (ر.س)</th>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;">إجمالي المبيعات الخاضعة للضريبة</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${Number(d.total_sales_taxable).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;">ضريبة المخرجات</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${Number(d.total_output_tax).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;">إجمالي المشتريات الخاضعة للضريبة</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${Number(d.total_purchases_taxable).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;">ضريبة المدخلات</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${Number(d.total_input_tax).toLocaleString()}</td>
          </tr>
          <tr style="font-weight: bold; background: #eef2ff;">
            <td style="border: 1px solid #ddd; padding: 10px;">صافي الضريبة المستحقة</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${Number(d.net_tax_payable).toLocaleString()}</td>
          </tr>
        </table>
        <br/>
        <p style="text-align: center; color: #666; font-size: 12px;">تم الطباعة في ${new Date().toLocaleString()}</p>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<html><head><title>Print Tax Declaration</title></head><body>${printContent}</body></html>`);
      printWindow.document.close();
      printWindow.print();
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
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-indigo-600 hover:bg-indigo-50"
                                onClick={() => {
                                  setSelectedDeclaration(d);
                                  setIsViewOpen(true);
                                }}
                                title="عرض التفاصيل"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-amber-600 hover:bg-amber-50"
                                onClick={() => {
                                  setSelectedDeclaration(d);
                                  setIsEditOpen(true);
                                }}
                                title="تعديل الحالة"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                onClick={() => handlePrint(d)}
                                title="طباعة الإقرار"
                              >
                                <Printer className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                                onClick={() => handleDelete(d.id)}
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
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

        {/* View Modal */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl bg-white" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">تفاصيل الإقرار الضريبي</DialogTitle>
              <DialogDescription>
                الربع {selectedDeclaration?.period_quarter} - {selectedDeclaration?.period_year}
              </DialogDescription>
            </DialogHeader>
            {selectedDeclaration && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 font-bold mb-1">تاريخ البداية</p>
                    <p className="font-black">{selectedDeclaration.start_date}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 font-bold mb-1">تاريخ النهاية</p>
                    <p className="font-black">{selectedDeclaration.end_date}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-black text-sm text-indigo-600 border-b pb-2">تفاصيل الضريبة</h4>
                  <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-gray-600 font-medium">إجمالي المبيعات الخاضعة للضريبة</span>
                    <span className="font-black">{Number(selectedDeclaration.total_sales_taxable).toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-gray-600 font-medium text-emerald-600">ضريبة المخرجات (+)</span>
                    <span className="font-black text-emerald-600">{Number(selectedDeclaration.total_output_tax).toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-gray-600 font-medium">إجمالي المشتريات الخاضعة للضريبة</span>
                    <span className="font-black">{Number(selectedDeclaration.total_purchases_taxable).toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-gray-600 font-medium text-rose-600">ضريبة المدخلات (-)</span>
                    <span className="font-black text-rose-600">{Number(selectedDeclaration.total_input_tax).toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center py-4 bg-indigo-50 px-4 rounded-xl mt-4">
                    <span className="font-black text-indigo-900">صافي الضريبة المستحقة</span>
                    <span className="text-xl font-black text-indigo-600">{Number(selectedDeclaration.net_tax_payable).toLocaleString()} ر.س</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsViewOpen(false)}>إغلاق</Button>
                  <Button className="bg-indigo-600 text-white" onClick={() => handlePrint(selectedDeclaration)}>
                    <Printer className="w-4 h-4 ml-2" />
                    طباعة
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Status Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-md bg-white" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">تعديل حالة الإقرار</DialogTitle>
              <DialogDescription>تحديث حالة الإقرار الضريبي الحالي</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <Button 
                variant={selectedDeclaration?.status === 'draft' ? 'default' : 'outline'}
                className="justify-start h-12 font-bold"
                onClick={() => handleUpdateStatus('draft')}
              >
                <div className="w-3 h-3 rounded-full bg-yellow-400 ml-3" />
                مسودة
              </Button>
              <Button 
                variant={selectedDeclaration?.status === 'submitted' ? 'default' : 'outline'}
                className="justify-start h-12 font-bold"
                onClick={() => handleUpdateStatus('submitted')}
              >
                <div className="w-3 h-3 rounded-full bg-green-500 ml-3" />
                تم التقديم
              </Button>
              <Button 
                variant={selectedDeclaration?.status === 'completed' ? 'default' : 'outline'}
                className="justify-start h-12 font-bold"
                onClick={() => handleUpdateStatus('completed')}
              >
                <div className="w-3 h-3 rounded-full bg-blue-500 ml-3" />
                مكتمل ومسدد
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <DeleteNotification 
          notification={notification} 
          onClose={hideNotification} 
        />
      </div>
    );
  }
