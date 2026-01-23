"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Truck,
  Package,
  Search,
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";

interface TrackShipmentsClientProps {
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
  captain_name: string;
  notes: string;
  status: string;
  created_at: string;
}

export function TrackShipmentsClient({ companyId }: TrackShipmentsClientProps) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ecommerce/shipments?company_id=${companyId}`);
      const data = await response.json();
      if (data.success) {
        setShipments(data.shipments || []);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
      case "قيد الانتظار":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"><Clock className="w-3 h-3 me-1" /> قيد الانتظار</Badge>;
      case "in_progress":
      case "قيد التوصيل":
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"><Truck className="w-3 h-3 me-1" /> قيد التوصيل</Badge>;
      case "delivered":
      case "تم التسليم":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"><CheckCircle2 className="w-3 h-3 me-1" /> تم التسليم</Badge>;
      case "cancelled":
      case "ملغي":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"><XCircle className="w-3 h-3 me-1" /> ملغي</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700">{status}</Badge>;
    }
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.sender_phone?.includes(searchQuery) ||
      shipment.recipient_phone?.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: string) => new Date(date).toLocaleDateString(\'en-US\');
  const formatNumber = (num: number) => new Intl.NumberFormat(\'en-US\').format(num);

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
          <CardContent className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link href="/ecommerce/individual-shipments" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                  <ArrowRight className="w-5 h-5 text-white" />
                </Link>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Navigation className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">تتبع شحناتي</h1>
                  <p className="text-white/70 text-sm mt-1">عرض وتتبع جميع الشحنات</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-bold">
                  <Package className="w-4 h-4 me-2" />
                  {shipments.length} شحنة
                </Badge>
                <Button onClick={fetchShipments} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="in_progress">قيد التوصيل</SelectItem>
                  <SelectItem value="delivered">تم التسليم</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Shipments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#2c3e50] to-[#3498db]">
                    <TableHead className="text-white font-bold text-center">رقم الطلب</TableHead>
                    <TableHead className="text-white font-bold text-center">النوع</TableHead>
                    <TableHead className="text-white font-bold text-center">المرسل</TableHead>
                    <TableHead className="text-white font-bold text-center">المستلم</TableHead>
                    <TableHead className="text-white font-bold text-center">التكلفة</TableHead>
                    <TableHead className="text-white font-bold text-center">الحالة</TableHead>
                    <TableHead className="text-white font-bold text-center">التاريخ</TableHead>
                    <TableHead className="text-white font-bold text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipments.length > 0 ? filteredShipments.map((shipment, index) => (
                    <TableRow 
                      key={shipment.id} 
                      className={`${index % 2 === 0 ? "bg-slate-50 dark:bg-slate-900/30" : "bg-white dark:bg-slate-800/30"} hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors`}
                    >
                      <TableCell className="text-blue-600 dark:text-blue-400 font-bold text-center font-mono">
                        {shipment.order_number}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 text-center">
                        <Badge variant="outline" className="font-medium">{shipment.shipment_type || "---"}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-slate-800 dark:text-white">{shipment.sender_name}</span>
                          <span className="text-xs text-slate-500 font-mono">{shipment.sender_phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-slate-800 dark:text-white">{shipment.recipient_name}</span>
                          <span className="text-xs text-slate-500 font-mono">{shipment.recipient_phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-emerald-600 dark:text-emerald-400 font-bold text-center">
                        {formatNumber(shipment.shipping_cost)} ر.س
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(shipment.status)}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 text-center text-sm">
                        {formatDate(shipment.created_at)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg">
                            <Printer className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-16">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
                            <Package className="w-12 h-12 text-slate-400" />
                          </div>
                          <div>
                            <h4 className="text-slate-700 dark:text-slate-300 font-bold text-lg">لا توجد شحنات</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">لم يتم العثور على شحنات مطابقة</p>
                          </div>
                          <Link href="/ecommerce/individual-shipments/create">
                            <Button className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full px-6">
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
    </div>
  );
}
