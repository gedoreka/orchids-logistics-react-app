"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShoppingCart,
  Calendar,
  Plus,
  Trash2,
  Save,
  FileSpreadsheet,
  Printer,
  Upload,
  Filter,
  RefreshCw,
  ArrowRight,
  Store,
  Truck,
  Phone,
  MapPin,
  User,
  DollarSign,
  CreditCard,
  Banknote,
  FileText,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  Sparkles,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface DailyOrdersClientProps {
  companyId: number;
}

interface StoreType {
  id: string;
  store_name: string;
  phone_number: string;
}

interface OrderRow {
  id: string;
  recipient_name: string;
  phone: string;
  address: string;
  store: string;
  captain: string;
  order_value: string;
  payment_method: string;
  notes: string;
}

interface SavedOrder {
  id: string;
  recipient_name: string;
  phone: string;
  address: string;
  store: string;
  captain: string;
  order_value: number;
  payment_method: string;
  notes: string;
  status: string;
  order_date: string;
  created_at: string;
}

export function DailyOrdersClient({ companyId }: DailyOrdersClientProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [stores, setStores] = useState<StoreType[]>([]);
  const [savedOrders, setSavedOrders] = useState<SavedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [orderRows, setOrderRows] = useState<OrderRow[]>([
    { id: crypto.randomUUID(), recipient_name: "", phone: "", address: "", store: "", captain: "", order_value: "", payment_method: "نقدي", notes: "" }
  ]);

  const getDaysInMonth = (month: string) => {
    const [year, m] = month.split("-").map(Number);
    return new Date(year, m, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(selectedMonth);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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

  const fetchOrders = useCallback(async () => {
    try {
      const orderDate = `${selectedMonth}-${String(selectedDay).padStart(2, "0")}`;
      const response = await fetch(`/api/ecommerce/orders?company_id=${companyId}&date=${orderDate}`);
      const data = await response.json();
      if (data.success) {
        setSavedOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, [companyId, selectedMonth, selectedDay]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStores(), fetchOrders()]);
    setLoading(false);
  }, [fetchStores, fetchOrders]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    fetchOrders();
  }, [selectedDay, selectedMonth, fetchOrders]);

  const handleAddRow = () => {
    setOrderRows([...orderRows, { id: crypto.randomUUID(), recipient_name: "", phone: "", address: "", store: "", captain: "", order_value: "", payment_method: "نقدي", notes: "" }]);
    setHasChanges(true);
  };

  const handleRemoveRow = (id: string) => {
    if (orderRows.length > 1) {
      setOrderRows(orderRows.filter(row => row.id !== id));
      setHasChanges(true);
    }
  };

  const handleRowChange = (id: string, field: keyof OrderRow, value: string) => {
    setOrderRows(orderRows.map(row => row.id === id ? { ...row, [field]: value } : row));
    setHasChanges(true);
  };

  const handleSaveOrders = async () => {
    const validOrders = orderRows.filter(row => row.recipient_name && row.phone);
    if (validOrders.length === 0) {
      toast.error("يرجى إدخال بيانات طلب واحد على الأقل");
      return;
    }

    setSaving(true);
    try {
      const orderDate = `${selectedMonth}-${String(selectedDay).padStart(2, "0")}`;
      const response = await fetch("/api/ecommerce/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          orders: validOrders.map(order => ({
            recipient_name: order.recipient_name,
            phone: order.phone,
            address: order.address,
            store: order.store,
            captain: order.captain,
            order_value: parseFloat(order.order_value) || 0,
            payment_method: order.payment_method,
            notes: order.notes,
            order_date: orderDate
          }))
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`تم حفظ ${validOrders.length} طلب بنجاح`);
        setOrderRows([{ id: crypto.randomUUID(), recipient_name: "", phone: "", address: "", store: "", captain: "", order_value: "", payment_method: "نقدي", notes: "" }]);
        setHasChanges(false);
        fetchOrders();
      } else {
        toast.error(data.error || "فشل في حفظ الطلبات");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;

    try {
      const response = await fetch(`/api/ecommerce/orders/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        toast.success("تم حذف الطلب");
        fetchOrders();
      }
    } catch (error) {
      toast.error("فشل في حذف الطلب");
    }
  };

  const handleExportExcel = () => {
    const orderDate = `${selectedMonth}-${String(selectedDay).padStart(2, "0")}`;
    const headers = ["اسم المستلم", "رقم الهاتف", "العنوان", "المتجر", "الكابتن", "القيمة", "طريقة الدفع", "ملاحظات"];
    const rows = savedOrders.map(order => [
      order.recipient_name,
      order.phone,
      order.address,
      order.store,
      order.captain,
      order.order_value,
      order.payment_method,
      order.notes
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders_${orderDate}.csv`;
    link.click();
    toast.success("تم تصدير الملف بنجاح");
  };

  const handlePrint = () => {
    window.print();
  };

  const formatNumber = (num: number) => new Intl.NumberFormat(\'en-US\').format(num);
  const totalValue = savedOrders.reduce((sum, order) => sum + (order.order_value || 0), 0);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
            <Calendar className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-bold text-lg">جاري تحميل سجل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1800px] mx-auto print:p-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative print:hidden"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-[#2c3e50] to-[#3498db] rounded-3xl blur opacity-30" />
        <Card className="relative bg-gradient-to-r from-[#2c3e50] to-[#3498db] border-0 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <CardContent className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link href="/ecommerce" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                  <ArrowRight className="w-5 h-5 text-white" />
                </Link>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">سجل التجارة الإلكترونية</h1>
                  <p className="text-white/70 text-sm mt-1">عرض الطلبات اليومية</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-bold">
                  <Calendar className="w-4 h-4 me-2" />
                  اليوم: {selectedDay} | الشهر: {selectedMonth}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Month & Day Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="print:hidden"
      >
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg">
          <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
            <CardTitle className="text-slate-800 dark:text-white text-lg font-bold flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-500" />
              اختيار الشهر واليوم
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">اختر الشهر:</Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => { setSelectedMonth(e.target.value); setSelectedDay(1); }}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">اختر اليوم:</Label>
                <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900/30 rounded-xl">
                  {daysArray.map((day) => (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDay(day)}
                      className={`min-w-[70px] px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                        selectedDay === day
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500"
                      }`}
                    >
                      يوم {day}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Orders Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="print:hidden"
      >
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg">
          <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
            <CardTitle className="text-slate-800 dark:text-white text-lg font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-500" />
              إضافة طلبات جديدة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#2c3e50] to-[#3498db]">
                    <TableHead className="text-white font-bold text-center min-w-[150px]">اسم المستلم</TableHead>
                    <TableHead className="text-white font-bold text-center min-w-[130px]">رقم الهاتف</TableHead>
                    <TableHead className="text-white font-bold text-center min-w-[150px]">العنوان</TableHead>
                    <TableHead className="text-white font-bold text-center min-w-[150px]">اسم المتجر</TableHead>
                    <TableHead className="text-white font-bold text-center min-w-[130px]">اسم الكابتن</TableHead>
                    <TableHead className="text-white font-bold text-center min-w-[100px]">قيمة الطلب</TableHead>
                    <TableHead className="text-white font-bold text-center min-w-[100px]">طريقة الدفع</TableHead>
                    <TableHead className="text-white font-bold text-center min-w-[130px]">ملاحظات</TableHead>
                    <TableHead className="text-white font-bold text-center min-w-[70px]">حذف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderRows.map((row, index) => (
                    <TableRow key={row.id} className={index % 2 === 0 ? "bg-slate-50 dark:bg-slate-900/30" : "bg-white dark:bg-slate-800/30"}>
                      <TableCell>
                        <Input
                          placeholder="اسم المستلم"
                          value={row.recipient_name}
                          onChange={(e) => handleRowChange(row.id, "recipient_name", e.target.value)}
                          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg h-10"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="رقم الهاتف"
                          value={row.phone}
                          onChange={(e) => handleRowChange(row.id, "phone", e.target.value)}
                          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg h-10"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="العنوان"
                          value={row.address}
                          onChange={(e) => handleRowChange(row.id, "address", e.target.value)}
                          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg h-10"
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={row.store} onValueChange={(value) => handleRowChange(row.id, "store", value)}>
                          <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg h-10">
                            <SelectValue placeholder="اختر المتجر" />
                          </SelectTrigger>
                          <SelectContent>
                            {stores.map((store) => (
                              <SelectItem key={store.id} value={store.store_name}>{store.store_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="اسم الكابتن"
                          value={row.captain}
                          onChange={(e) => handleRowChange(row.id, "captain", e.target.value)}
                          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg h-10"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="القيمة"
                          value={row.order_value}
                          onChange={(e) => handleRowChange(row.id, "order_value", e.target.value)}
                          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg h-10"
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={row.payment_method} onValueChange={(value) => handleRowChange(row.id, "payment_method", value)}>
                          <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="نقدي">نقدي</SelectItem>
                            <SelectItem value="تحويل">تحويل</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="ملاحظات"
                          value={row.notes}
                          onChange={(e) => handleRowChange(row.id, "notes", e.target.value)}
                          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg h-10"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleRemoveRow(row.id)}
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg"
                          disabled={orderRows.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Action Buttons */}
            <div className="p-5 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={handleAddRow}
                variant="outline"
                className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-full px-6"
              >
                <Plus className="w-4 h-4 me-2" />
                إضافة صف
              </Button>
            </div>

            <div className="p-5 pt-0 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={handleSaveOrders}
                disabled={saving}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-full px-8 h-12 font-bold shadow-lg hover:shadow-xl transition-all"
              >
                {saving ? (
                  <RefreshCw className="w-5 h-5 me-2 animate-spin" />
                ) : (
                  <Save className="w-5 h-5 me-2" />
                )}
                حفظ الطلبات
              </Button>
              <Button
                onClick={handleExportExcel}
                variant="outline"
                className="bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 rounded-full px-6 h-12"
              >
                <FileSpreadsheet className="w-5 h-5 me-2" />
                تصدير Excel
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full px-6 h-12"
              >
                <Printer className="w-5 h-5 me-2" />
                طباعة
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Import Excel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="print:hidden"
      >
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg">
          <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
            <CardTitle className="text-slate-800 dark:text-white text-lg font-bold flex items-center gap-2">
              <Upload className="w-5 h-5 text-cyan-500" />
              استيراد من ملف Excel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="border-2 border-dashed border-cyan-300 dark:border-cyan-700 rounded-2xl p-8 text-center bg-cyan-50/50 dark:bg-cyan-900/20">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    toast.info("جاري معالجة الملف...");
                  }
                }}
              />
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-cyan-100 dark:bg-cyan-800/50 rounded-2xl">
                  <FileSpreadsheet className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-slate-700 dark:text-slate-300 font-bold">اختر ملف Excel:</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">يدعم ملفات .xlsx, .xls, .csv</p>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="bg-white dark:bg-slate-800 border-cyan-300 dark:border-cyan-600 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/50 rounded-full px-6"
                >
                  <Upload className="w-4 h-4 me-2" />
                  رفع الملف
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Saved Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4 print:border-0">
            <CardTitle className="text-slate-800 dark:text-white text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500 print:hidden" />
              طلبات اليوم {selectedDay} - {selectedMonth}
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 ms-2">
                {savedOrders.length} طلب
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#2c3e50] to-[#3498db] print:bg-slate-200">
                    <TableHead className="text-white print:text-black font-bold text-center">اسم المستلم</TableHead>
                    <TableHead className="text-white print:text-black font-bold text-center">رقم الهاتف</TableHead>
                    <TableHead className="text-white print:text-black font-bold text-center">العنوان</TableHead>
                    <TableHead className="text-white print:text-black font-bold text-center">المتجر</TableHead>
                    <TableHead className="text-white print:text-black font-bold text-center">الكابتن</TableHead>
                    <TableHead className="text-white print:text-black font-bold text-center">القيمة</TableHead>
                    <TableHead className="text-white print:text-black font-bold text-center">طريقة الدفع</TableHead>
                    <TableHead className="text-white print:text-black font-bold text-center">ملاحظات</TableHead>
                    <TableHead className="text-white font-bold text-center print:hidden">حذف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedOrders.length > 0 ? savedOrders.map((order, index) => (
                    <TableRow key={order.id} className={index % 2 === 0 ? "bg-slate-50 dark:bg-slate-900/30" : "bg-white dark:bg-slate-800/30"}>
                      <TableCell className="text-slate-800 dark:text-white font-medium text-center">{order.recipient_name}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 text-center font-mono">{order.phone}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 text-center">{order.address || "---"}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 text-center">{order.store || "---"}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 text-center">{order.captain || "---"}</TableCell>
                      <TableCell className="text-emerald-600 dark:text-emerald-400 font-bold text-center">{formatNumber(order.order_value)} ر.س</TableCell>
                      <TableCell className="text-center">
                        <Badge className={order.payment_method === "تحويل" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}>
                          {order.payment_method === "تحويل" ? <CreditCard className="w-3 h-3 me-1" /> : <Banknote className="w-3 h-3 me-1" />}
                          {order.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400 text-center text-sm">{order.notes || "---"}</TableCell>
                      <TableCell className="text-center print:hidden">
                        <Button
                          onClick={() => handleDeleteOrder(order.id)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
                            <p className="text-slate-500 dark:text-slate-400 text-sm">لم يتم تسجيل أي طلبات لهذا اليوم</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {savedOrders.length > 0 && (
                    <TableRow className="bg-gradient-to-r from-amber-500 to-orange-500 print:bg-amber-200">
                      <TableCell colSpan={5} className="text-white print:text-black font-black text-lg text-start">الإجمالي</TableCell>
                      <TableCell className="text-white print:text-black font-black text-lg text-center">{formatNumber(totalValue)} ر.س</TableCell>
                      <TableCell colSpan={3}></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Unsaved Changes Warning */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 print:hidden"
          >
            <Card className="bg-amber-500 border-amber-600 shadow-2xl shadow-amber-500/30">
              <CardContent className="p-4 flex items-center gap-4">
                <AlertCircle className="w-6 h-6 text-white" />
                <p className="text-white font-bold">لديك تغييرات لم يتم حفظها</p>
                <Button
                  onClick={handleSaveOrders}
                  className="bg-white text-amber-600 hover:bg-amber-50 rounded-full px-4"
                  size="sm"
                >
                  <Save className="w-4 h-4 me-2" />
                  حفظ الآن
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
