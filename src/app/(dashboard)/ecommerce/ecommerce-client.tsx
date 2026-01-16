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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface EcommerceClientProps {
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

interface Store {
  id: string;
  store_name: string;
  phone_number: string;
  notes: string;
  status: string;
  created_at: string;
}

interface Shipment {
  id: string;
  order_number: string;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  shipment_type: string;
  distance_km: number;
  delivery_fee: number;
  additional_charge: number;
  tips: number;
  total_fee: number;
  payment_method: string;
  payment_status: string;
  status: string;
  notes: string;
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

export function EcommerceClient({ companyId }: EcommerceClientProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [isShipmentDialogOpen, setIsShipmentDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

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

  const fetchShipments = useCallback(async () => {
    try {
      const response = await fetch(`/api/ecommerce/shipments?company_id=${companyId}`);
      const data = await response.json();
      if (data.success) {
        setShipments(data.shipments || []);
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
    }
  }, [companyId]);

  const fetchAllData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    await Promise.all([fetchStats(), fetchOrders(), fetchStores(), fetchShipments()]);
    setLoading(false);
    setRefreshing(false);
  }, [fetchStats, fetchOrders, fetchStores, fetchShipments]);

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

  const handleSaveStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/ecommerce/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          store_name: formData.get("store_name"),
          phone_number: formData.get("phone_number"),
          notes: formData.get("notes")
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("تم إضافة المتجر بنجاح");
        setIsStoreDialogOpen(false);
        fetchStores();
        fetchStats();
      } else {
        toast.error(data.error || "فشل في إضافة المتجر");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  const handleSaveShipment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/ecommerce/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          sender_name: formData.get("sender_name"),
          sender_phone: formData.get("sender_phone"),
          sender_address: formData.get("sender_address"),
          receiver_name: formData.get("receiver_name"),
          receiver_phone: formData.get("receiver_phone"),
          receiver_address: formData.get("receiver_address"),
          shipment_type: formData.get("shipment_type"),
          distance_km: formData.get("distance_km"),
          delivery_fee: formData.get("delivery_fee"),
          additional_charge: formData.get("additional_charge"),
          tips: formData.get("tips"),
          payment_method: formData.get("payment_method"),
          notes: formData.get("notes")
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("تم إضافة الشحنة بنجاح");
        setIsShipmentDialogOpen(false);
        fetchShipments();
        fetchStats();
      } else {
        toast.error(data.error || "فشل في إضافة الشحنة");
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

  const handleDeleteStore = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المتجر؟")) return;
    try {
      const response = await fetch(`/api/ecommerce/stores/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        toast.success("تم حذف المتجر");
        fetchStores();
        fetchStats();
      }
    } catch (error) {
      toast.error("فشل في حذف المتجر");
    }
  };

  const handleDeleteShipment = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الشحنة؟")) return;
    try {
      const response = await fetch(`/api/ecommerce/shipments/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        toast.success("تم حذف الشحنة");
        fetchShipments();
        fetchStats();
      }
    } catch (error) {
      toast.error("فشل في حذف الشحنة");
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

  const handleUpdateShipmentStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/ecommerce/shipments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("تم تحديث الحالة");
        fetchShipments();
        fetchStats();
      }
    } catch (error) {
      toast.error("فشل في تحديث الحالة");
    }
  };

  const getDaysInMonth = (month: string) => {
    const [year, m] = month.split("-").map(Number);
    return new Date(year, m, 0).getDate();
  };

  const formatNumber = (num: number) => new Intl.NumberFormat("ar-SA").format(num);
  const formatDate = (date: string) => new Date(date).toLocaleDateString("ar-SA");

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
      <Badge className={`${config.color} font-bold`}>
        <Icon className="w-3 h-3 me-1" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
            <ShoppingCart className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 font-bold text-lg">جاري تحميل نظام التجارة الإلكترونية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
        <Card className="relative bg-[#0d121f]/80 backdrop-blur-xl border-white/5 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <ShoppingCart className="w-10 h-10 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">نظام التجارة الإلكترونية</h1>
                  <p className="text-white/50 font-medium">إدارة شاملة للطلبات والمتاجر والشحنات</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => fetchAllData(true)}
                  variant="outline"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl font-bold"
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-4 h-4 me-2 ${refreshing ? "animate-spin" : ""}`} />
                  تحديث
                </Button>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { icon: ShoppingBag, label: "إجمالي الطلبات", value: stats.orders.total, color: "emerald" },
                  { icon: DollarSign, label: "قيمة الطلبات", value: `${formatNumber(stats.orders.totalValue)} ر.س`, color: "blue" },
                  { icon: Store, label: "المتاجر", value: stats.stores.total, color: "purple" },
                  { icon: Truck, label: "الشحنات", value: stats.shipments.total, color: "amber" },
                ].map((stat, i) => (
                  <div key={i} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/10 backdrop-blur-xl border border-${stat.color}-500/20 p-4`}>
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-600`} />
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-${stat.color}-500/20 rounded-xl`}>
                        <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                      </div>
                      <div>
                        <p className={`text-xl md:text-2xl font-black text-${stat.color}-300`}>{stat.value}</p>
                        <p className={`text-[10px] md:text-xs font-medium text-${stat.color}-300/50`}>{stat.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#0d121f]/60 backdrop-blur-xl border border-white/5 p-1 rounded-2xl h-auto flex-wrap justify-start">
          {[
            { id: "dashboard", icon: TrendingUp, label: "لوحة التحكم" },
            { id: "orders", icon: ShoppingCart, label: "الطلبات" },
            { id: "stores", icon: Store, label: "المتاجر" },
            { id: "shipments", icon: Truck, label: "الشحنات الشخصية" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-xl px-4 md:px-6 py-2 md:py-3 font-bold transition-all text-sm"
            >
              <tab.icon className="w-4 h-4 me-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders Summary */}
            <Card className="bg-[#0d121f]/60 backdrop-blur-xl border-white/5">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-white text-xl font-black flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-400" />
                  ملخص الطلبات
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {stats && [
                    { label: "طلبات اليوم", value: stats.orders.today, color: "emerald" },
                    { label: "طلبات الشهر", value: stats.orders.monthly, color: "blue" },
                    { label: "قيد الانتظار", value: stats.orders.pending, color: "amber" },
                    { label: "تم التوصيل", value: stats.orders.delivered, color: "green" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 text-center">
                      <p className={`text-2xl font-black text-${item.color}-400`}>{item.value}</p>
                      <p className="text-white/40 text-sm font-bold">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipments Summary */}
            <Card className="bg-[#0d121f]/60 backdrop-blur-xl border-white/5">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-white text-xl font-black flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-400" />
                  ملخص الشحنات
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {stats && [
                    { label: "إجمالي الشحنات", value: stats.shipments.total, color: "purple" },
                    { label: "قيمة الشحنات", value: `${formatNumber(stats.shipments.totalValue)} ر.س`, color: "blue" },
                    { label: "قيد الانتظار", value: stats.shipments.pending, color: "amber" },
                    { label: "تم التوصيل", value: stats.shipments.delivered, color: "green" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 text-center">
                      <p className={`text-xl font-black text-${item.color}-400`}>{item.value}</p>
                      <p className="text-white/40 text-sm font-bold">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-[#0d121f]/60 backdrop-blur-xl border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-xl font-black">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => { setActiveTab("orders"); setIsOrderDialogOpen(true); }}
                  className="h-20 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg"
                >
                  <Plus className="w-6 h-6 me-3" />
                  إضافة طلب جديد
                </Button>
                <Button
                  onClick={() => { setActiveTab("stores"); setIsStoreDialogOpen(true); }}
                  className="h-20 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-lg"
                >
                  <Plus className="w-6 h-6 me-3" />
                  إضافة متجر جديد
                </Button>
                <Button
                  onClick={() => { setActiveTab("shipments"); setIsShipmentDialogOpen(true); }}
                  className="h-20 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg"
                >
                  <Plus className="w-6 h-6 me-3" />
                  إضافة شحنة جديدة
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6 outline-none">
          <Card className="bg-[#0d121f]/60 backdrop-blur-xl border-white/5">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 p-6 gap-4">
              <div>
                <CardTitle className="text-white text-xl font-black">إدارة الطلبات</CardTitle>
                <CardDescription className="text-white/40">عرض وإدارة جميع طلبات التجارة الإلكترونية</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => { setSelectedMonth(e.target.value); setSelectedDay(null); }}
                  className="bg-white/5 border-white/10 text-white rounded-xl w-40"
                />
                <Button
                  onClick={() => setIsOrderDialogOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
                >
                  <Plus className="w-4 h-4 me-2" />
                  طلب جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Days Grid */}
              <div className="mb-6">
                <Label className="text-white/60 font-bold text-sm mb-3 block">اختر اليوم:</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedDay === null ? "default" : "outline"}
                    onClick={() => setSelectedDay(null)}
                    className={`rounded-xl ${selectedDay === null ? "bg-emerald-600" : "bg-white/5 border-white/10 text-white/60"}`}
                  >
                    الكل
                  </Button>
                  {Array.from({ length: getDaysInMonth(selectedMonth) }, (_, i) => i + 1).map((day) => (
                    <Button
                      key={day}
                      variant={selectedDay === day ? "default" : "outline"}
                      onClick={() => setSelectedDay(day)}
                      className={`rounded-xl min-w-[50px] ${selectedDay === day ? "bg-emerald-600" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"}`}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-white/40 font-bold">رقم الطلب</TableHead>
                      <TableHead className="text-white/40 font-bold">المستلم</TableHead>
                      <TableHead className="text-white/40 font-bold">المتجر</TableHead>
                      <TableHead className="text-white/40 font-bold">القيمة</TableHead>
                      <TableHead className="text-white/40 font-bold">الحالة</TableHead>
                      <TableHead className="text-white/40 font-bold text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length > 0 ? orders.map((order) => (
                      <TableRow key={order.id} className="border-white/5 hover:bg-white/[0.02]">
                        <TableCell className="text-white font-mono">{order.order_number?.slice(-10) || order.id.slice(0, 8)}</TableCell>
                        <TableCell>
                          <div className="text-white font-bold">{order.recipient_name}</div>
                          <div className="text-white/40 text-xs">{order.phone}</div>
                        </TableCell>
                        <TableCell className="text-white/60">{order.store || "---"}</TableCell>
                        <TableCell className="text-emerald-400 font-bold">{formatNumber(order.order_value || 0)} ر.س</TableCell>
                        <TableCell>{getStatusBadge(order.status || "جديد")}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Select onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}>
                              <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white/60 rounded-lg h-8 text-xs">
                                <SelectValue placeholder="تغيير الحالة" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#0d121f] border-white/10">
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
                              className="text-red-400/50 hover:text-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <ShoppingCart className="w-12 h-12 text-white/10 mx-auto mb-4" />
                          <p className="text-white/40 font-bold">لا توجد طلبات</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stores Tab */}
        <TabsContent value="stores" className="space-y-6 outline-none">
          <Card className="bg-[#0d121f]/60 backdrop-blur-xl border-white/5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 p-6">
              <div>
                <CardTitle className="text-white text-xl font-black">إدارة المتاجر</CardTitle>
                <CardDescription className="text-white/40">إضافة وإدارة المتاجر الإلكترونية</CardDescription>
              </div>
              <Button
                onClick={() => setIsStoreDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold"
              >
                <Plus className="w-4 h-4 me-2" />
                متجر جديد
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.length > 0 ? stores.map((store) => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-purple-500/10 rounded-xl">
                        <Store className="w-6 h-6 text-purple-400" />
                      </div>
                      <Button
                        onClick={() => handleDeleteStore(store.id)}
                        variant="ghost"
                        size="icon"
                        className="text-red-400/50 hover:text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="text-white font-black text-lg mb-2">{store.store_name}</h3>
                    <p className="text-white/40 text-sm flex items-center gap-2 mb-1">
                      <Phone className="w-4 h-4" />
                      {store.phone_number || "لا يوجد رقم"}
                    </p>
                    <p className="text-white/30 text-xs">{store.notes || "بدون ملاحظات"}</p>
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-white/20 text-xs">تاريخ الإضافة: {formatDate(store.created_at)}</p>
                    </div>
                  </motion.div>
                )) : (
                  <div className="col-span-full text-center py-12">
                    <Store className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/40 font-bold">لا توجد متاجر</p>
                    <p className="text-white/20 text-sm">ابدأ بإضافة أول متجر</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipments Tab */}
        <TabsContent value="shipments" className="space-y-6 outline-none">
          <Card className="bg-[#0d121f]/60 backdrop-blur-xl border-white/5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 p-6">
              <div>
                <CardTitle className="text-white text-xl font-black">الشحنات الشخصية</CardTitle>
                <CardDescription className="text-white/40">إدارة شحنات الأفراد والتوصيل</CardDescription>
              </div>
              <Button
                onClick={() => setIsShipmentDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
              >
                <Plus className="w-4 h-4 me-2" />
                شحنة جديدة
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-white/40 font-bold">رقم الشحنة</TableHead>
                    <TableHead className="text-white/40 font-bold">المرسل</TableHead>
                    <TableHead className="text-white/40 font-bold">المستلم</TableHead>
                    <TableHead className="text-white/40 font-bold">الإجمالي</TableHead>
                    <TableHead className="text-white/40 font-bold">الحالة</TableHead>
                    <TableHead className="text-white/40 font-bold text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.length > 0 ? shipments.map((shipment) => (
                    <TableRow key={shipment.id} className="border-white/5 hover:bg-white/[0.02]">
                      <TableCell className="text-white font-mono">{shipment.order_number?.slice(-10) || shipment.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <div className="text-white font-bold">{shipment.sender_name}</div>
                        <div className="text-white/40 text-xs">{shipment.sender_phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-white font-bold">{shipment.receiver_name}</div>
                        <div className="text-white/40 text-xs">{shipment.receiver_phone}</div>
                      </TableCell>
                      <TableCell className="text-blue-400 font-bold">{formatNumber(shipment.total_fee || 0)} ر.س</TableCell>
                      <TableCell>{getStatusBadge(shipment.status || "قيد الانتظار")}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Select onValueChange={(value) => handleUpdateShipmentStatus(shipment.id, value)}>
                            <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white/60 rounded-lg h-8 text-xs">
                              <SelectValue placeholder="تغيير الحالة" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0d121f] border-white/10">
                              <SelectItem value="قيد الانتظار">قيد الانتظار</SelectItem>
                              <SelectItem value="مؤكد">مؤكد</SelectItem>
                              <SelectItem value="خرج للتوصيل">خرج للتوصيل</SelectItem>
                              <SelectItem value="تم التوصيل">تم التوصيل</SelectItem>
                              <SelectItem value="ملغي">ملغي</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={() => handleDeleteShipment(shipment.id)}
                            variant="ghost"
                            size="icon"
                            className="text-red-400/50 hover:text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <Truck className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <p className="text-white/40 font-bold">لا توجد شحنات</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Orders Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="bg-[#0d121f] border-white/10 text-white max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl p-0">
          <DialogHeader className="p-6 border-b border-white/5">
            <DialogTitle className="text-2xl font-black">إضافة طلبات جديدة</DialogTitle>
            <DialogDescription className="text-white/40">أدخل بيانات الطلبات الجديدة</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4">
            {orderRows.map((row, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                <Input
                  placeholder="اسم المستلم"
                  value={row.recipient_name}
                  onChange={(e) => handleOrderRowChange(index, "recipient_name", e.target.value)}
                  className="bg-white/5 border-white/10 text-white rounded-xl"
                />
                <Input
                  placeholder="رقم الهاتف"
                  value={row.phone}
                  onChange={(e) => handleOrderRowChange(index, "phone", e.target.value)}
                  className="bg-white/5 border-white/10 text-white rounded-xl"
                />
                <Input
                  placeholder="العنوان"
                  value={row.address}
                  onChange={(e) => handleOrderRowChange(index, "address", e.target.value)}
                  className="bg-white/5 border-white/10 text-white rounded-xl"
                />
                <div className="flex gap-2">
                  <Select value={row.store} onValueChange={(value) => handleOrderRowChange(index, "store", value)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl flex-1">
                      <SelectValue placeholder="المتجر" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d121f] border-white/10">
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
                      className="text-red-400 hover:bg-red-400/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="اسم الكابتن"
                  value={row.captain}
                  onChange={(e) => handleOrderRowChange(index, "captain", e.target.value)}
                  className="bg-white/5 border-white/10 text-white rounded-xl"
                />
                <Input
                  type="number"
                  placeholder="قيمة الطلب"
                  value={row.order_value}
                  onChange={(e) => handleOrderRowChange(index, "order_value", e.target.value)}
                  className="bg-white/5 border-white/10 text-white rounded-xl"
                />
                <Select value={row.payment_method} onValueChange={(value) => handleOrderRowChange(index, "payment_method", value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                    <SelectValue placeholder="طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d121f] border-white/10">
                    <SelectItem value="نقدي">نقدي</SelectItem>
                    <SelectItem value="تحويل">تحويل</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="ملاحظات"
                  value={row.notes}
                  onChange={(e) => handleOrderRowChange(index, "notes", e.target.value)}
                  className="bg-white/5 border-white/10 text-white rounded-xl"
                />
              </div>
            ))}
            <Button
              onClick={handleAddOrderRow}
              variant="outline"
              className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
            >
              <Plus className="w-4 h-4 me-2" />
              إضافة صف جديد
            </Button>
          </div>
          <DialogFooter className="p-6 border-t border-white/5">
            <Button variant="ghost" onClick={() => setIsOrderDialogOpen(false)} className="text-white/60">
              إلغاء
            </Button>
            <Button onClick={handleSaveOrders} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
              حفظ الطلبات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Store Dialog */}
      <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
        <DialogContent className="bg-[#0d121f] border-white/10 text-white max-w-lg rounded-3xl p-0">
          <form onSubmit={handleSaveStore}>
            <DialogHeader className="p-6 border-b border-white/5">
              <DialogTitle className="text-2xl font-black">إضافة متجر جديد</DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-4">
              <div>
                <Label className="text-white/60 font-bold text-sm">اسم المتجر</Label>
                <Input name="store_name" required className="bg-white/5 border-white/10 text-white rounded-xl mt-2" />
              </div>
              <div>
                <Label className="text-white/60 font-bold text-sm">رقم الهاتف</Label>
                <Input name="phone_number" className="bg-white/5 border-white/10 text-white rounded-xl mt-2" />
              </div>
              <div>
                <Label className="text-white/60 font-bold text-sm">ملاحظات</Label>
                <Textarea name="notes" className="bg-white/5 border-white/10 text-white rounded-xl mt-2" />
              </div>
            </div>
            <DialogFooter className="p-6 border-t border-white/5">
              <Button type="button" variant="ghost" onClick={() => setIsStoreDialogOpen(false)} className="text-white/60">
                إلغاء
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold">
                حفظ المتجر
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Shipment Dialog */}
      <Dialog open={isShipmentDialogOpen} onOpenChange={setIsShipmentDialogOpen}>
        <DialogContent className="bg-[#0d121f] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-0">
          <form onSubmit={handleSaveShipment}>
            <DialogHeader className="p-6 border-b border-white/5">
              <DialogTitle className="text-2xl font-black">إضافة شحنة جديدة</DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-white font-bold border-b border-white/10 pb-2">بيانات المرسل</h4>
                  <Input name="sender_name" placeholder="اسم المرسل" required className="bg-white/5 border-white/10 text-white rounded-xl" />
                  <Input name="sender_phone" placeholder="هاتف المرسل" className="bg-white/5 border-white/10 text-white rounded-xl" />
                  <Textarea name="sender_address" placeholder="عنوان المرسل" className="bg-white/5 border-white/10 text-white rounded-xl" />
                </div>
                <div className="space-y-4">
                  <h4 className="text-white font-bold border-b border-white/10 pb-2">بيانات المستلم</h4>
                  <Input name="receiver_name" placeholder="اسم المستلم" required className="bg-white/5 border-white/10 text-white rounded-xl" />
                  <Input name="receiver_phone" placeholder="هاتف المستلم" className="bg-white/5 border-white/10 text-white rounded-xl" />
                  <Textarea name="receiver_address" placeholder="عنوان المستلم" className="bg-white/5 border-white/10 text-white rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-white/60 text-xs">نوع الشحنة</Label>
                  <Select name="shipment_type" defaultValue="عادي">
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d121f] border-white/10">
                      <SelectItem value="عادي">عادي</SelectItem>
                      <SelectItem value="سريع">سريع</SelectItem>
                      <SelectItem value="مستعجل">مستعجل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/60 text-xs">المسافة (كم)</Label>
                  <Input name="distance_km" type="number" defaultValue="0" className="bg-white/5 border-white/10 text-white rounded-xl mt-1" />
                </div>
                <div>
                  <Label className="text-white/60 text-xs">رسوم التوصيل</Label>
                  <Input name="delivery_fee" type="number" defaultValue="0" className="bg-white/5 border-white/10 text-white rounded-xl mt-1" />
                </div>
                <div>
                  <Label className="text-white/60 text-xs">رسوم إضافية</Label>
                  <Input name="additional_charge" type="number" defaultValue="0" className="bg-white/5 border-white/10 text-white rounded-xl mt-1" />
                </div>
                <div>
                  <Label className="text-white/60 text-xs">إكرامية</Label>
                  <Input name="tips" type="number" defaultValue="0" className="bg-white/5 border-white/10 text-white rounded-xl mt-1" />
                </div>
                <div>
                  <Label className="text-white/60 text-xs">طريقة الدفع</Label>
                  <Select name="payment_method" defaultValue="نقدي">
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d121f] border-white/10">
                      <SelectItem value="نقدي">نقدي</SelectItem>
                      <SelectItem value="تحويل">تحويل</SelectItem>
                      <SelectItem value="آبل باي">آبل باي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="text-white/60 text-xs">ملاحظات</Label>
                  <Input name="notes" className="bg-white/5 border-white/10 text-white rounded-xl mt-1" />
                </div>
              </div>
            </div>
            <DialogFooter className="p-6 border-t border-white/5">
              <Button type="button" variant="ghost" onClick={() => setIsShipmentDialogOpen(false)} className="text-white/60">
                إلغاء
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
                حفظ الشحنة
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
