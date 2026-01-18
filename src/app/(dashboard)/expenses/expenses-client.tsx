"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Wallet, 
  HandCoins, 
  FileText, 
  PieChart, 
  PlusCircle, 
  History, 
  ArrowLeftRight,
  ChartBar,
  Building2,
  Calendar,
  DollarSign
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ExpensesClientProps {
  companyId: number;
  companyInfo: {
    name: string;
    logo_path: string | null;
  };
  stats: {
    expenses: number;
    deductions: number;
    payrolls: number;
    total: number;
  };
  recentActivity: any[];
}

export function ExpensesClient({ companyId, companyInfo, stats, recentActivity }: ExpensesClientProps) {
  const [currentMonth] = useState(new Date().toISOString().slice(0, 7));
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

    return (
        <div className="min-h-screen p-4 md:p-6 font-tajawal rtl w-full overflow-x-hidden" dir="rtl">
          <motion.div 
            className="w-full space-y-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
          {/* Header Section */}
          <motion.div 
            className="relative overflow-hidden rounded-[2.5rem] p-10 bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] text-white shadow-2xl border border-white/10"
            variants={itemVariants}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 via-rose-500 via-amber-500 via-purple-500 to-blue-500 animate-gradient-x" />
            
            <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-8">
              <div className="flex items-center gap-6">
                {companyInfo.logo_path ? (
                  <div className="w-20 h-20 rounded-full bg-white p-1 shadow-2xl">
                    <img 
                      src={companyInfo.logo_path} 
                      alt="Logo" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl border-4 border-white/20">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                )}
                <div className="text-right space-y-2">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">مركز المنصرفات الشهرية</h1>
                  <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10 shadow-xl inline-block">
                    <p className="text-xl font-bold text-blue-200">{companyInfo.name || "اسم الشركة"}</p>
                  </div>
                </div>
              </div>

              {/* Premium Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full pt-4">

              {[
                { 
                  label: "إجمالي المنصرفات", 
                  value: stats.expenses, 
                  icon: Wallet, 
                  color: "from-blue-500 to-blue-700",
                  shadow: "shadow-blue-500/20"
                },
                { 
                  label: "إجمالي الاستقطاعات", 
                  value: stats.deductions, 
                  icon: HandCoins, 
                  color: "from-rose-500 to-rose-700",
                  shadow: "shadow-rose-500/20"
                },
                { 
                  label: "إجمالي الرواتب", 
                  value: stats.payrolls, 
                  icon: FileText, 
                  color: "from-amber-500 to-amber-700",
                  shadow: "shadow-amber-500/20"
                },
                { 
                  label: "المجموع الكلي", 
                  value: stats.total, 
                  icon: PieChart, 
                  color: "from-purple-500 to-purple-700",
                  shadow: "shadow-purple-500/20"
                },
              ].map((stat, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-white/90 backdrop-blur-lg rounded-2xl p-4 text-slate-800 shadow-xl border border-white/50 relative overflow-hidden group`}
                >
                  <div className={`absolute top-0 right-0 w-1 h-full bg-gradient-to-b ${stat.color}`} />
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 tabular-nums">
                      {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(stat.value)}
                    </span>
                    <span className="text-xs font-medium text-slate-500">{stat.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "إضافة المنصرفات", sub: "اضغط هنا للإضافة", icon: Wallet, color: "bg-blue-600", link: "/expenses/new" },
            { title: "إضافة الاستقطاعات", sub: "اضغط هنا للإضافة", icon: HandCoins, color: "bg-rose-600", link: "/expenses/deductions" },
            { title: "تقرير المنصرفات", sub: "اضغط هنا للعرض", icon: ChartBar, color: "bg-emerald-600", link: "/expenses/report" },
            { title: "التحليلات", sub: "اضغط هنا للعرض", icon: PieChart, color: "bg-purple-600", link: "/expenses/analysis" },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
              onClick={() => router.push(card.link)}
            >
              <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                <CardContent className="p-6 text-center space-y-3">
                  <div className={`mx-auto w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{card.title}</h3>
                  <p className="text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">{card.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity & Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div className="lg:col-span-2 space-y-4" variants={itemVariants}>
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <History className="w-6 h-6 text-blue-400" />
                النشاط الأخير
              </h2>
              <Button variant="ghost" className="text-blue-400 font-bold hover:bg-white/10 h-8 text-sm">عرض الكل</Button>
            </div>
            
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((item, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                            <Wallet className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-slate-800 text-sm">{item.expense_type}</h4>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                              <span>{item.employee_name}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="font-bold text-blue-600">
                                {new Intl.NumberFormat('en-US').format(item.amount)} ريال
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <Badge variant="secondary" className="font-bold px-3 py-1 rounded-lg flex items-center gap-1 bg-slate-100 text-slate-600 border-none text-[10px]">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.expense_date).toLocaleDateString('en-US')}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <History className="w-8 h-8" />
                      </div>
                      <p className="text-slate-400 font-medium text-sm">لا توجد أنشطة حديثة حتى الآن</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h2 className="text-xl font-bold text-white flex items-center gap-3 px-2">
              <PlusCircle className="w-6 h-6 text-rose-400" />
              إجراءات سريعة
            </h2>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "إضافة منصرف", icon: PlusCircle, color: "text-blue-600", bg: "bg-blue-50", link: "/expenses/new" },
                { label: "إضافة استقطاع", icon: HandCoins, color: "text-rose-600", bg: "bg-rose-50", link: "/expenses/deductions" },
                { label: "تقرير المنصرفات", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50", link: "/expenses/report" },
                { label: "تقرير الاستقطاعات", icon: ChartBar, color: "text-amber-600", bg: "bg-amber-50", link: "/expenses/report?type=deductions" },
              ].map((action, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ x: -5 }}
                  className="flex items-center justify-between p-4 bg-white shadow-md hover:shadow-lg rounded-2xl transition-all group w-full text-right border border-slate-100"
                  onClick={() => router.push(action.link)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700 text-sm">{action.label}</span>
                  </div>
                  <ArrowLeftRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap');
        
        .font-tajawal {
          font-family: 'Tajawal', sans-serif;
        }

        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 3s ease infinite;
        }

        .rtl {
          direction: rtl;
        }
      `}</style>
    </div>
  );
}
