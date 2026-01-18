"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText, Receipt, Wallet, ArrowRight, TrendingUp, TrendingDown,
  Sparkles, AlertTriangle, CheckCircle, Clock, DollarSign, 
  ArrowUpRight, BarChart3, PieChart, Building2, Calendar, RefreshCw,
  ScrollText, FileCheck, Calculator, PlusCircle
} from "lucide-react";

interface Stats {
  salesReceipts: { count: number; total: number };
  receiptVouchers: { count: number; total: number };
  paymentVouchers: { count: number; total: number };
  promissoryNotes: { count: number; total: number };
  quotations: { count: number; total: number };
  incomeVouchers: { count: number; total: number };
}

interface CompanyInfo {
  name: string;
  logo_path?: string;
}

const voucherTypes = [
  {
    id: "sales-receipts",
    title: "سندات المبيعات",
    subtitle: "إدارة إيصالات وسندات المبيعات",
    description: "تسجيل ومتابعة جميع عمليات البيع والإيرادات",
    href: "/sales-receipts",
    icon: FileText,
    gradient: "from-blue-600 to-indigo-700",
    bgGradient: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-500",
    iconBg: "bg-blue-500",
    shadowColor: "shadow-blue-500/20",
    stats: { label: "إجمالي المبيعات", key: "salesReceipts" as const },
    features: ["تسجيل فواتير البيع", "متابعة الإيرادات", "تقارير المبيعات"]
  },
  {
    id: "receipt-vouchers",
    title: "سندات القبض",
    subtitle: "إدارة إيصالات الاستلام المالية",
    description: "تسجيل جميع المبالغ المستلمة والإيرادات النقدية",
    href: "/receipt-vouchers",
    icon: Receipt,
    gradient: "from-emerald-600 to-teal-700",
    bgGradient: "from-emerald-50 to-teal-50",
    borderColor: "border-emerald-500",
    iconBg: "bg-emerald-500",
    shadowColor: "shadow-emerald-500/20",
    stats: { label: "إجمالي المقبوضات", key: "receiptVouchers" as const },
    features: ["تسجيل المقبوضات", "متابعة التحصيل", "إيصالات الاستلام"]
  },
  {
    id: "payment-vouchers",
    title: "سندات الصرف",
    subtitle: "إدارة المدفوعات والمصروفات",
    description: "تسجيل جميع المصروفات والمدفوعات المالية",
    href: "/payment-vouchers",
    icon: Wallet,
    gradient: "from-rose-600 to-orange-700",
    bgGradient: "from-rose-50 to-orange-50",
    borderColor: "border-rose-500",
    iconBg: "bg-rose-500",
    shadowColor: "shadow-rose-500/20",
    stats: { label: "إجمالي المصروفات", key: "paymentVouchers" as const },
    features: ["تسجيل المصروفات", "متابعة الدفعات", "سندات الصرف"]
  },
  {
    id: "promissory-notes",
    title: "سندات لأمر",
    subtitle: "إدارة السندات الإذنية والقانونية",
    description: "إصدار وتتبع سندات لأمر إلكترونية معتمدة",
    href: "/promissory-notes",
    icon: ScrollText,
    gradient: "from-amber-600 to-orange-700",
    bgGradient: "from-amber-50 to-orange-50",
    borderColor: "border-amber-500",
    iconBg: "bg-amber-500",
    shadowColor: "shadow-amber-500/20",
    stats: { label: "إجمالي السندات", key: "promissoryNotes" as const },
    features: ["إصدار سندات لأمر", "تحويل المبالغ لنصوص", "طباعة بصمة وتوقيع"]
  },
  {
    id: "quotations",
    title: "عروض الأسعار",
    subtitle: "إدارة عروض الأسعار والتقديرات",
    description: "إنشاء ومتابعة عروض الأسعار المقدمة للعملاء",
    href: "/quotations",
    icon: FileCheck,
    gradient: "from-purple-600 to-violet-700",
    bgGradient: "from-purple-50 to-violet-50",
    borderColor: "border-purple-500",
    iconBg: "bg-purple-500",
    shadowColor: "shadow-purple-500/20",
    stats: { label: "إجمالي العروض", key: "quotations" as const },
    features: ["إنشاء عروض أسعار", "متابعة حالة العرض", "تحويل العرض لفاتورة"]
  },
  {
    id: "income-vouchers",
    title: "سندات الإيراد",
    subtitle: "تسجيل الإيرادات المتنوعة",
    description: "إدارة وتسجيل الإيرادات غير المباشرة والمتنوعة",
    href: "/income/new",
    icon: PlusCircle,
    gradient: "from-cyan-600 to-sky-700",
    bgGradient: "from-cyan-50 to-sky-50",
    borderColor: "border-cyan-500",
    iconBg: "bg-cyan-500",
    shadowColor: "shadow-cyan-500/20",
    stats: { label: "إجمالي الإيرادات", key: "incomeVouchers" as const },
    features: ["تسجيل إيرادات يدوية", "ربط مع مراكز التكلفة", "متابعة الدخل"]
  }
];

function FinancialVouchersContent() {
  const [stats, setStats] = useState<Stats>({
    salesReceipts: { count: 0, total: 0 },
    receiptVouchers: { count: 0, total: 0 },
    paymentVouchers: { count: 0, total: 0 },
    promissoryNotes: { count: 0, total: 0 },
    quotations: { count: 0, total: 0 },
    incomeVouchers: { count: 0, total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [companyId, setCompanyId] = useState<string>("");

  const fetchCompanyInfo = async () => {
    try {
      const res = await fetch(`/api/company-info`);
      const data = await res.json();
      if (data.company) {
        setCompanyInfo(data.company);
        setCompanyId(String(data.company_id || data.company.id));
        return String(data.company_id || data.company.id);
      }
      return "";
    } catch (error) {
      console.error("Error fetching company info:", error);
      return "";
    }
  };

  const fetchStats = async (cId: string) => {
    if (!cId) return;
    setLoading(true);
    try {
      const [salesRes, receiptRes, paymentRes, promissoryRes, quotationsRes, incomeRes] = await Promise.all([
        fetch(`/api/sales-receipts?company_id=${cId}`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`/api/receipt-vouchers/metadata?company_id=${cId}`).then(r => r.json()).catch(() => ({ vouchers: [] })),
        fetch(`/api/payment-vouchers/metadata?company_id=${cId}`).then(r => r.json()).catch(() => ({ vouchers: [] })),
        fetch(`/api/promissory-notes?company_id=${cId}`).then(r => r.json()).catch(() => ({ notes: [] })),
        fetch(`/api/quotations?company_id=${cId}`).then(r => r.json()).catch(() => ([])),
        fetch(`/api/income/metadata?company_id=${cId}`).then(r => r.json()).catch(() => ({ incomes: [] }))
      ]);

      const salesData = salesRes.data || [];
      const receiptData = receiptRes.vouchers || [];
      const paymentData = paymentRes.vouchers || [];
      const promissoryData = promissoryRes.notes || [];
      const quotationsData = Array.isArray(quotationsRes) ? quotationsRes : [];
      const incomeData = incomeRes.incomes || [];

      setStats({
        salesReceipts: {
          count: salesData.length,
          total: salesData.reduce((sum: number, item: any) => sum + (parseFloat(item.total_amount) || 0), 0)
        },
        receiptVouchers: {
          count: receiptData.length,
          total: receiptData.reduce((sum: number, item: any) => sum + (parseFloat(item.total_amount) || 0), 0)
        },
        paymentVouchers: {
          count: paymentData.length,
          total: paymentData.reduce((sum: number, item: any) => sum + (parseFloat(item.total_amount) || 0), 0)
        },
        promissoryNotes: {
          count: promissoryData.length,
          total: promissoryData.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0)
        },
        quotations: {
          count: quotationsData.length,
          total: quotationsData.reduce((sum: number, item: any) => sum + (parseFloat(item.total_amount) || 0), 0)
        },
        incomeVouchers: {
          count: incomeData.length,
          total: incomeData.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0)
        }
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const init = async () => {
      const cId = await fetchCompanyInfo();
      if (cId) {
        fetchStats(cId);
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

    const totalIncome = stats.salesReceipts.total + stats.receiptVouchers.total + stats.incomeVouchers.total;
    const totalExpense = stats.paymentVouchers.total;
    const netBalance = totalIncome - totalExpense;

    return (
    return (
      <div className="max-w-[95%] mx-auto p-4 md:p-8 space-y-8" dir="rtl">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-10 text-white shadow-2xl border border-white/10"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 via-rose-500 via-amber-500 via-purple-500 to-blue-500 animate-gradient-x" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="text-center lg:text-right space-y-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 mb-2"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <span className="text-blue-200 font-black text-[10px] uppercase tracking-widest">مركز إدارة السندات المالية</span>
                </motion.div>
                
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  السندات المالية
                </h1>
                <p className="text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
                  إدارة شاملة للمبيعات والمقبوضات والمصروفات والسندات القانونية باحترافية عالية
                </p>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
                  <div className="flex items-center gap-3 px-6 py-3 bg-blue-500/20 backdrop-blur-md rounded-2xl border border-blue-500/30 text-blue-200 font-black text-sm shadow-xl">
                    <Building2 size={18} className="text-blue-400" />
                    {companyInfo?.name || "جاري التحميل..."}
                  </div>
                  <button 
                      onClick={() => fetchStats(companyId)}
                      className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white font-black text-sm hover:bg-white/20 transition-all shadow-xl active:scale-95"
                    >
                    <RefreshCw size={18} className={cn("text-blue-400", loading ? "animate-spin" : "")} />
                    تحديث البيانات
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl min-w-[200px] group hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="text-emerald-300 font-black text-xs uppercase tracking-wider">إجمالي الدخل</span>
                  </div>
                  <p className="text-3xl font-black text-white tracking-tight">{totalIncome.toLocaleString()}</p>
                  <p className="text-emerald-400/60 text-[10px] font-black mt-1">ريال سعودي</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl min-w-[200px] group hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400 group-hover:scale-110 transition-transform">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                    <span className="text-rose-300 font-black text-xs uppercase tracking-wider">المصروفات</span>
                  </div>
                  <p className="text-3xl font-black text-white tracking-tight">{totalExpense.toLocaleString()}</p>
                  <p className="text-rose-400/60 text-[10px] font-black mt-1">ريال سعودي</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className={cn(
                    "backdrop-blur-xl rounded-[2rem] p-6 border shadow-2xl min-w-[200px] group transition-all",
                    netBalance >= 0 
                      ? "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20" 
                      : "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20"
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "p-2 rounded-lg group-hover:scale-110 transition-transform",
                      netBalance >= 0 ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"
                    )}>
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <span className={cn(
                      "font-black text-xs uppercase tracking-wider",
                      netBalance >= 0 ? "text-blue-300" : "text-amber-300"
                    )}>الرصيد الصافي</span>
                  </div>
                  <p className="text-3xl font-black text-white tracking-tight">{netBalance.toLocaleString()}</p>
                  <p className={cn(
                    "text-[10px] font-black mt-1",
                    netBalance >= 0 ? "text-blue-400/60" : "text-amber-400/60"
                  )}>ريال سعودي</p>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
        </motion.div>

        {/* Voucher Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {voucherTypes.map((voucher, index) => {
            const statData = stats[voucher.stats.key];
            return (
              <motion.div
                key={voucher.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Link href={voucher.href}>
                  <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300">
                    <div className={`h-1.5 bg-gradient-to-r ${voucher.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />
                    
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className={cn(
                          "p-4 rounded-[1.5rem] shadow-xl transform group-hover:scale-110 transition-transform duration-300",
                          voucher.iconBg
                        )}>
                          <voucher.icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <ArrowUpRight size={20} />
                        </div>
                      </div>

                      <h3 className="text-2xl font-black text-slate-900 mb-2">{voucher.title}</h3>
                      <p className="text-slate-500 text-xs font-bold mb-6 line-clamp-1">{voucher.description}</p>

                      <div className={cn(
                        "rounded-[1.5rem] p-5 mb-6 shadow-inner border border-white/50",
                        voucher.bgGradient
                      )}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{voucher.stats.label}</span>
                          <span className={cn(
                            "px-4 py-1.5 text-white text-[10px] font-black rounded-full shadow-lg",
                            voucher.iconBg
                          )}>
                            {statData.count} سند
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <p className="text-3xl font-black text-slate-900 tracking-tight">
                            {statData.total.toLocaleString()}
                          </p>
                          <span className="text-sm font-black text-slate-400">ر.س</span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-8">
                        {voucher.features.map((feature, fIndex) => (
                          <div key={fIndex} className="flex items-center gap-3 text-xs text-slate-600 font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="line-clamp-1">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className={cn(
                        "py-4 px-6 bg-gradient-to-r rounded-2xl text-center group-hover:shadow-xl transition-all shadow-lg active:scale-95",
                        voucher.gradient,
                        voucher.shadowColor
                      )}>
                        <span className="text-white font-black text-sm flex items-center justify-center gap-3">
                          إدارة {voucher.title}
                          <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/50 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-slate-100 rounded-2xl text-slate-600 border border-slate-200">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">إجراءات سريعة</h3>
              <p className="text-slate-500 text-sm font-bold">الوصول المباشر للعمليات الأكثر استخداماً</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {voucherTypes.map((tool) => (
              <Link key={tool.id} href={tool.href} className="flex flex-col items-center gap-4 p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-2xl transition-all group cursor-pointer text-center active:scale-95">
                <div className={cn(
                  "p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-md",
                  tool.iconBg
                )}>
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-black text-slate-800 text-xs tracking-tight">{tool.title}</p>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4 opacity-70">
          <div className="flex items-center gap-2">
            <Sparkles size={10} className="text-indigo-500" />
            <span>نظام {companyInfo?.name || "Logistics"} - إدارة السندات المالية</span>
          </div>
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
        </div>
      </div>
    );
  }

export function FinancialVouchersClient() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
      <FinancialVouchersContent />
    </Suspense>
  );
}
