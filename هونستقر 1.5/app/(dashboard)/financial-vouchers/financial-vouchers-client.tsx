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
              className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-xl relative overflow-hidden"
            >
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-8 -left-8 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8 relative z-10">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-3">
                    <Link href="/dashboard" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                      <LayoutDashboard size={13} />
                      {isRtl ? 'لوحة التحكم' : 'Dashboard'}
                    </Link>
                    <ArrowRight size={13} className={`${isRtl ? 'rotate-180' : ''} text-slate-500`} />
                    <span className="text-blue-400">{isRtl ? 'السندات المالية' : 'Financial Vouchers'}</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-[1.25rem] bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 flex-shrink-0">
                      <FileText size={32} strokeWidth={2.5} className="text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">{t("title")}</h1>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold border border-violet-500/30">
                          <Sparkles size={12} className="animate-pulse" />
                          {t("managementCenter")}
                        </span>
                        <p className="text-slate-400 text-sm font-semibold">{t("description")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-black text-white/80">{companyInfo?.name || t("loading")}</span>
                  </div>
                  <button
                    onClick={() => fetchStats(companyId)}
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 transition-all font-black text-sm shadow-lg shadow-blue-500/25"
                  >
                    <RefreshCw size={18} className={cn(loading ? "animate-spin" : "")} />
                    {t("updateData")}
                  </button>
                </div>
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
            <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-xl overflow-hidden">

              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4 text-white">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xl border border-white/10">
                    <FileText size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">{t("voucherTemplates")}</h3>
                    <p className="text-white/60 text-xs font-bold">{voucherTypes.length} {isRtl ? 'نموذج متاح' : 'templates available'}</p>
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
                          <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-[1.75rem] border border-white/10 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                            <div className={`h-1 bg-gradient-to-r ${voucher.gradient} group-hover:h-1.5 transition-all`} />

                            <div className="p-6 flex flex-col flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div className={cn(
                                  "h-14 w-14 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300",
                                  voucher.iconBg,
                                  voucher.shadowColor
                                )}>
                                  <voucher.icon className="w-7 h-7 text-white" />
                                </div>
                                <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-white/10 group-hover:text-white/70 transition-all border border-white/10 ${isRtl ? "-scale-x-100" : ""}`}>
                                  <ArrowUpRight size={15} />
                                </div>
                              </div>

                              <h3 className="text-lg font-black text-white mb-1">{voucher.title}</h3>
                              <p className="text-xs font-bold text-white/40 mb-4 line-clamp-1">{voucher.description}</p>

                              <div className="rounded-xl p-4 mb-4 bg-white/5 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-white/40 font-bold text-[10px] uppercase tracking-widest">{voucher.stats.label}</span>
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
                                  <span className="text-sm font-bold text-white/40">{t("currency")}</span>
                                </div>
                              </div>

                              <div className="space-y-2 mb-4 flex-1">
                                {voucher.features.map((feature, fIndex) => (
                                  <div key={fIndex} className="flex items-center gap-2 text-xs text-white/50 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                    <span className="line-clamp-1">{feature}</span>
                                  </div>
                                ))}
                              </div>

                              <div className={cn(
                                "py-3 px-4 bg-gradient-to-r rounded-xl text-center group-hover:shadow-xl transition-all shadow-lg",
                                voucher.gradient,
                                voucher.shadowColor
                              )}>
                                <span className="text-white font-black text-xs flex items-center justify-center gap-2">
                                  {t("manageVoucher", { title: voucher.title })}
                                  <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isRtl ? "rotate-180" : ""}`} />
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
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                  <Bolt size={18} />
                </div>
                <h3 className="text-lg font-black text-white">{t("quickActions")}</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {voucherTypes.map((tool) => (
                  <Link key={tool.id} href={tool.href} className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-xl transition-all group cursor-pointer text-center">
                    <div className={cn(
                      "p-3 rounded-xl group-hover:scale-110 transition-transform shadow-md",
                      tool.iconBg,
                      tool.shadowColor
                    )}>
                      <tool.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-black text-white/70 text-xs tracking-tight group-hover:text-white transition-colors">{tool.title}</p>
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
