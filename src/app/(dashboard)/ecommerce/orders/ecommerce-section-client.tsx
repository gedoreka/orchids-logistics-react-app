"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  Store,
  Truck,
  Package,
  Calendar,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  Users,
  MapPin,
  Phone,
  FileText,
  Download,
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Building2,
  Info,
  ChevronDown,
  List,
  CalendarDays,
  Sparkles,
  ArrowLeft,
  CreditCard,
  Banknote,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EcommerceSectionClientProps {
  companyId: number;
}

interface Order {
  id: string;
  order_number: string;
  store: string;
  recipient_name: string;
  phone: string;
  address: string;
  captain: string;
  order_value: number;
  payment_method: string;
  status: string;
  payment_status: string;
  notes: string;
  order_date: string;
  created_at: string;
}

interface StoreType {
  id: string;
  store_name: string;
  phone_number: string;
  notes: string;
  status: string;
  created_at: string;
}

interface Stats {
  orders: {
    total: number;
    totalValue: number;
    today: number;
    monthly: number;
    pending: number;
    confirmed: number;
    delivered: number;
  };
  shipments: {
    total: number;
    totalValue: number;
    pending: number;
    delivered: number;
  };
  stores: {
    total: number;
  };
  captains: {
    total: number;
    active: number;
  };
}

export function EcommerceSectionClient({ companyId }: EcommerceSectionClientProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showAllDays, setShowAllDays] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [daysToShow, setDaysToShow] = useState("15");

  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [orderRows, setOrderRows] = useState([{ recipient_name: "", phone: "", address: "", store: "", captain: "", order_value: "", payment_method: "نقدي", notes: "" }]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/ecommerce/stats?company_id=${companyId}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [companyId]);

  const fetchOrders = useCallback(async () => {
    try {
      let url = `/api/ecommerce/orders?company_id=${companyId}&month=${selectedMonth}`;
      if (selectedDay) {
        url += `&day=${selectedDay}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, [companyId, selectedMonth, selectedDay]);

  const fetchStores = useCallback(async () => {
    try {
      const response = await fetch(`/api/ecommerce/stores?company_id=${companyId}`);
      const data = await response.json();
      if (data.success) {
        setStores(data.stores || []);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  }, [companyId]);

  const fetchAllData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    await Promise.all([fetchStats(), fetchOrders(), fetchStores()]);
    setLoading(false);
    setRefreshing(false);
  }, [fetchStats, fetchOrders, fetchStores]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    fetchOrders();
  }, [selectedMonth, selectedDay, fetchOrders]);

  const handleAddOrderRow = () => {
    setOrderRows([...orderRows, { recipient_name: "", phone: "", address: "", store: "", captain: "", order_value: "", payment_method: "نقدي", notes: "" }]);
  };

  const handleRemoveOrderRow = (index: number) => {
    if (orderRows.length > 1) {
      setOrderRows(orderRows.filter((_, i) => i !== index));
    }
  };

  const handleOrderRowChange = (index: number, field: string, value: string) => {
    const newRows = [...orderRows];
    (newRows[index] as any)[field] = value;
    setOrderRows(newRows);
  };

  const handleSaveOrders = async () => {
    const validOrders = orderRows.filter(row => row.recipient_name && row.phone);
    if (validOrders.length === 0) {
      toast.error("يرجى إدخال بيانات طلب واحد على الأقل");
      return;
    }

    try {
      const response = await fetch("/api/ecommerce/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          orders: validOrders.map(order => ({
            ...order,
            order_date: selectedDay ? `${selectedMonth}-${String(selectedDay).padStart(2, "0")}` : new Date().toISOString().split("T")[0]
          }))
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("تم حفظ الطلبات بنجاح");
        setIsOrderDialogOpen(false);
        setOrderRows([{ recipient_name: "", phone: "", address: "", store: "", captain: "", order_value: "", payment_method: "نقدي", notes: "" }]);
        fetchAllData(true);
      } else {
        toast.error(data.error || "فشل في حفظ الطلبات");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
    try {
      const response = await fetch(`/api/ecommerce/orders/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        toast.success("تم حذف الطلب");
        fetchAllData(true);
      }
    } catch (error) {
      toast.error("فشل في حذف الطلب");
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/ecommerce/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("تم تحديث الحالة");
        fetchAllData(true);
      }
    } catch (error) {
      toast.error("فشل في تحديث الحالة");
    }
  };

  const getDaysInMonth = (month: string) => {
    const [year, m] = month.split("-").map(Number);
    return new Date(year, m, 0).getDate();
  };

  const formatNumber = (num: number) => new Intl.NumberFormat(\'en-US\').format(num);
  const formatDate = (date: string) => new Date(date).toLocaleDateString(\'en-US\');
  const formatMonthYear = (month: string) => {
    const date = new Date(month + "-01");
    return date.toLocaleDateString(\'en-US\', { month: "long", year: "numeric" });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; icon: any } } = {
      "جديد": { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Clock },
      "قيد الانتظار": { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock },
      "مؤكد": { color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", icon: CheckCircle2 },
      "خرج للتوصيل": { color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: Truck },
      "تم التوصيل": { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
      "ملغي": { color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig["جديد"];
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} font-bold border`}>
        <Icon className="w-3 h-3 me-1" />
        {status}
      </Badge>
    );
  };

  const daysArray = Array.from({ length: getDaysInMonth(selectedMonth) }, (_, i) => i + 1);
  const visibleDays = showAllDays ? daysArray : daysArray.slice(0, parseInt(daysToShow));

  const totalOrdersValue = orders.reduce((sum, order) => sum + (parseFloat(String(order.order_value)) || 0), 0);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
            <ShoppingCart className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-bold text-lg">جاري تحميل نظام التجارة الإلكترونية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-[#2c3e50] to-[#3498db] rounded-3xl blur opacity-30" />
        <Card className="relative bg-gradient-to-r from-[#2c3e50] to-[#3498db] border-0 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <CardContent className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">نظام إدارة الطلبات - التجارة الإلكترونية</h1>
                  <p className="text-white/70 text-sm mt-1">إدارة شاملة لجميع طلبات التجارة الإلكترونية</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-bold">
                  <Calendar className="w-4 h-4 me-2" />
                  {selectedMonth}
                </Badge>
                <Button
                  onClick={() => fetchAllData(true)}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { icon: ShoppingBag, label: "إجمالي الطلبات", value: stats?.orders.total || 0, color: "emerald", gradient: "from-emerald-500 to-emerald-600" },
          { icon: DollarSign, label: "إجمالي القيمة", value: `${formatNumber(stats?.orders.totalValue || 0)} ر.س`, color: "blue", gradient: "from-blue-500 to-blue-600" },
          { icon: Store, label: "عدد المتاجر", value: stats?.stores.total || 0, color: "purple", gradient: "from-purple-500 to-purple-600" },
          { icon: Truck, label: "الكباتن النشطين", value: stats?.captains.active || 0, color: "amber", gradient: "from-amber-500 to-amber-600" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-500/20`}>
                    <stat.icon className={`w-7 h-7 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  <div>
                    <p className={`text-2xl md:text-3xl font-black text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.value}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Info Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-cyan-200 dark:border-cyan-700/50">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-500/20 rounded-xl">
                <Info className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-cyan-800 dark:text-cyan-300 font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  معلومات مهمة
                </h4>
                <ul className="mt-2 space-y-1 text-cyan-700 dark:text-cyan-400/80 text-sm">
                  <li className="flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> يمكنك اختيار الشهر المطلوب وعرض جميع الطلبات الخاصة به</li>
                  <li className="flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> يمكنك استخدام الفلترة لعرض طلبات فترة محددة</li>
                  <li className="flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> انقر على أي يوم لعرض التفاصيل الكاملة لطلبات ذلك اليوم</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Month Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg">
          <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
            <CardTitle className="text-slate-800 dark:text-white text-lg font-bold flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-500" />
              عرض الطلبات حسب الشهر
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">اختر الشهر المطلوب:</Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => { setSelectedMonth(e.target.value); setSelectedDay(null); }}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12 text-slate-800 dark:text-white"
                />
              </div>
              <Button
                onClick={() => fetchOrders()}
                className="bg-gradient-to-r from-[#2c3e50] to-[#3498db] hover:from-[#34495e] hover:to-[#2980b9] text-white rounded-xl h-12 px-8 font-bold shadow-lg"
              >
                <Eye className="w-5 h-5 me-2" />
                عرض الطلبات
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Date Range Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg">
          <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
            <CardTitle className="text-slate-800 dark:text-white text-lg font-bold flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-500" />
              فلترة حسب فترة محددة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">تاريخ البداية:</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-11"
                />
              </div>
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">تاريخ النهاية:</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-11"
                />
              </div>
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">خيارات العرض:</Label>
                <Select value={daysToShow} onValueChange={setDaysToShow}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">عرض 15 يوم</SelectItem>
                    <SelectItem value="30">عرض 30 يوم</SelectItem>
                    <SelectItem value="60">عرض 60 يوم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl h-11 font-bold shadow-lg">
                <Filter className="w-4 h-4 me-2" />
                تطبيق
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create New Order Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex justify-center"
      >
        <Button
          onClick={() => setIsOrderDialogOpen(true)}
          className="bg-gradient-to-r from-[#2c3e50] to-[#3498db] hover:from-[#34495e] hover:to-[#2980b9] text-white rounded-full h-14 px-10 font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
        >
          <Plus className="w-6 h-6 me-3" />
          إنشاء طلب جديد
        </Button>
      </motion.div>

      {/* Days Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg">
          <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
            <CardTitle className="text-slate-800 dark:text-white text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              الأيام المتاحة للشهر: {selectedMonth}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {visibleDays.map((day) => (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer transition-all border-2 ${
                      selectedDay === day
                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500"
                        : "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                    }`}
                    onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                  >
                    <CardContent className="p-4 text-center">
                      <p className="text-slate-800 dark:text-white font-bold text-lg">
                        {String(day).padStart(2, "0")}/{selectedMonth.split("-")[1]}/{selectedMonth.split("-")[0]}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full text-xs bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-lg"
                      >
                        <List className="w-3 h-3 me-1" />
                        التفاصيل
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {!showAllDays && daysArray.length > parseInt(daysToShow) && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => setShowAllDays(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full px-8 font-bold shadow-lg"
                >
                  <ChevronDown className="w-5 h-5 me-2" />
                  عرض المزيد
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
            <CardTitle className="text-slate-800 dark:text-white text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              تفاصيل الطلبات للشهر: {selectedMonth}
              {selectedDay && <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 ms-2">يوم {selectedDay}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#2c3e50] to-[#3498db]">
                    <TableHead className="text-white font-bold text-center">اسم المستلم</TableHead>
                    <TableHead className="text-white font-bold text-center">رقم الهاتف</TableHead>
                    <TableHead className="text-white font-bold text-center">العنوان</TableHead>
                    <TableHead className="text-white font-bold text-center">اسم المتجر</TableHead>
                    <TableHead className="text-white font-bold text-center">اسم الكابتن</TableHead>
                    <TableHead className="text-white font-bold text-center">قيمة الطلب</TableHead>
                    <TableHead className="text-white font-bold text-center">طريقة الدفع</TableHead>
                    <TableHead className="text-white font-bold text-center">الحالة</TableHead>
                    <TableHead className="text-white font-bold text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length > 0 ? orders.map((order, index) => (
                    <TableRow 
                      key={order.id} 
                      className={`${index % 2 === 0 ? "bg-slate-50 dark:bg-slate-900/30" : "bg-white dark:bg-slate-800/30"} hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors`}
                    >
                      <TableCell className="text-slate-800 dark:text-white font-medium text-center">{order.recipient_name}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 text-center font-mono">{order.phone}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 text-center max-w-[150px] truncate">{order.address || "---"}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 text-center">{order.store || "---"}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 text-center">{order.captain || "---"}</TableCell>
                      <TableCell className="text-emerald-600 dark:text-emerald-400 font-bold text-center">{formatNumber(order.order_value || 0)} ر.س</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${order.payment_method === "تحويل" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"}`}>
                          {order.payment_method === "تحويل" ? <CreditCard className="w-3 h-3 me-1" /> : <Banknote className="w-3 h-3 me-1" />}
                          {order.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(order.status || "جديد")}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Select onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}>
                            <SelectTrigger className="w-28 h-8 text-xs bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-lg">
                              <SelectValue placeholder="تغيير" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="جديد">جديد</SelectItem>
                              <SelectItem value="مؤكد">مؤكد</SelectItem>
                              <SelectItem value="خرج للتوصيل">خرج للتوصيل</SelectItem>
                              <SelectItem value="تم التوصيل">تم التوصيل</SelectItem>
                              <SelectItem value="ملغي">ملغي</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={() => handleDeleteOrder(order.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-16">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
                            <ShoppingCart className="w-12 h-12 text-slate-400" />
                          </div>
                          <div>
                            <h4 className="text-slate-700 dark:text-slate-300 font-bold text-lg">لا توجد طلبات</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">لم يتم تسجيل أي طلبات لهذا الشهر</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {orders.length > 0 && (
                    <TableRow className="bg-gradient-to-r from-amber-500 to-orange-500">
                      <TableCell colSpan={5} className="text-white font-black text-lg">الإجمالي</TableCell>
                      <TableCell className="text-white font-black text-lg text-center">{formatNumber(totalOrdersValue)} ر.س</TableCell>
                      <TableCell colSpan={3}></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Orders Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <DialogTitle className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">
                <Plus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              إضافة طلبات جديدة
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">أدخل بيانات الطلبات الجديدة</DialogDescription>
          </DialogHeader>
          <div className="p-4 space-y-4">
            {orderRows.map((row, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <Input
                  placeholder="اسم المستلم"
                  value={row.recipient_name}
                  onChange={(e) => handleOrderRowChange(index, "recipient_name", e.target.value)}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl"
                />
                <Input
                  placeholder="رقم الهاتف"
                  value={row.phone}
                  onChange={(e) => handleOrderRowChange(index, "phone", e.target.value)}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl"
                />
                <Input
                  placeholder="العنوان"
                  value={row.address}
                  onChange={(e) => handleOrderRowChange(index, "address", e.target.value)}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl"
                />
                <div className="flex gap-2">
                  <Select value={row.store} onValueChange={(value) => handleOrderRowChange(index, "store", value)}>
                    <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl flex-1">
                      <SelectValue placeholder="المتجر" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.store_name}>{store.store_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {orderRows.length > 1 && (
                    <Button
                      onClick={() => handleRemoveOrderRow(index)}
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="اسم الكابتن"
                  value={row.captain}
                  onChange={(e) => handleOrderRowChange(index, "captain", e.target.value)}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl"
                />
                <Input
                  type="number"
                  placeholder="قيمة الطلب"
                  value={row.order_value}
                  onChange={(e) => handleOrderRowChange(index, "order_value", e.target.value)}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl"
                />
                <Select value={row.payment_method} onValueChange={(value) => handleOrderRowChange(index, "payment_method", value)}>
                  <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl">
                    <SelectValue placeholder="طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نقدي">نقدي</SelectItem>
                    <SelectItem value="تحويل">تحويل</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="ملاحظات"
                  value={row.notes}
                  onChange={(e) => handleOrderRowChange(index, "notes", e.target.value)}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </motion.div>
            ))}
            <Button
              onClick={handleAddOrderRow}
              variant="outline"
              className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
            >
              <Plus className="w-4 h-4 me-2" />
              إضافة صف جديد
            </Button>
          </div>
          <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button variant="ghost" onClick={() => setIsOrderDialogOpen(false)} className="text-slate-500">
              إلغاء
            </Button>
            <Button onClick={handleSaveOrders} className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-xl px-8">
              <CheckCircle2 className="w-4 h-4 me-2" />
              حفظ الطلبات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
