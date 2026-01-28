"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTranslations, useLocale } from "@/lib/locale-context";
import {
  FileText, Receipt, Wallet, ArrowRight, TrendingUp, TrendingDown,
  Sparkles, Building2, RefreshCw,
  ScrollText, FileCheck, ArrowUpRight, BarChart3, PlusCircle, DollarSign
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

function FinancialVouchersContent() {
  const t = useTranslations("financialVouchersPage");
  const { locale, isRTL: isRtl } = useLocale();

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

  const voucherTypes = useMemo(() => [
    {
      id: "sales-receipts",
      title: t("types.salesReceipts.title"),
      subtitle: t("types.salesReceipts.subtitle"),
      description: t("types.salesReceipts.description"),
      href: "/sales-receipts",
      icon: FileText,
      gradient: "from-blue-600 to-indigo-700",
      bgGradient: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-500",
      iconBg: "bg-blue-500",
      shadowColor: "shadow-blue-500/20",
      stats: { label: t("types.salesReceipts.label"), key: "salesReceipts" as const },
      features: [
        t("types.salesReceipts.features.0"),
        t("types.salesReceipts.features.1"),
        t("types.salesReceipts.features.2")
      ]
    },
    {
      id: "receipt-vouchers",
      title: t("types.receiptVouchers.title"),
      subtitle: t("types.receiptVouchers.subtitle"),
      description: t("types.receiptVouchers.description"),
      href: "/receipt-vouchers",
      icon: Receipt,
      gradient: "from-emerald-600 to-teal-700",
      bgGradient: "from-emerald-50 to-teal-50",
      borderColor: "border-emerald-500",
      iconBg: "bg-emerald-500",
      shadowColor: "shadow-emerald-500/20",
      stats: { label: t("types.receiptVouchers.label"), key: "receiptVouchers" as const },
      features: [
        t("types.receiptVouchers.features.0"),
        t("types.receiptVouchers.features.1"),
        t("types.receiptVouchers.features.2")
      ]
    },
    {
      id: "payment-vouchers",
      title: t("types.paymentVouchers.title"),
      subtitle: t("types.paymentVouchers.subtitle"),
      description: t("types.paymentVouchers.description"),
      href: "/payment-vouchers",
      icon: Wallet,
      gradient: "from-rose-600 to-orange-700",
      bgGradient: "from-rose-50 to-orange-50",
      borderColor: "border-rose-500",
      iconBg: "bg-rose-500",
      shadowColor: "shadow-rose-500/20",
      stats: { label: t("types.paymentVouchers.label"), key: "paymentVouchers" as const },
      features: [
        t("types.paymentVouchers.features.0"),
        t("types.paymentVouchers.features.1"),
        t("types.paymentVouchers.features.2")
      ]
    },
    {
      id: "promissory-notes",
      title: t("types.promissoryNotes.title"),
      subtitle: t("types.promissoryNotes.subtitle"),
      description: t("types.promissoryNotes.description"),
      href: "/promissory-notes",
      icon: ScrollText,
      gradient: "from-amber-600 to-orange-700",
      bgGradient: "from-amber-50 to-orange-50",
      borderColor: "border-amber-500",
      iconBg: "bg-amber-500",
      shadowColor: "shadow-amber-500/20",
      stats: { label: t("types.promissoryNotes.label"), key: "promissoryNotes" as const },
      features: [
        t("types.promissoryNotes.features.0"),
        t("types.promissoryNotes.features.1"),
        t("types.promissoryNotes.features.2")
      ]
    },
    {
      id: "quotations",
      title: t("types.quotations.title"),
      subtitle: t("types.quotations.subtitle"),
      description: t("types.quotations.description"),
      href: "/quotations",
      icon: FileCheck,
      gradient: "from-purple-600 to-violet-700",
      bgGradient: "from-purple-50 to-violet-50",
      borderColor: "border-purple-500",
      iconBg: "bg-purple-500",
      shadowColor: "shadow-purple-500/20",
      stats: { label: t("types.quotations.label"), key: "quotations" as const },
      features: [
        t("types.quotations.features.0"),
        t("types.quotations.features.1"),
        t("types.quotations.features.2")
      ]
    },
    {
      id: "income-vouchers",
      title: t("types.incomeVouchers.title"),
      subtitle: t("types.incomeVouchers.subtitle"),
      description: t("types.incomeVouchers.description"),
      href: "/income/new",
      icon: PlusCircle,
      gradient: "from-cyan-600 to-sky-700",
      bgGradient: "from-cyan-50 to-sky-50",
      borderColor: "border-cyan-500",
      iconBg: "bg-cyan-500",
      shadowColor: "shadow-cyan-500/20",
      stats: { label: t("types.incomeVouchers.label"), key: "incomeVouchers" as const },
      features: [
        t("types.incomeVouchers.features.0"),
        t("types.incomeVouchers.features.1"),
        t("types.incomeVouchers.features.2")
      ]
    }
  ], [t]);

  const totalIncome = stats.salesReceipts.total + stats.receiptVouchers.total + stats.incomeVouchers.total;
  const totalExpense = stats.paymentVouchers.total;
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="max-w-[95%] mx-auto p-4 md:p-8 space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Unified Card Container */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-10 text-white shadow-2xl border border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 via-rose-500 via-amber-500 via-purple-500 to-blue-500 animate-gradient-x" />
        
        <div className="relative z-10 space-y-10">
          {/* Hero Header Section */}
          <div className={`flex flex-col lg:flex-row items-center justify-between gap-10 ${isRtl ? "lg:text-right" : "lg:text-left"}`}>
            <div className={`text-center space-y-4 ${isRtl ? "lg:text-right" : "lg:text-left"}`}>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 mb-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-blue-200 font-black text-[10px] uppercase tracking-widest">{t("managementCenter")}</span>
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
                {t("description")}
              </p>
              
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">

                <div className="flex items-center gap-3 px-6 py-3 bg-blue-500/20 backdrop-blur-md rounded-2xl border border-blue-500/30 text-blue-200 font-black text-sm shadow-xl">
                  <Building2 size={18} className="text-blue-400" />
                  {companyInfo?.name || t("loading")}
                </div>
                <button 
                  onClick={() => fetchStats(companyId)}
                  className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white font-black text-sm hover:bg-white/20 transition-all shadow-xl active:scale-95"
                >
                  <RefreshCw size={18} className={cn("text-blue-400", loading ? "animate-spin" : "")} />
                  {t("updateData")}
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
              <motion.div 
                initial={{ opacity: 0, x: isRtl ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl min-w-[200px] group hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-emerald-300 font-black text-xs uppercase tracking-wider">{t("totalIncome")}</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{totalIncome.toLocaleString()}</p>
                <p className="text-emerald-400/60 text-[10px] font-black mt-1">{t("sar")}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: isRtl ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl min-w-[200px] group hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400 group-hover:scale-110 transition-transform">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <span className="text-rose-300 font-black text-xs uppercase tracking-wider">{t("expenses")}</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{totalExpense.toLocaleString()}</p>
                <p className="text-rose-400/60 text-[10px] font-black mt-1">{t("sar")}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: isRtl ? 30 : -30 }}
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
                  )}>{t("netBalance")}</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{netBalance.toLocaleString()}</p>
                <p className={cn(
                  "text-[10px] font-black mt-1",
                  netBalance >= 0 ? "text-blue-400/60" : "text-amber-400/60"
                )}>{t("sar")}</p>
              </motion.div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Voucher Cards Grid Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-xl">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-black text-white">{t("voucherTemplates")}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {voucherTypes.map((voucher, index) => {
                const statData = stats[voucher.stats.key];
                return (
                  <motion.div
                    key={voucher.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group"
                  >
                    <Link href={voucher.href}>
                      <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/10 hover:bg-white/15 hover:shadow-2xl transition-all duration-300">
                        <div className={`h-1 bg-gradient-to-r ${voucher.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />
                        
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className={cn(
                              "p-3 rounded-xl shadow-xl transform group-hover:scale-110 transition-transform duration-300",
                              voucher.iconBg
                            )}>
                              <voucher.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 group-hover:bg-white/20 group-hover:text-white transition-all ${isRtl ? "-scale-x-100" : ""}`}>
                              <ArrowUpRight size={16} />
                            </div>

                          </div>

                          <h3 className="text-lg font-black text-white mb-1">{voucher.title}</h3>
                          <p className="text-slate-400 text-xs font-medium mb-4 line-clamp-1">{voucher.description}</p>

                          <div className="rounded-xl p-4 mb-4 bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{voucher.stats.label}</span>
                              <span className={cn(
                                "px-3 py-1 text-white text-[10px] font-black rounded-full shadow-lg",
                                voucher.iconBg
                              )}>
                                {t("voucherCount", { count: statData.count })}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <p className="text-2xl font-black text-white tracking-tight">
                                {statData.total.toLocaleString()}
                              </p>
                              <span className="text-sm font-bold text-slate-500">{t("currency")}</span>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            {voucher.features.map((feature, fIndex) => (
                              <div key={fIndex} className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="line-clamp-1">{feature}</span>
                              </div>
                            ))}
                          </div>

                          <div className={cn(
                            "py-3 px-4 bg-gradient-to-r rounded-xl text-center group-hover:shadow-xl transition-all shadow-lg active:scale-95",
                            voucher.gradient,
                            voucher.shadowColor
                          )}>
                            <span className="text-white font-black text-xs flex items-center justify-center gap-2">
                              {t("manageVoucher", { title: voucher.title })}
                                <ArrowRight className={`w-4 h-4 transform group-hover:translate-x-1 transition-transform ${isRtl ? "rotate-180" : ""}`} />

                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Quick Actions Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-xl">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{t("quickActions")}</h3>
                <p className="text-slate-400 text-sm font-medium">{t("quickActionsDesc")}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {voucherTypes.map((tool) => (
                <Link key={tool.id} href={tool.href} className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all group cursor-pointer text-center active:scale-95">
                  <div className={cn(
                    "p-3 rounded-xl group-hover:scale-110 transition-transform shadow-md",
                    tool.iconBg
                  )}>
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-bold text-white text-xs tracking-tight">{tool.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Footer */}
      <div className={`flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4 opacity-70 ${isRtl ? "text-right" : "text-left"}`}>
        <div className="flex items-center gap-2">
          <Sparkles size={10} className="text-indigo-500" />
          <span>{t("systemTitle", { name: companyInfo?.name || "Logistics" })}</span>
        </div>
        <span>{t("allRightsReserved", { year: new Date().getFullYear() })}</span>
      </div>
    </div>
  );
}

export function FinancialVouchersClient() {
  const t = useTranslations("financialVouchersPage");
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">{t("loading")}</div>}>
      <FinancialVouchersContent />
    </Suspense>
  );
}
