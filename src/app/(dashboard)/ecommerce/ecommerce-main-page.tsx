"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShoppingCart,
  Store,
  Truck,
  Package,
  Calendar,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Users,
  DollarSign,
  ChevronRight,
  Zap,
  Globe,
  ShoppingBag,
  ClipboardList,
  Building2,
  MapPin,
  Settings,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EcommerceMainPageProps {
  companyId: number;
}

interface Section {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
  bgGradient: string;
  iconBg: string;
  stats?: { label: string; value: string }[];
  features: string[];
}

const sections: Section[] = [
  {
    id: "ecommerce-orders",
    title: "قسم التجارة الإلكترونية",
    titleEn: "E-Commerce Section",
    description: "إدارة شاملة لجميع طلبات التجارة الإلكترونية مع متابعة دقيقة للحالات والإحصائيات",
    icon: ShoppingCart,
    href: "/ecommerce/orders",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    bgGradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    iconBg: "from-emerald-500 to-teal-600",
    features: ["متابعة الطلبات", "إحصائيات شاملة", "تقارير مفصلة", "إدارة الحالات"],
  },
  {
    id: "today-orders",
    title: "عرض الطلبات اليومية",
    titleEn: "Daily Orders View",
    description: "سجل شامل لإدخال وعرض الطلبات اليومية مع إمكانية الإضافة والتعديل والربط مع المتاجر والسائقين",
    icon: Calendar,
    href: "/ecommerce/today",
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
    bgGradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
    iconBg: "from-blue-500 to-indigo-600",
    features: ["إضافة طلبات", "تعديل البيانات", "تصدير Excel", "طباعة التقارير"],
  },
  {
    id: "stores",
    title: "إدارة المتاجر",
    titleEn: "Store Management",
    description: "إضافة وإدارة المتاجر الإلكترونية المتعاونة مع النظام",
    icon: Store,
    href: "/ecommerce/stores",
    gradient: "from-purple-500 via-fuchsia-500 to-pink-500",
    bgGradient: "from-purple-500/20 via-fuchsia-500/10 to-transparent",
    iconBg: "from-purple-500 to-fuchsia-600",
    features: ["إضافة متاجر", "بيانات الاتصال", "ربط الطلبات", "تقييم المتاجر"],
  },
  {
    id: "personal-shipments",
    title: "الشحنات الشخصية",
    titleEn: "Personal Shipments",
    description: "إدارة شحنات الأفراد من المرسل إلى المستلم مع تتبع كامل",
    icon: Truck,
    href: "/ecommerce/shipments",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    bgGradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    iconBg: "from-amber-500 to-orange-600",
    features: ["إنشاء شحنات", "تتبع الحالة", "حساب التكلفة", "إدارة الكباتن"],
  },
  {
    id: "manage-shipments",
    title: "إدارة الشحنات",
    titleEn: "Shipment Management",
    description: "لوحة تحكم شاملة لإدارة جميع الشحنات وتحديث حالاتها",
    icon: Package,
    href: "/ecommerce/manage",
    gradient: "from-rose-500 via-pink-500 to-purple-500",
    bgGradient: "from-rose-500/20 via-pink-500/10 to-transparent",
    iconBg: "from-rose-500 to-pink-600",
    features: ["تحديث الحالات", "تأكيد الدفع", "طباعة الفواتير", "إحصائيات الشحن"],
  },
];

export function EcommerceMainPage({ companyId }: EcommerceMainPageProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl blur-2xl opacity-20" />
        <Card className="relative bg-[#0d121f]/90 backdrop-blur-2xl border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <CardContent className="relative p-8 md:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
                    <div className="relative p-5 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl shadow-2xl shadow-emerald-500/30 border border-white/20">
                      <ShoppingCart className="w-10 h-10 text-white" />
                    </div>
                    <motion.div
                      className="absolute -top-2 -right-2"
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </motion.div>
                  </motion.div>
                  <div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
                      قسم التجارة الإلكترونية
                    </h1>
                    <p className="text-emerald-400/80 font-medium text-sm md:text-base mt-1">
                      E-Commerce Management System
                    </p>
                  </div>
                </div>
                <p className="text-white/50 text-base md:text-lg max-w-2xl leading-relaxed">
                  منظومة متكاملة لإدارة كامل دورة حياة الطلبات والشحنات، من استلام الطلب وحتى التوصيل النهائي
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShoppingBag, label: "الطلبات", value: "---", color: "emerald" },
                  { icon: Store, label: "المتاجر", value: "---", color: "purple" },
                  { icon: Truck, label: "الشحنات", value: "---", color: "amber" },
                  { icon: Users, label: "الكباتن", value: "---", color: "blue" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-${stat.color}-500/20 to-transparent backdrop-blur-xl border border-${stat.color}-500/20 p-4`}
                  >
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-600`} />
                    <stat.icon className={`w-5 h-5 text-${stat.color}-400 mb-2`} />
                    <p className={`text-2xl font-black text-${stat.color}-300`}>{stat.value}</p>
                    <p className={`text-[10px] font-bold text-${stat.color}-300/50 uppercase tracking-wider`}>{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onHoverStart={() => setHoveredSection(section.id)}
            onHoverEnd={() => setHoveredSection(null)}
          >
            <Link href={section.href}>
              <Card className={`
                relative h-full bg-[#0d121f]/80 backdrop-blur-xl border-white/5 overflow-hidden
                transition-all duration-500 cursor-pointer group
                hover:border-white/20 hover:shadow-2xl hover:shadow-${section.gradient.split('-')[1]}-500/20
                ${hoveredSection === section.id ? 'scale-[1.02]' : ''}
              `}>
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${section.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Animated Border */}
                <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
                  <div className={`absolute inset-[-1px] bg-gradient-to-r ${section.gradient} rounded-xl`} style={{ padding: '1px' }}>
                    <div className="absolute inset-0 bg-[#0d121f] rounded-xl" />
                  </div>
                </div>

                {/* Glow Effect */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${section.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />

                <CardContent className="relative p-6 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="relative"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${section.gradient} rounded-2xl blur-lg opacity-50`} />
                      <div className={`relative p-4 bg-gradient-to-br ${section.iconBg} rounded-2xl shadow-xl border border-white/20`}>
                        <section.icon className="w-7 h-7 text-white" />
                      </div>
                    </motion.div>
                    <motion.div
                      animate={{ x: hoveredSection === section.id ? 0 : 10, opacity: hoveredSection === section.id ? 1 : 0 }}
                      className="p-2 rounded-full bg-white/10 backdrop-blur-xl"
                    >
                      <ArrowLeft className="w-4 h-4 text-white" />
                    </motion.div>
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-white/80 transition-all">
                      {section.title}
                    </h3>
                    <p className="text-xs text-white/30 font-medium mb-3">{section.titleEn}</p>
                    <p className="text-white/50 text-sm leading-relaxed">
                      {section.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <div className="flex flex-wrap gap-2">
                      {section.features.map((feature, i) => (
                        <span
                          key={i}
                          className={`
                            px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                            bg-white/5 text-white/40 border border-white/5
                            group-hover:bg-gradient-to-r group-hover:${section.gradient} group-hover:text-white group-hover:border-transparent
                            transition-all duration-300
                          `}
                          style={{ transitionDelay: `${i * 50}ms` }}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <motion.div
                    className="mt-4 flex items-center gap-2 text-white/30 group-hover:text-white/70 transition-colors"
                    animate={{ x: hoveredSection === section.id ? 5 : 0 }}
                  >
                    <span className="text-xs font-bold">الدخول للقسم</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Bottom Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8"
      >
        <Card className="bg-[#0d121f]/60 backdrop-blur-xl border-white/5 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20">
                  <Zap className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold">نصيحة سريعة</h4>
                  <p className="text-white/40 text-sm">اختر القسم المناسب لبدء إدارة عملياتك التجارية</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white/30 text-sm">
                <Globe className="w-4 h-4" />
                <span>جميع الأقسام مترابطة ومتكاملة</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
