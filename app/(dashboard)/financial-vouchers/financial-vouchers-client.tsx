"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTranslations, useLocale } from "@/lib/locale-context";
import {
  FileText, Receipt, Wallet, ArrowRight, TrendingUp, TrendingDown,
  Sparkles, Building2, RefreshCw,
  ScrollText, FileCheck, ArrowUpRight, BarChart3, PlusCircle, DollarSign,
  AlertCircle, Loader2, LayoutDashboard, Bolt, ChevronRight
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
  const [fetchError, setFetchError] = useState(false);
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
    setFetchError(false);
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
      setFetchError(true);
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

    // Force black text on data-force-black elements in BOTH modes (overrides all CSS)
    useEffect(() => {
      const applyForceBlack = () => {
        const els = document.querySelectorAll('[data-force-black]');
        els.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.setProperty('color', '#000000', 'important');
          htmlEl.style.setProperty('-webkit-text-fill-color', '#000000', 'important');
          htmlEl.style.setProperty('background', 'none', 'important');
          htmlEl.style.setProperty('background-image', 'none', 'important');
          htmlEl.style.setProperty('-webkit-background-clip', 'unset', 'important');
          htmlEl.style.setProperty('background-clip', 'unset', 'important');
        });
      };
      applyForceBlack();
      const observer = new MutationObserver(applyForceBlack);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir={isRtl ? "rtl" : "ltr"}>
        <div className="text-center space-y-6 max-w-md mx-auto p-10">
          <div className="mx-auto w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-rose-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">{isRtl ? "خطأ في جلب البيانات" : "Error Fetching Data"}</h2>
            <p className="text-slate-400 font-medium">{isRtl ? "حدث خطأ أثناء الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى." : "An error occurred while connecting to the database. Please try again."}</p>
          </div>
          <button
            onClick={() => fetchStats(companyId)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95 shadow-2xl shadow-blue-500/40"
          >
            <RefreshCw size={20} />
            {isRtl ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

    return (
      <div id="fv-page" className="min-h-screen pb-20" dir={isRtl ? "rtl" : "ltr"}>
      <style dangerouslySetInnerHTML={{ __html: `
            #fv-page [data-force-black] {
              color: #000000 !important;
              -webkit-text-fill-color: #000000 !important;
              background: none !important;
              background-image: none !important;
              -webkit-background-clip: unset !important;
              background-clip: unset !important;
              font-weight: 900 !important;
            }
          `}} />
      <div className="w-full px-2 pt-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 rounded-[3rem] shadow-2xl border border-slate-500/30 overflow-hidden"
        >
          {/* Top Decorative Line */}
          <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 via-emerald-500 to-blue-500 animate-gradient-x" />

          <div className="p-8 md:p-12 space-y-12">
            {/* Header Section */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gradient-to-r from-violet-50/80 via-purple-50/50 to-indigo-50/80 dark:bg-white/10 dark:bg-none backdrop-blur-xl p-8 rounded-2xl dark:rounded-[2rem] border-2 border-violet-200/60 dark:border dark:border-white/10 shadow-sm dark:shadow-xl relative overflow-hidden"
            >
              {/* Decorative circles - light mode only */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full -translate-y-16 -translate-x-16 dark:hidden" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16 dark:hidden" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full translate-y-12 -translate-x-12 dark:hidden" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-amber-500/10 to-orange-500/10 rounded-full translate-y-12 translate-x-12 dark:hidden" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-300 mb-2">
                  <Link href="/dashboard" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                    <LayoutDashboard size={14} />
                    {isRtl ? 'لوحة التحكم' : 'Dashboard'}
                  </Link>
                  <ArrowRight size={14} className={`${isRtl ? 'rotate-180' : ''} text-slate-500`} />
                  <span className="text-blue-400">{isRtl ? 'السندات المالية' : 'Financial Vouchers'}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100/50 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-violet-200/60 dark:border-white/10 mb-3">
                  <Sparkles className="w-4 h-4 text-yellow-500 dark:text-yellow-400 animate-pulse" />
                    <span data-force-black className="text-black dark:text-black font-black text-[10px] uppercase tracking-widest">{t("managementCenter")}</span>
                </div>
                  <h1 data-no-gradient data-force-black className="text-3xl md:text-4xl font-black text-black dark:text-black">{t("title")}</h1>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-300 mt-2 max-w-2xl leading-relaxed">
                  {t("description")}
                </p>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-slate-100/80 dark:bg-white/5 border border-violet-200/60 dark:border-white/10 rounded-2xl backdrop-blur-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200">{companyInfo?.name || t("loading")}</span>
                </div>
                <button
                  onClick={() => fetchStats(companyId)}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all font-black text-sm shadow-2xl shadow-blue-500/40 active:scale-95"
                >
                  <RefreshCw size={18} className={cn(loading ? "animate-spin" : "")} />
                  {t("updateData")}
                </button>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  color: "from-emerald-500 to-teal-600",
                  icon: <TrendingUp size={24} />,
                  label: t("totalIncome"),
                  value: totalIncome.toLocaleString(),
                  subLabel: t("sar")
                },
                {
                  color: "from-rose-500 to-pink-600",
                  icon: <TrendingDown size={24} />,
                  label: t("expenses"),
                  value: totalExpense.toLocaleString(),
                  subLabel: t("sar")
                },
                {
                  color: netBalance >= 0 ? "from-blue-500 to-indigo-600" : "from-amber-500 to-orange-600",
                  icon: <DollarSign size={24} />,
                  label: t("netBalance"),
                  value: netBalance.toLocaleString(),
                  subLabel: t("sar")
                }
              ].map((stat, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${stat.color} p-6 shadow-2xl transition-all group cursor-pointer hover:-translate-y-1`}>
                    <div className="flex items-start justify-between relative z-10">
                      <div className="text-white/90 bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10">{stat.icon}</div>
                    </div>
                    <div className="mt-6 relative z-10">
                      <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                      <p className="text-4xl font-black text-white mt-2">{stat.value}</p>
                      <p className="text-white/50 text-[10px] font-black mt-1">{stat.subLabel}</p>
                    </div>
                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Voucher Cards Section */}
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-violet-50/80 via-purple-50/50 to-indigo-50/80 dark:bg-white/95 dark:bg-none backdrop-blur-xl rounded-2xl dark:rounded-[2.5rem] border-2 border-violet-200/60 dark:border dark:border-white/50 shadow-sm dark:shadow-2xl overflow-hidden relative">
              {/* Decorative circles - light mode only */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full -translate-y-16 -translate-x-16 dark:hidden z-0" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16 dark:hidden z-0" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full translate-y-12 -translate-x-12 dark:hidden z-0" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-amber-500/10 to-orange-500/10 rounded-full translate-y-12 translate-x-12 dark:hidden z-0" />

              <div className="bg-gradient-to-r from-violet-100 via-purple-100 to-indigo-100 dark:from-white/10 dark:via-white/5 dark:to-white/10 dark:bg-none px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-violet-200/50 dark:bg-white/10 flex items-center justify-center border border-violet-300/50 dark:border-white/10">
                    <FileText className="text-violet-600 dark:text-white" size={24} />
                  </div>
                  <div>
                      <h3 data-force-black className="text-black dark:text-black text-lg font-black">{t("voucherTemplates")}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs font-bold">{voucherTypes.length} {isRtl ? 'نموذج متاح' : 'templates available'}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 relative z-10">
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
                          <div className="relative overflow-hidden bg-white/80 dark:bg-slate-50 backdrop-blur-xl rounded-3xl shadow-sm border border-violet-200/40 dark:border-slate-100 hover:border-violet-300 dark:hover:border-blue-200 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                            <div className={`h-1 bg-gradient-to-r ${voucher.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />

                            <div className="p-6 flex flex-col flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div className={cn(
                                  "h-16 w-16 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300",
                                  voucher.iconBg,
                                  voucher.shadowColor
                                )}>
                                  <voucher.icon className="w-7 h-7 text-white" />
                                </div>
                                <div className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-violet-100 group-hover:text-violet-600 transition-all ${isRtl ? "-scale-x-100" : ""}`}>
                                  <ArrowUpRight size={16} />
                                </div>
                              </div>

                              <h3 className="text-xl font-black text-slate-900 mb-1">{voucher.title}</h3>
                              <p className="text-xs font-bold text-slate-500 mb-4 line-clamp-1">{voucher.description}</p>

                              <div className="rounded-xl p-4 mb-4 bg-slate-50 dark:bg-slate-100/50 border border-slate-200/60">
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
                                  <p className="text-2xl font-black text-slate-900 tracking-tight">
                                    {statData.total.toLocaleString()}
                                  </p>
                                  <span className="text-sm font-bold text-slate-400">{t("currency")}</span>
                                </div>
                              </div>

                              <div className="space-y-2 mb-4 flex-1">
                                {voucher.features.map((feature, fIndex) => (
                                  <div key={fIndex} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
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
            </motion.div>

            {/* Quick Actions Section */}
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-violet-50/80 via-purple-50/50 to-indigo-50/80 dark:bg-white/95 dark:bg-none backdrop-blur-xl rounded-2xl dark:rounded-[2.5rem] border-2 border-violet-200/60 dark:border dark:border-white/50 p-5 dark:p-8 shadow-sm dark:shadow-2xl relative overflow-hidden">
              {/* Decorative circles - light mode only */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full -translate-y-16 -translate-x-16 dark:hidden" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16 dark:hidden" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full translate-y-12 -translate-x-12 dark:hidden" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-amber-500/10 to-orange-500/10 rounded-full translate-y-12 translate-x-12 dark:hidden" />

              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="h-10 w-10 rounded-2xl bg-orange-100 dark:bg-white/10 flex items-center justify-center shadow-lg shadow-orange-500/10">
                  <Bolt className="text-orange-600 dark:text-white" size={20} />
                </div>
                <div>
                    <h3 data-force-black className="text-xl font-black text-black dark:text-black">{t("quickActions")}</h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("quickActionsDesc")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
                {voucherTypes.map((tool) => (
                  <Link key={tool.id} href={tool.href} className="flex flex-col items-center justify-center gap-3 p-5 rounded-3xl bg-slate-50 dark:bg-white/80 border border-slate-100 dark:border-slate-200 hover:bg-white hover:border-slate-200 hover:shadow-2xl transition-all group cursor-pointer text-center active:scale-95">
                    <div className={cn(
                      "p-3 rounded-xl group-hover:scale-110 transition-transform shadow-md",
                      tool.iconBg,
                      tool.shadowColor
                    )}>
                      <tool.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-black text-slate-600 dark:text-slate-700 text-xs tracking-tight">{tool.title}</p>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Footer Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-black text-slate-400 uppercase tracking-widest pt-8 border-t border-white/10">
              <div className="flex items-center gap-3">
                <Sparkles size={14} className="text-blue-400" />
                <span>{isRtl ? 'نظام السندات المالية - Logistics Systems Pro' : 'Financial Vouchers - Logistics Systems Pro'}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-white/5 px-3 py-1 rounded-lg">{t("allRightsReserved", { year: new Date().getFullYear() })}</span>
              </div>
            </div>
          </div>
        </motion.div>
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
