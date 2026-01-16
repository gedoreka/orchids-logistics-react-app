"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Printer,
  Filter,
  Trash2,
  Edit2,
  Navigation,
  Boxes,
  CheckCheck,
  X,
  Save,
  CreditCard,
  Banknote,
  Settings,
  FileText,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ManageShipmentsClientProps {
  companyId: number;
}

interface Shipment {
  id: string;
  order_number: string;
  shipment_type: string;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  package_description: string;
  package_weight: number;
  shipping_cost: number;
  payment_method: string;
  payment_status: string;
  captain_name: string;
  notes: string;
  status: string;
  distance_km: number;
  delivery_fee: number;
  additional_charge: number;
  tips: number;
  created_at: string;
  updated_at: string;
}

interface ShipmentStats {
  total: number;
  pending: number;
  confirmed: number;
  out: number;
  delivered: number;
  canceled: number;
}

const statusOptions = [
  { value: "قيد الانتظار", label: "قيد الانتظار", color: "amber" },
  { value: "مؤكد", label: "مؤكد", color: "blue" },
  { value: "خرج للتوصيل", label: "خرج للتوصيل", color: "purple" },
  { value: "تم التوصيل", label: "تم التوصيل", color: "emerald" },
  { value: "ملغي", label: "ملغي", color: "red" },
];

export function ManageShipmentsClient({ companyId }: ManageShipmentsClientProps) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<ShipmentStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    out: 0,
    delivered: 0,
    canceled: 0,
  });

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ecommerce/shipments?company_id=${companyId}`);
      const data = await response.json();
      if (data.success) {
        const shipmentsData = data.shipments || [];
        setShipments(shipmentsData);
        
        const newStats: ShipmentStats = {
          total: shipmentsData.length,
          pending: 0,
          confirmed: 0,
          out: 0,
          delivered: 0,
          canceled: 0,
        };
        
        shipmentsData.forEach((s: Shipment) => {
          switch (s.status) {
            case "قيد الانتظار":
            case "pending":
              newStats.pending++;
              break;
            case "مؤكد":
            case "confirmed":
              newStats.confirmed++;
              break;
            case "خرج للتوصيل":
            case "in_progress":
              newStats.out++;
              break;
            case "تم التوصيل":
            case "delivered":
              newStats.delivered++;
              break;
            case "ملغي":
            case "cancelled":
              newStats.canceled++;
              break;
          }
        });
        
        setStats(newStats);
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast.error("فشل في جلب الشحنات");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const handleUpdateStatus = async () => {
    if (!selectedShipment || !newStatus) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/ecommerce/shipments/${selectedShipment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("تم تحديث حالة الشحنة بنجاح");
        fetchShipments();
        setIsViewDialogOpen(false);
      } else {
        toast.error(data.error || "فشل في تحديث الحالة");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء التحديث");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmPayment = async (shipmentId: string) => {
    try {
      const response = await fetch(`/api/ecommerce/shipments/${shipmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: "مدفوع" }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("تم تأكيد الدفع بنجاح");
        fetchShipments();
      } else {
        toast.error(data.error || "فشل في تأكيد الدفع");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تأكيد الدفع");
    }
  };

  const handleDeleteShipment = async (shipmentId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الشحنة؟")) return;

    try {
      const response = await fetch(`/api/ecommerce/shipments/${shipmentId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("تم حذف الشحنة بنجاح");
        fetchShipments();
      } else {
        toast.error(data.error || "فشل في حذف الشحنة");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handlePrintInvoice = (shipment: Shipment) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة شحنة #${shipment.order_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Tajawal', Arial, sans-serif; padding: 20px; background: white; }
          .invoice { max-width: 800px; margin: 0 auto; border: 2px solid #2c3e50; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #2c3e50; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { color: #2c3e50; font-size: 24px; }
          .header p { color: #666; margin-top: 5px; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-box { width: 48%; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #ddd; }
          .info-box h3 { color: #2c3e50; margin-bottom: 10px; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .info-box p { margin: 5px 0; font-size: 14px; }
          .details { margin-bottom: 20px; }
          .details table { width: 100%; border-collapse: collapse; }
          .details th, .details td { padding: 10px; border: 1px solid #ddd; text-align: center; }
          .details th { background: #2c3e50; color: white; }
          .details tr:nth-child(even) { background: #f8f9fa; }
          .total-section { background: linear-gradient(135deg, #2c3e50, #3498db); color: white; padding: 15px; border-radius: 8px; text-align: center; }
          .total-section h2 { font-size: 28px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          @media print { body { padding: 0; } .invoice { border: none; } }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <h1>فاتورة شحنة</h1>
            <p>رقم الطلب: ${shipment.order_number}</p>
            <p>التاريخ: ${new Date(shipment.created_at).toLocaleDateString("ar-SA")}</p>
          </div>
          
          <div class="info-section">
            <div class="info-box">
              <h3>بيانات المرسل</h3>
              <p><strong>الاسم:</strong> ${shipment.sender_name}</p>
              <p><strong>الهاتف:</strong> ${shipment.sender_phone}</p>
              <p><strong>العنوان:</strong> ${shipment.sender_address || "غير محدد"}</p>
            </div>
            <div class="info-box">
              <h3>بيانات المستلم</h3>
              <p><strong>الاسم:</strong> ${shipment.recipient_name}</p>
              <p><strong>الهاتف:</strong> ${shipment.recipient_phone}</p>
              <p><strong>العنوان:</strong> ${shipment.recipient_address || "غير محدد"}</p>
            </div>
          </div>
          
          <div class="details">
            <table>
              <thead>
                <tr>
                  <th>البيان</th>
                  <th>القيمة</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>نوع الشحنة</td><td>${shipment.shipment_type || "---"}</td></tr>
                <tr><td>الوصف</td><td>${shipment.package_description || "---"}</td></tr>
                <tr><td>الوزن</td><td>${shipment.package_weight || 0} كجم</td></tr>
                <tr><td>المسافة</td><td>${shipment.distance_km || 0} كم</td></tr>
                <tr><td>رسوم التوصيل</td><td>${(shipment.delivery_fee || 0).toFixed(2)} ر.س</td></tr>
                <tr><td>رسوم إضافية</td><td>${(shipment.additional_charge || 0).toFixed(2)} ر.س</td></tr>
                <tr><td>البقشيش</td><td>${(shipment.tips || 0).toFixed(2)} ر.س</td></tr>
                <tr><td>طريقة الدفع</td><td>${shipment.payment_method || "نقدي"}</td></tr>
                <tr><td>حالة الدفع</td><td>${shipment.payment_status || "غير مدفوع"}</td></tr>
                <tr><td>حالة الشحنة</td><td>${shipment.status || "قيد الانتظار"}</td></tr>
              </tbody>
            </table>
          </div>
          
          <div class="total-section">
            <p>الإجمالي</p>
            <h2>${(shipment.shipping_cost || 0).toFixed(2)} ر.س</h2>
          </div>
          
          <div class="footer">
            <p>شكراً لاستخدامكم خدماتنا</p>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  const openViewDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setNewStatus(shipment.status || "قيد الانتظار");
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "قيد الانتظار":
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 font-bold"><Clock className="w-3 h-3 me-1" /> قيد الانتظار</Badge>;
      case "مؤكد":
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-bold"><CheckCircle2 className="w-3 h-3 me-1" /> مؤكد</Badge>;
      case "خرج للتوصيل":
      case "in_progress":
        return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 font-bold"><Truck className="w-3 h-3 me-1" /> خرج للتوصيل</Badge>;
      case "تم التوصيل":
      case "delivered":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 font-bold"><CheckCheck className="w-3 h-3 me-1" /> تم التوصيل</Badge>;
      case "ملغي":
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 font-bold"><XCircle className="w-3 h-3 me-1" /> ملغي</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 font-bold">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    if (status === "مدفوع") {
      return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 font-bold"><CheckCircle2 className="w-3 h-3 me-1" /> مدفوع</Badge>;
    }
    return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 font-bold"><XCircle className="w-3 h-3 me-1" /> غير مدفوع</Badge>;
  };

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.sender_phone?.includes(searchQuery) ||
      shipment.recipient_phone?.includes(searchQuery);

    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: string) => new Date(date).toLocaleDateString("ar-SA");
  const formatNumber = (num: number) => new Intl.NumberFormat("ar-SA").format(num || 0);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
            <Truck className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-bold text-lg">جاري تحميل الشحنات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1800px] mx-auto">
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
                <Link href="/ecommerce/individual-shipments" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                  <ArrowRight className="w-5 h-5 text-white" />
                </Link>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">إدارة شحنات الأفراد</h1>
                  <p className="text-white/70 text-sm mt-1">لوحة تحكم شاملة لإدارة جميع الشحنات وتحديث حالاتها</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-bold">
                  <Package className="w-4 h-4 me-2" />
                  {stats.total} طلب
                </Badge>
                <Link href="/ecommerce/individual-shipments/create">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg">
                    <Plus className="w-4 h-4 me-2" />
                    شحنة جديدة
                  </Button>
                </Link>
                <Button onClick={fetchShipments} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
                  <RefreshCw className="w-4 h-4" />
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
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {[
          { icon: Boxes, label: "إجمالي الطلبات", value: stats.total, color: "purple", gradient: "from-purple-500 to-purple-600" },
          { icon: Clock, label: "قيد الانتظار", value: stats.pending, color: "amber", gradient: "from-amber-500 to-amber-600" },
          { icon: CheckCircle2, label: "مؤكدة", value: stats.confirmed, color: "blue", gradient: "from-blue-500 to-blue-600" },
          { icon: Truck, label: "خرج للتوصيل", value: stats.out, color: "cyan", gradient: "from-cyan-500 to-cyan-600" },
          { icon: CheckCheck, label: "تم التوصيل", value: stats.delivered, color: "emerald", gradient: "from-emerald-500 to-emerald-600" },
          { icon: XCircle, label: "ملغية", value: stats.canceled, color: "red", gradient: "from-red-500 to-red-600" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{stat.value}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="البحث برقم الطلب أو الاسم أو الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12 pe-12"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="قيد الانتظار">قيد الانتظار</SelectItem>
                  <SelectItem value="مؤكد">مؤكد</SelectItem>
                  <SelectItem value="خرج للتوصيل">خرج للتوصيل</SelectItem>
                  <SelectItem value="تم التوصيل">تم التوصيل</SelectItem>
                  <SelectItem value="ملغي">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
            <CardTitle className="text-slate-800 dark:text-white text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              قائمة الطلبات
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 ms-2 font-bold">
                {filteredShipments.length} طلب
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#2c3e50] to-[#3498db]">
                    <TableHead className="text-white font-bold text-center">رقم الطلب</TableHead>
                    <TableHead className="text-white font-bold text-center">المرسل</TableHead>
                    <TableHead className="text-white font-bold text-center">المستلم</TableHead>
                    <TableHead className="text-white font-bold text-center">المسافة</TableHead>
                    <TableHead className="text-white font-bold text-center">طريقة الدفع</TableHead>
                    <TableHead className="text-white font-bold text-center">الإجمالي</TableHead>
                    <TableHead className="text-white font-bold text-center">حالة الطلب</TableHead>
                    <TableHead className="text-white font-bold text-center">حالة الدفع</TableHead>
                    <TableHead className="text-white font-bold text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipments.length > 0 ? (
                    filteredShipments.map((shipment, index) => (
                      <TableRow
                        key={shipment.id}
                        className={`${index % 2 === 0 ? "bg-slate-50 dark:bg-slate-900/30" : "bg-white dark:bg-slate-800/30"} hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors`}
                      >
                        <TableCell className="text-blue-600 dark:text-blue-400 font-bold text-center font-mono">
                          #{shipment.order_number?.split("-").pop() || shipment.id.slice(-6)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-slate-800 dark:text-white text-sm">{shipment.sender_name}</span>
                            <span className="text-xs text-slate-500 font-mono">{shipment.sender_phone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-slate-800 dark:text-white text-sm">{shipment.recipient_name}</span>
                            <span className="text-xs text-slate-500 font-mono">{shipment.recipient_phone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300 text-center font-medium">
                          {shipment.distance_km || 8} كم
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300 text-center">
                          {shipment.payment_method || "نقدي"}
                        </TableCell>
                        <TableCell className="text-emerald-600 dark:text-emerald-400 font-bold text-center">
                          {formatNumber(shipment.shipping_cost)} ر.س
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(shipment.status)}</TableCell>
                        <TableCell className="text-center">{getPaymentBadge(shipment.payment_status)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            <Button
                              onClick={() => openViewDialog(shipment)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg"
                              title="عرض"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {shipment.payment_status !== "مدفوع" && (
                              <Button
                                onClick={() => handleConfirmPayment(shipment.id)}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg"
                                title="تأكيد الدفع"
                              >
                                <Banknote className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              onClick={() => handlePrintInvoice(shipment)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 rounded-lg"
                              title="طباعة"
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteShipment(shipment.id)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-16">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
                            <Package className="w-12 h-12 text-slate-400" />
                          </div>
                          <div>
                            <h4 className="text-slate-700 dark:text-slate-300 font-bold text-lg">لا توجد طلبات</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">لم يتم تسجيل أي طلبات حتى الآن</p>
                          </div>
                          <Link href="/ecommerce/individual-shipments/create">
                            <Button className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full px-6">
                              <Plus className="w-4 h-4 me-2" />
                              إنشاء شحنة جديدة
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* View/Edit Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-3xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <DialogTitle className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              تفاصيل الطلب #{selectedShipment?.order_number?.split("-").pop()}
            </DialogTitle>
          </DialogHeader>

          {selectedShipment && (
            <div className="space-y-4 p-2">
              {/* Sender & Recipient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      بيانات المرسل
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><span className="text-slate-500">الاسم:</span> <span className="font-bold">{selectedShipment.sender_name}</span></p>
                    <p><span className="text-slate-500">الهاتف:</span> <span className="font-mono">{selectedShipment.sender_phone}</span></p>
                    <p><span className="text-slate-500">العنوان:</span> {selectedShipment.sender_address || "غير محدد"}</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      بيانات المستلم
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><span className="text-slate-500">الاسم:</span> <span className="font-bold">{selectedShipment.recipient_name}</span></p>
                    <p><span className="text-slate-500">الهاتف:</span> <span className="font-mono">{selectedShipment.recipient_phone}</span></p>
                    <p><span className="text-slate-500">العنوان:</span> {selectedShipment.recipient_address || "غير محدد"}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Shipment Details */}
              <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-500" />
                    تفاصيل الشحنة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl">
                      <p className="text-slate-500 text-xs">المسافة</p>
                      <p className="font-bold text-slate-800 dark:text-white">{selectedShipment.distance_km || 8} كم</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl">
                      <p className="text-slate-500 text-xs">رسوم التوصيل</p>
                      <p className="font-bold text-slate-800 dark:text-white">{(selectedShipment.delivery_fee || 0).toFixed(2)} ر.س</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl">
                      <p className="text-slate-500 text-xs">رسوم إضافية</p>
                      <p className="font-bold text-slate-800 dark:text-white">{(selectedShipment.additional_charge || 0).toFixed(2)} ر.س</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl">
                      <p className="text-slate-500 text-xs">البقشيش</p>
                      <p className="font-bold text-slate-800 dark:text-white">{(selectedShipment.tips || 0).toFixed(2)} ر.س</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl">
                      <p className="text-slate-500 text-xs">الإجمالي</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{formatNumber(selectedShipment.shipping_cost)} ر.س</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl">
                      <p className="text-slate-500 text-xs">طريقة الدفع</p>
                      <p className="font-bold text-slate-800 dark:text-white">{selectedShipment.payment_method || "نقدي"}</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl col-span-2">
                      <p className="text-slate-500 text-xs mb-1">حالة الدفع</p>
                      {getPaymentBadge(selectedShipment.payment_status)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Update Status */}
              <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-amber-500" />
                    تحديث حالة الطلب
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl h-11 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleUpdateStatus}
                      disabled={isUpdating}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl h-11 px-6"
                    >
                      {isUpdating ? (
                        <RefreshCw className="w-4 h-4 me-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 me-2" />
                      )}
                      تحديث
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button
              variant="ghost"
              onClick={() => setIsViewDialogOpen(false)}
              className="text-slate-500"
            >
              إغلاق
            </Button>
            <Button
              onClick={() => selectedShipment && handlePrintInvoice(selectedShipment)}
              className="bg-slate-600 hover:bg-slate-700 text-white rounded-xl"
            >
              <Printer className="w-4 h-4 me-2" />
              طباعة الفاتورة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
