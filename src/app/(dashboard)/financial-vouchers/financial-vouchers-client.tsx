"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText, Receipt, Wallet, ArrowRight, TrendingUp, TrendingDown,
  Sparkles, AlertTriangle, CheckCircle, Clock, DollarSign, 
  ArrowUpRight, BarChart3, PieChart, Building2, Calendar, RefreshCw
} from "lucide-react";

interface Stats {
  salesReceipts: { count: number; total: number };
  receiptVouchers: { count: number; total: number };
  paymentVouchers: { count: number; total: number };
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
  }
];

function FinancialVouchersContent() {
  const [stats, setStats] = useState<Stats>({
    salesReceipts: { count: 0, total: 0 },
    receiptVouchers: { count: 0, total: 0 },
    paymentVouchers: { count: 0, total: 0 }
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
      const [salesRes, receiptRes, paymentRes] = await Promise.all([
        fetch(`/api/sales-receipts?company_id=${cId}`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`/api/receipt-vouchers/metadata?company_id=${cId}`).then(r => r.json()).catch(() => ({ vouchers: [] })),
        fetch(`/api/payment-vouchers/metadata?company_id=${cId}`).then(r => r.json()).catch(() => ({ vouchers: [] }))
      ]);

      const salesData = salesRes.data || [];
      const receiptData = receiptRes.vouchers || [];
      const paymentData = paymentRes.vouchers || [];

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

  const totalIncome = stats.salesReceipts.total + stats.receiptVouchers.total;
  const totalExpense = stats.paymentVouchers.total;
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="max-w-[1800px] mx-auto p-4 md:p-6 space-y-8" dir="rtl">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-10 md:p-14 shadow-2xl"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-rose-500" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-indigo-500/5 to-transparent rounded-full" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-right">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center gap-3 px-5 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-6"
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-white/80 font-bold text-sm">مركز إدارة السندات المالية</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
                السندات المالية
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl">
                إدارة شاملة لجميع السندات المالية من مبيعات ومقبوضات ومصروفات في مكان واحد
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
                <span className="flex items-center gap-2 px-5 py-3 bg-blue-500/20 backdrop-blur-sm rounded-2xl border border-blue-500/30 text-blue-300 font-bold">
                  <Building2 size={18} />
                  {companyInfo?.name || "جاري التحميل..."}
                </span>
                <span className="flex items-center gap-2 px-5 py-3 bg-emerald-500/20 backdrop-blur-sm rounded-2xl border border-emerald-500/30 text-emerald-300 font-bold">
                  <Calendar size={18} />
                  {new Date().toLocaleDateString("en-GB", { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </span>
                <button 
                    onClick={() => fetchStats(companyId)}
                    className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-white font-bold hover:bg-white/20 transition-colors"
                  >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                  تحديث
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full lg:w-auto">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur-md rounded-3xl p-6 border border-emerald-500/30"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-500/30 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-emerald-300 font-bold text-sm">الإيرادات</span>
                </div>
                <p className="text-3xl font-black text-white">{totalIncome.toLocaleString()}</p>
                <p className="text-emerald-400 text-xs font-bold mt-1">ريال سعودي</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-rose-500/20 to-orange-600/20 backdrop-blur-md rounded-3xl p-6 border border-rose-500/30"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-rose-500/30 rounded-xl">
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                  </div>
                  <span className="text-rose-300 font-bold text-sm">المصروفات</span>
                </div>
                <p className="text-3xl font-black text-white">{totalExpense.toLocaleString()}</p>
                <p className="text-rose-400 text-xs font-bold mt-1">ريال سعودي</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className={`bg-gradient-to-br ${netBalance >= 0 ? 'from-blue-500/20 to-indigo-600/20 border-blue-500/30' : 'from-amber-500/20 to-orange-600/20 border-amber-500/30'} backdrop-blur-md rounded-3xl p-6 border`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 ${netBalance >= 0 ? 'bg-blue-500/30' : 'bg-amber-500/30'} rounded-xl`}>
                    <DollarSign className={`w-5 h-5 ${netBalance >= 0 ? 'text-blue-400' : 'text-amber-400'}`} />
                  </div>
                  <span className={`${netBalance >= 0 ? 'text-blue-300' : 'text-amber-300'} font-bold text-sm`}>الرصيد الصافي</span>
                </div>
                <p className="text-3xl font-black text-white">{netBalance.toLocaleString()}</p>
                <p className={`${netBalance >= 0 ? 'text-blue-400' : 'text-amber-400'} text-xs font-bold mt-1`}>ريال سعودي</p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Alert Banner */}
      {stats.paymentVouchers.count > stats.receiptVouchers.count && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="p-3 bg-amber-100 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h4 className="text-amber-800 font-black">تنبيه: المصروفات أكثر من المقبوضات!</h4>
            <p className="text-amber-600 text-sm font-medium">يُنصح بمراجعة سندات الصرف والتحقق من التوازن المالي</p>
          </div>
        </motion.div>
      )}

      {/* Voucher Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {voucherTypes.map((voucher, index) => {
          const statData = stats[voucher.stats.key];
          return (
            <motion.div
              key={voucher.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Link href={voucher.href}>
                <div className={`relative overflow-hidden bg-white rounded-[30px] shadow-xl ${voucher.shadowColor} hover:shadow-2xl transition-all duration-500 border-2 border-slate-100 hover:${voucher.borderColor}`}>
                  {/* Top Gradient Bar */}
                  <div className={`h-2 bg-gradient-to-r ${voucher.gradient}`} />
                  
                  {/* Content */}
                  <div className="p-8">
                    {/* Icon & Title */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-4 ${voucher.iconBg} rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                        <voucher.icon className="w-8 h-8 text-white" />
                      </div>
                      <ArrowUpRight className="w-6 h-6 text-slate-300 group-hover:text-slate-600 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 mb-2">{voucher.title}</h3>
                    <p className="text-slate-500 font-bold text-sm mb-1">{voucher.subtitle}</p>
                    <p className="text-slate-400 text-sm mb-6">{voucher.description}</p>

                    {/* Stats */}
                    <div className={`bg-gradient-to-r ${voucher.bgGradient} rounded-2xl p-5 mb-6`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-600 font-bold text-sm">{voucher.stats.label}</span>
                        <span className={`px-3 py-1 ${voucher.iconBg} text-white text-xs font-black rounded-full`}>
                          {statData.count} سند
                        </span>
                      </div>
                      <p className="text-3xl font-black text-slate-800">
                        {statData.total.toLocaleString()}
                        <span className="text-sm font-bold text-slate-500 mr-2">ر.س</span>
                      </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      {voucher.features.map((feature, fIndex) => (
                        <div key={fIndex} className="flex items-center gap-2 text-sm text-slate-500">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <div className={`mt-8 py-4 px-6 bg-gradient-to-r ${voucher.gradient} rounded-2xl text-center group-hover:shadow-lg transition-all`}>
                      <span className="text-white font-black flex items-center justify-center gap-2">
                        الدخول للإدارة
                        <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-[30px] p-8 border border-slate-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-200 rounded-2xl">
              <BarChart3 className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">إجراءات سريعة</h3>
              <p className="text-slate-500 text-sm font-medium">الوصول السريع لإنشاء السندات</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/sales-receipts/new">
            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-slate-100 hover:border-blue-300 hover:shadow-lg transition-all group cursor-pointer">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-500 transition-colors">
                <FileText className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-black text-slate-800">إضافة سند مبيعات</p>
                <p className="text-sm text-slate-400">تسجيل عملية بيع جديدة</p>
              </div>
            </div>
          </Link>

          <Link href="/receipt-vouchers">
            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-slate-100 hover:border-emerald-300 hover:shadow-lg transition-all group cursor-pointer">
              <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-500 transition-colors">
                <Receipt className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-black text-slate-800">إضافة سند قبض</p>
                <p className="text-sm text-slate-400">تسجيل مبلغ مستلم</p>
              </div>
            </div>
          </Link>

          <Link href="/payment-vouchers">
            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-slate-100 hover:border-rose-300 hover:shadow-lg transition-all group cursor-pointer">
              <div className="p-3 bg-rose-100 rounded-xl group-hover:bg-rose-500 transition-colors">
                <Wallet className="w-5 h-5 text-rose-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-black text-slate-800">إضافة سند صرف</p>
                <p className="text-sm text-slate-400">تسجيل مصروف جديد</p>
              </div>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-6">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-indigo-500" />
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
