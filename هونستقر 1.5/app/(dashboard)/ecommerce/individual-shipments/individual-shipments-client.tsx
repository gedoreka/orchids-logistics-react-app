"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Truck,
  Package,
  Search,
  Plus,
  ArrowRight,
  MapPin,
  Phone,
  User,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Gift,
  FileText,
  Laptop,
  Box,
  Pill,
  PawPrint,
  Utensils,
  Shirt,
  Sparkles,
  Shield,
  Zap,
  Timer,
  Star,
  TrendingUp,
  Send,
  Navigation,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface IndividualShipmentsClientProps {
  companyId: number;
}

interface ShipmentCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ElementType;
  description: string;
  gradient: string;
  iconBg: string;
}

interface ShipmentStats {
  total: number;
  pending: number;
  inProgress: number;
  delivered: number;
}

const categories: ShipmentCategory[] = [
  { id: "gifts", name: "هدايا", nameEn: "Gifts", icon: Gift, description: "إرسال الهدايا بلمسة حب ورعاية خاصة", gradient: "from-pink-500 to-rose-500", iconBg: "from-pink-500 to-rose-600" },
  { id: "documents", name: "مستندات", nameEn: "Documents", icon: FileText, description: "توصيل مستنداتك بأمان وسرية تامة", gradient: "from-blue-500 to-indigo-500", iconBg: "from-blue-500 to-indigo-600" },
  { id: "electronics", name: "إلكترونيات", nameEn: "Electronics", icon: Laptop, description: "حماية أجهزتك الإلكترونية بكل دقة", gradient: "from-purple-500 to-violet-500", iconBg: "from-purple-500 to-violet-600" },
  { id: "parcels", name: "طرود", nameEn: "Parcels", icon: Box, description: "شحنات كبيرة أو صغيرة بأفضل الطرق", gradient: "from-amber-500 to-orange-500", iconBg: "from-amber-500 to-orange-600" },
  { id: "medicine", name: "أدوية", nameEn: "Medicine", icon: Pill, description: "توصيل المستلزمات الطبية بسرعة وأمان", gradient: "from-emerald-500 to-teal-500", iconBg: "from-emerald-500 to-teal-600" },
  { id: "pet-supplies", name: "مستلزمات حيوانات", nameEn: "Pet Supplies", icon: PawPrint, description: "رعاية أصدقائك الصغار بتوصيل احتياجاتهم", gradient: "from-cyan-500 to-sky-500", iconBg: "from-cyan-500 to-sky-600" },
  { id: "food", name: "أطعمة", nameEn: "Food", icon: Utensils, description: "توصيل طعامك طازجاً بأعلى معايير النظافة", gradient: "from-red-500 to-orange-500", iconBg: "from-red-500 to-orange-600" },
  { id: "clothes", name: "ملابس", nameEn: "Clothes", icon: Shirt, description: "توصيل مشترياتك من الملابس بعناية فائقة", gradient: "from-fuchsia-500 to-pink-500", iconBg: "from-fuchsia-500 to-pink-600" },
];

const features = [
  { icon: Shield, title: "أمان المنتج", description: "اهتمام تام بكل شحنة خلال النقل مع تغليف آمن", gradient: "from-emerald-500 to-green-600" },
  { icon: Zap, title: "توصيل سريع", description: "أسرع خدمة توصيل بأعلى جودة وأفضل الأسعار", gradient: "from-amber-500 to-orange-600" },
  { icon: Timer, title: "خدمة 24/7", description: "دعم فني متواصل على مدار الساعة طوال الأسبوع", gradient: "from-blue-500 to-indigo-600" },
];

export function IndividualShipmentsClient({ companyId }: IndividualShipmentsClientProps) {
  const [searchOrderNumber, setSearchOrderNumber] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ShipmentStats>({ total: 0, pending: 0, inProgress: 0, delivered: 0 });
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/ecommerce/shipments/stats?company_id=${companyId}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats || { total: 0, pending: 0, inProgress: 0, delivered: 0 });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [companyId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleTrackShipment = async () => {
    if (!searchOrderNumber && !searchPhone) {
      toast.error("يرجى إدخال رقم الطلب أو رقم الهاتف");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchOrderNumber) params.append("order_number", searchOrderNumber);
      if (searchPhone) params.append("phone", searchPhone);
      
      const response = await fetch(`/api/ecommerce/shipments/track?${params.toString()}`);
      const data = await response.json();
      
      if (data.success && data.shipment) {
        toast.success("تم العثور على الشحنة!");
      } else {
        toast.error("لم يتم العثور على الشحنة");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء البحث");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-[#2c3e50] to-[#3498db] rounded-3xl blur opacity-30" />
        <Card className="relative bg-gradient-to-r from-[#2c3e50] to-[#3498db] border-0 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          
          <CardContent className="relative p-8 md:p-12 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-4"
            >
              <Link href="/ecommerce" className="absolute top-6 right-6 p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                <ArrowRight className="w-5 h-5 text-white" />
              </Link>
              
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl animate-pulse" />
                <div className="relative p-6 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20">
                  <Truck className="w-12 h-12 text-white" />
                </div>
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </motion.div>
              </div>

              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
                  تتبع منتجاتك بكل سهولة
                </h1>
                <p className="text-white/70 text-lg max-w-2xl mx-auto">
                  يمكنك الآن تتبع شحنتك ومتابعة حالة التوصيل في أي وقت ومن أي مكان
                </p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative -mt-8 z-10"
      >
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-2xl mx-4 md:mx-12">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center justify-center gap-2">
                <Search className="w-5 h-5 text-blue-500" />
                تتبع شحنتك
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Package className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="أدخل رقم الطلب"
                  value={searchOrderNumber}
                  onChange={(e) => setSearchOrderNumber(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl h-14 pe-12 text-lg"
                />
              </div>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="أدخل رقم الهاتف"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl h-14 pe-12 text-lg"
                />
              </div>
              <Button
                onClick={handleTrackShipment}
                disabled={loading}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 me-2 animate-spin" />
                ) : (
                  <Navigation className="w-5 h-5 me-2" />
                )}
                تتبع
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { icon: Package, label: "إجمالي الشحنات", value: stats.total, color: "purple", gradient: "from-purple-500 to-purple-600" },
          { icon: Clock, label: "قيد الانتظار", value: stats.pending, color: "amber", gradient: "from-amber-500 to-amber-600" },
          { icon: Truck, label: "قيد التوصيل", value: stats.inProgress, color: "blue", gradient: "from-blue-500 to-blue-600" },
          { icon: CheckCircle2, label: "تم التسليم", value: stats.delivered, color: "emerald", gradient: "from-emerald-500 to-emerald-600" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05 }}
          >
            <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-800 dark:text-white">{stat.value}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Categories Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-2 flex items-center justify-center gap-3">
            <Box className="w-8 h-8 text-amber-500" />
            نحن نوصل كل شيء
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#2c3e50] to-[#3498db] mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              onHoverStart={() => setHoveredCategory(category.id)}
              onHoverEnd={() => setHoveredCategory(null)}
            >
              <Link href={`/ecommerce/individual-shipments/create?type=${encodeURIComponent(category.name)}`}>
                <Card className={`
                  relative h-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 
                  shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden
                  ${hoveredCategory === category.id ? 'scale-[1.02] border-l-4' : ''}
                `}
                style={{ borderLeftColor: hoveredCategory === category.id ? 'rgb(59, 130, 246)' : undefined }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="relative mb-4"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} rounded-full blur-lg opacity-50 group-hover:opacity-70 transition-opacity`} />
                      <div className={`relative p-4 bg-gradient-to-br ${category.iconBg} rounded-full shadow-xl border border-white/20`}>
                        <category.icon className="w-7 h-7 text-white" />
                      </div>
                    </motion.div>
                    
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-slate-400 mb-2">{category.nameEn}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Link href="/ecommerce/individual-shipments/create">
          <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-full px-8 h-14 text-lg font-bold shadow-xl hover:shadow-2xl transition-all">
            <Plus className="w-6 h-6 me-2" />
            إنشاء شحنة جديدة
          </Button>
        </Link>
        <Link href="/ecommerce/individual-shipments/track">
          <Button variant="outline" className="bg-white dark:bg-slate-800 border-2 border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full px-8 h-14 text-lg font-bold">
            <Target className="w-6 h-6 me-2" />
            تتبع شحناتي
          </Button>
        </Link>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-2 flex items-center justify-center gap-3">
            <Star className="w-8 h-8 text-amber-500" />
            مميزات خدمتنا
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + index * 0.1 }}
            >
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all h-full">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    className="relative mb-6"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-full blur-xl opacity-50`} />
                    <div className={`relative p-5 bg-gradient-to-br ${feature.gradient} rounded-full shadow-2xl border border-white/20`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-r from-[#2c3e50] to-[#3498db] border-0 shadow-2xl overflow-hidden">
          <CardContent className="p-8 md:p-12 text-center relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                هل لديك شحنة تريد إرسالها؟
              </h3>
              <p className="text-white/70 text-lg mb-6 max-w-2xl mx-auto">
                ابدأ الآن واستمتع بخدمة توصيل سريعة وآمنة لجميع أنواع الشحنات
              </p>
              <Link href="/ecommerce/individual-shipments/create">
                <Button className="bg-white text-[#2c3e50] hover:bg-white/90 rounded-full px-10 h-14 text-lg font-bold shadow-xl hover:shadow-2xl transition-all">
                  <Send className="w-6 h-6 me-2" />
                  أرسل شحنتك الآن
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
