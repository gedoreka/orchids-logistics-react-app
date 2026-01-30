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
    Info,
    Calendar,
    CheckCircle2
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
    <div className="min-h-screen bg-[#f8fafc] pb-12" dir="rtl">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200/60 pb-12 pt-8 px-6 mb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">إنشاء إقرار ضريبي جديد</h1>
              <p className="text-gray-500 font-medium mt-1">اتباع الخطوات الذكية لإعداد الإقرار الضريبي الربع سنوي بدقة</p>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => router.back()} 
              className="gap-2 text-gray-500 hover:text-gray-900 font-bold"
            >
              <ChevronLeft className="w-5 h-5" />
              رجوع للرئيسية
            </Button>
          </div>

          {/* Stepper */}
          <div className="relative flex items-center justify-between max-w-3xl mx-auto px-4">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 -z-0" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 transition-all duration-500 -z-0" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
            
            {[1, 2, 3].map((s) => (
              <div key={s} className="relative z-10 flex flex-col items-center gap-3">
                <motion.div 
                  initial={false}
                  animate={{ 
                    scale: step >= s ? 1.1 : 1,
                    backgroundColor: step > s ? '#4f46e5' : step === s ? '#ffffff' : '#f3f4f6',
                    borderColor: step >= s ? '#4f46e5' : '#e5e7eb',
                    color: step > s ? '#ffffff' : step === s ? '#4f46e5' : '#9ca3af'
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-4 font-black text-lg shadow-sm`}
                >
                  {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                </motion.div>
                <span className={`text-sm font-black uppercase tracking-wider ${step >= s ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {s === 1 ? "الفترة" : s === 2 ? "المراجعة" : "التأكيد"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
                <CardHeader className="p-8 border-b border-gray-50">
                  <div className="flex items-center gap-3 mb-1">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    <CardTitle className="text-xl font-black">تحديد الفترة الضريبية</CardTitle>
                  </div>
                  <CardDescription className="text-gray-500 font-medium">اختر السنة والربع السنوي المراد إصدار الإقرار له لمباشرة التجميع الذكي</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-black text-gray-700 uppercase tracking-wider">السنة المالية</label>
                      <Select value={period.year} onValueChange={(v) => setPeriod({...period, year: v})}>
                        <SelectTrigger className="h-14 bg-gray-50 border-gray-100 font-black text-lg focus:ring-indigo-500/20">
                          <SelectValue placeholder="اختر السنة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2026">2026</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-black text-gray-700 uppercase tracking-wider">الربع السنوي</label>
                      <Select value={period.quarter} onValueChange={(v) => setPeriod({...period, quarter: v})}>
                        <SelectTrigger className="h-14 bg-gray-50 border-gray-100 font-black text-lg focus:ring-indigo-500/20">
                          <SelectValue placeholder="اختر الربع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1" className="font-bold">الربع الأول (يناير - مارس)</SelectItem>
                          <SelectItem value="2" className="font-bold">الربع الثاني (أبريل - يونيو)</SelectItem>
                          <SelectItem value="3" className="font-bold">الربع الثالث (يوليو - سبتمبر)</SelectItem>
                          <SelectItem value="4" className="font-bold">الربع الرابع (أكتوبر - ديسمبر)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50/50 rounded-2xl flex gap-4 border border-blue-100/50">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600 h-fit">
                      <Info className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-blue-900">ملاحظة هامة</p>
                      <p className="text-blue-700/80 font-medium leading-relaxed">سيقوم النظام بتجميع كافة الفواتير، المصروفات، والإيرادات المسجلة ضمن هذه الفترة تلقائياً وحساب المبالغ الضريبية المستحقة بدقة متناهية.</p>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCollectData} 
                    disabled={collecting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-16 text-xl font-black shadow-lg shadow-indigo-100 transition-all active:scale-95"
                  >
                    {collecting ? (
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        جاري معالجة البيانات الضريبية...
                      </div>
                    ) : (
                      <>
                        <Calculator className="w-6 h-6 ml-3" />
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />
                  <CardHeader className="pb-4 p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                          <TrendingUp className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-gray-900 font-black">المخرجات</CardTitle>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-black px-3 py-1 uppercase tracking-wider text-[10px]">ضريبة مستحقة</Badge>
                    </div>
                    <CardDescription className="mr-11 font-medium text-gray-500 italic mt-1">(المبيعات والإيرادات)</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-6">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <span className="text-gray-500 font-bold uppercase tracking-tight text-xs">إجمالي المبيعات الخاضعة</span>
                      <span className="font-black text-gray-900 text-lg">{declarationData.total_sales_taxable.toLocaleString()} <span className="text-xs text-gray-400 font-bold mr-1">ر.س</span></span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mr-1 mb-2">إجمالي ضريبة المخرجات</p>
                      <div className="text-4xl font-black text-emerald-600 tracking-tighter">
                        {declarationData.total_output_tax.toLocaleString()} 
                        <span className="text-lg font-bold text-emerald-600/50 mr-2 uppercase">ر.س</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
                  <CardHeader className="pb-4 p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                          <TrendingDown className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-gray-900 font-black">المدخلات</CardTitle>
                      </div>
                      <Badge className="bg-rose-50 text-rose-600 border-none font-black px-3 py-1 uppercase tracking-wider text-[10px]">ضريبة مستردة</Badge>
                    </div>
                    <CardDescription className="mr-11 font-medium text-gray-500 italic mt-1">(المشتريات والمصروفات)</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-6">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <span className="text-gray-500 font-bold uppercase tracking-tight text-xs">إجمالي المشتريات الخاضعة</span>
                      <span className="font-black text-gray-900 text-lg">{declarationData.total_purchases_taxable.toLocaleString()} <span className="text-xs text-gray-400 font-bold mr-1">ر.س</span></span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mr-1 mb-2">إجمالي ضريبة المدخلات</p>
                      <div className="text-4xl font-black text-rose-600 tracking-tighter">
                        {declarationData.total_input_tax.toLocaleString()} 
                        <span className="text-lg font-bold text-rose-600/50 mr-2 uppercase">ر.س</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-indigo-950 text-white border-none shadow-[0_20px_50px_rgba(79,70,229,0.2)] overflow-hidden relative py-4">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute left-0 bottom-0 w-48 h-48 bg-indigo-400/5 rounded-full -ml-24 -mb-24 blur-2xl" />
                <CardContent className="p-10 relative z-10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="text-center md:text-right">
                      <h3 className="text-indigo-300 text-sm font-black uppercase tracking-widest mb-3">صافي الضريبة المستحقة للسداد</h3>
                      <div className="flex items-baseline gap-3 justify-center md:justify-start">
                        <span className="text-6xl font-black tracking-tighter tabular-nums">
                          {declarationData.net_tax_payable.toLocaleString()}
                        </span>
                        <span className="text-2xl font-bold text-indigo-400 uppercase">ر.س</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                      <Button 
                        variant="outline" 
                        onClick={() => setStep(1)} 
                        className="h-14 bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold px-8 text-lg"
                      >
                        تعديل الفترة
                      </Button>
                      <Button 
                        onClick={() => setStep(3)} 
                        className="h-14 bg-white text-indigo-950 hover:bg-gray-100 font-black px-10 text-lg shadow-xl"
                      >
                        مراجعة التفاصيل والمتابعة
                        <ChevronRight className="w-6 h-6 mr-2" />
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
                <CardHeader className="p-8 border-b border-gray-50">
                  <div className="flex items-center gap-3 mb-1">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    <CardTitle className="text-xl font-black">التأكيد النهائي والتقديم</CardTitle>
                  </div>
                  <CardDescription className="text-gray-500 font-medium">يرجى مراجعة كافة المبالغ الضريبية قبل الحفظ النهائي أو الإرسال</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-6">
                      <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">تفاصيل الفترة</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 font-bold">السنة المالية:</span> 
                          <span className="font-black text-gray-900 text-lg">{period.year}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 font-bold">الربع السنوي:</span> 
                          <Badge className="bg-indigo-50 text-indigo-700 font-black border-none text-base px-4 py-1">الربع {period.quarter}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-6">
                      <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">الملخص المالي النهائي</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-emerald-200 transition-colors">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">إجمالي ضريبة المخرجات (+)</p>
                          <p className="text-2xl font-black text-emerald-600 tabular-nums">{declarationData.total_output_tax.toLocaleString()} <span className="text-xs opacity-60">ر.س</span></p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-rose-200 transition-colors">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">إجمالي ضريبة المدخلات (-)</p>
                          <p className="text-2xl font-black text-rose-600 tabular-nums">{declarationData.total_input_tax.toLocaleString()} <span className="text-xs opacity-60">ر.س</span></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-amber-50 rounded-2xl flex gap-5 border border-amber-100">
                    <div className="p-3 bg-amber-100 rounded-xl text-amber-600 h-fit">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-amber-900 text-lg">إقرار بالصحة والمسؤولية</p>
                      <p className="text-amber-700/80 font-medium leading-relaxed">بالنقر على "تقديم الإقرار"، فإنك تقر بصفتك المخولة بصحة كافة البيانات المذكورة أعلاه ومطابقتها التامة للسجلات المالية والفواتير الضريبية الموثقة في النظام.</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 pt-6">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-16 border-gray-200 hover:bg-gray-50 font-bold text-lg text-gray-600"
                      onClick={() => handleSave('draft')}
                      disabled={loading}
                    >
                      <Save className="w-5 h-5 ml-2 opacity-40" />
                      حفظ كمسودة للمراجعة
                    </Button>
                    <Button 
                      className="flex-[2] h-16 bg-indigo-600 hover:bg-indigo-700 font-black text-xl shadow-lg shadow-indigo-100"
                      onClick={() => handleSave('submitted')}
                      disabled={loading}
                    >
                      {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 ml-3" />}
                      تقديم الإقرار الضريبي النهائي
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
