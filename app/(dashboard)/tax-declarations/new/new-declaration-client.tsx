"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Send, 
  RefreshCw, 
  Calculator, 
  FileText, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function NewTaxDeclarationClient({ companyId }: { companyId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [step, setStep] = useState(1);
  
  const [period, setPeriod] = useState({
    year: new Date().getFullYear().toString(),
    quarter: "1"
  });

  const [declarationData, setDeclarationData] = useState({
    total_sales_taxable: 0,
    total_output_tax: 0,
    total_purchases_taxable: 0,
    total_input_tax: 0,
    net_tax_payable: 0,
    details: null as any
  });

  const getPeriodDates = (year: string, quarter: string) => {
    const y = parseInt(year);
    const q = parseInt(quarter);
    switch (q) {
      case 1: return { start: `${y}-01-01`, end: `${y}-03-31` };
      case 2: return { start: `${y}-04-01`, end: `${y}-06-30` };
      case 3: return { start: `${y}-07-01`, end: `${y}-09-30` };
      case 4: return { start: `${y}-10-01`, end: `${y}-12-31` };
      default: return { start: `${y}-01-01`, end: `${y}-03-31` };
    }
  };

  const handleCollectData = async () => {
    setCollecting(true);
    const { start, end } = getPeriodDates(period.year, period.quarter);
    try {
      const response = await fetch(`/api/taxes/declarations/collect?company_id=${companyId}&start_date=${start}&end_date=${end}`);
      const data = await response.json();
      if (data.success) {
        setDeclarationData(data.data);
        setStep(2);
        toast.success("تم تجميع البيانات الضريبية بنجاح");
      } else {
        toast.error(data.error || "فشل في تجميع البيانات");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setCollecting(false);
    }
  };

  const handleSave = async (status: string) => {
    setLoading(true);
    const { start, end } = getPeriodDates(period.year, period.quarter);
    try {
      const response = await fetch("/api/taxes/declarations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          period_year: parseInt(period.year),
          period_quarter: parseInt(period.quarter),
          start_date: start,
          end_date: end,
          status,
          ...declarationData
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(status === 'submitted' ? "تم تقديم الإقرار بنجاح" : "تم حفظ المسودة");
        router.push("/tax-declarations");
      } else {
        toast.error(data.error || "فشل في حفظ الإقرار");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إنشاء إقرار ضريبي جديد</h1>
          <p className="text-gray-500">اتباع الخطوات لإعداد الإقرار الربع سنوي</p>
        </div>
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          رجوع
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${step >= s ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= s ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}>
                {s}
              </div>
              <span className="font-medium">
                {s === 1 ? "الفترة" : s === 2 ? "المراجعة" : "التأكيد"}
              </span>
            </div>
            {s < 3 && <div className={`flex-1 h-px ${step > s ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>تحديد الفترة الضريبية</CardTitle>
                <CardDescription>اختر السنة والربع السنوي المراد إصدار الإقرار له</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">السنة</label>
                    <Select value={period.year} onValueChange={(v) => setPeriod({...period, year: v})}>
                      <SelectTrigger className="bg-gray-50 border-none">
                        <SelectValue placeholder="اختر السنة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الربع السنوي</label>
                    <Select value={period.quarter} onValueChange={(v) => setPeriod({...period, quarter: v})}>
                      <SelectTrigger className="bg-gray-50 border-none">
                        <SelectValue placeholder="اختر الربع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">الربع الأول (يناير - مارس)</SelectItem>
                        <SelectItem value="2">الربع الثاني (أبريل - يونيو)</SelectItem>
                        <SelectItem value="3">الربع الثالث (يوليو - سبتمبر)</SelectItem>
                        <SelectItem value="4">الربع الرابع (أكتوبر - ديسمبر)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl flex gap-3 text-blue-700 text-sm">
                  <Info className="w-5 h-5 flex-shrink-0" />
                  <p>سيقوم النظام بتجميع كافة الفواتير، المصروفات، والإيرادات المسجلة ضمن هذه الفترة تلقائياً وحساب المبالغ الضريبية المستحقة.</p>
                </div>

                <Button 
                  onClick={handleCollectData} 
                  disabled={collecting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg"
                >
                  {collecting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 ml-2" />
                      تجميع البيانات وحساب الضريبة
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm border-r-4 border-r-emerald-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-emerald-700 flex items-center gap-2 text-base">
                      <TrendingUp className="w-4 h-4" />
                      المخرجات (المبيعات والإيرادات)
                    </CardTitle>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-100">ضريبة مستحقة</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-end border-b border-dashed border-gray-100 pb-2">
                    <span className="text-gray-500 text-sm">إجمالي المبيعات الخاضعة</span>
                    <span className="font-bold">{declarationData.total_sales_taxable.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-gray-500 text-sm">إجمالي ضريبة المخرجات</span>
                    <span className="text-2xl font-black text-emerald-600">{declarationData.total_output_tax.toLocaleString()} ر.س</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm border-r-4 border-r-rose-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-rose-700 flex items-center gap-2 text-base">
                      <TrendingDown className="w-4 h-4" />
                      المدخلات (المشتريات والمصروفات)
                    </CardTitle>
                    <Badge variant="outline" className="text-rose-600 border-rose-100">ضريبة مستردة</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-end border-b border-dashed border-gray-100 pb-2">
                    <span className="text-gray-500 text-sm">إجمالي المشتريات الخاضعة</span>
                    <span className="font-bold">{declarationData.total_purchases_taxable.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-gray-500 text-sm">إجمالي ضريبة المدخلات</span>
                    <span className="text-2xl font-black text-rose-600">{declarationData.total_input_tax.toLocaleString()} ر.س</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-indigo-900 text-white border-none shadow-lg overflow-hidden relative">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-indigo-200 text-sm font-medium mb-1">صافي الضريبة المستحقة للسداد</h3>
                    <p className="text-4xl font-black tracking-tight">
                      {declarationData.net_tax_payable.toLocaleString()} ر.س
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      تعديل الفترة
                    </Button>
                    <Button onClick={() => setStep(3)} className="bg-white text-indigo-900 hover:bg-indigo-50">
                      مراجعة التفاصيل والمتابعة
                      <ChevronRight className="w-4 h-4 mr-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b border-gray-50">
                <CardTitle>التأكيد النهائي والتقديم</CardTitle>
                <CardDescription>يرجى مراجعة البيانات قبل الحفظ أو التقديم النهائي</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider">تفاصيل الفترة</h4>
                    <div className="space-y-2">
                      <p className="flex justify-between"><span className="text-gray-500">السنة:</span> <span className="font-medium">{period.year}</span></p>
                      <p className="flex justify-between"><span className="text-gray-500">الربع السنوي:</span> <span className="font-medium">الربع {period.quarter}</span></p>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider">الملخص المالي</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">إجمالي المخرجات</p>
                        <p className="text-lg font-bold text-emerald-600">{declarationData.total_output_tax.toLocaleString()} ر.س</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">إجمالي المدخلات</p>
                        <p className="text-lg font-bold text-rose-600">{declarationData.total_input_tax.toLocaleString()} ر.س</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-2 border-amber-100 bg-amber-50/30 rounded-xl flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-bold">تنبيه قانوني</p>
                    <p className="opacity-80">بالنقر على "تقديم الإقرار"، فإنك تقر بصحة البيانات الواردة أعلاه ومطابقتها للسجلات المالية للشركة.</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-50">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12"
                    onClick={() => handleSave('draft')}
                    disabled={loading}
                  >
                    <Save className="w-4 h-4 ml-2 text-gray-400" />
                    حفظ كمسودة
                  </Button>
                  <Button 
                    className="flex-[2] h-12 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => handleSave('submitted')}
                    disabled={loading}
                  >
                    <Send className="w-4 h-4 ml-2" />
                    تقديم الإقرار الضريبي النهائي
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
