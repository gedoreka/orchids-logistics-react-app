"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Truck,
  Package,
  ArrowRight,
  MapPin,
  Phone,
  User,
  DollarSign,
  Send,
  RefreshCw,
  CheckCircle2,
  Gift,
  FileText,
  Laptop,
  Box,
  Pill,
  PawPrint,
  Utensils,
  Shirt,
  Calculator,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Home,
  Building2,
  MessageSquare,
  CreditCard,
  Banknote,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateShipmentClientProps {
  companyId: number;
}

const shipmentTypes = [
  { id: "هدايا", icon: Gift, color: "pink" },
  { id: "مستندات", icon: FileText, color: "blue" },
  { id: "إلكترونيات", icon: Laptop, color: "purple" },
  { id: "طرود", icon: Box, color: "amber" },
  { id: "أدوية", icon: Pill, color: "emerald" },
  { id: "مستلزمات حيوانات", icon: PawPrint, color: "cyan" },
  { id: "أطعمة", icon: Utensils, color: "red" },
  { id: "ملابس", icon: Shirt, color: "fuchsia" },
];

export function CreateShipmentClient({ companyId }: CreateShipmentClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "";

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    shipment_type: initialType,
    sender_name: "",
    sender_phone: "",
    sender_address: "",
    recipient_name: "",
    recipient_phone: "",
    recipient_address: "",
    package_description: "",
    package_weight: "",
    shipping_cost: "",
    payment_method: "نقدي",
    captain_name: "",
    notes: "",
  });

  const handleSubmit = async () => {
    if (!formData.sender_name || !formData.sender_phone || !formData.recipient_name || !formData.recipient_phone) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/ecommerce/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          ...formData,
          package_weight: parseFloat(formData.package_weight) || 0,
          shipping_cost: parseFloat(formData.shipping_cost) || 0,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("تم إنشاء الشحنة بنجاح");
        router.push("/ecommerce/individual-shipments");
      } else {
        toast.error(data.error || "فشل في إنشاء الشحنة");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const calculateCost = () => {
    const weight = parseFloat(formData.package_weight) || 0;
    const baseCost = 10;
    const costPerKg = 5;
    const calculatedCost = baseCost + (weight * costPerKg);
    setFormData({ ...formData, shipping_cost: calculatedCost.toString() });
    toast.info(`التكلفة المقدرة: ${calculatedCost} ر.س`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
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
                  <Send className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">إنشاء شحنة جديدة</h1>
                  <p className="text-white/70 text-sm mt-1">إرسال شحنة من الأفراد</p>
                </div>
              </div>
              {formData.shipment_type && (
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-bold">
                  <Package className="w-4 h-4 me-2" />
                  {formData.shipment_type}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Shipment Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg">
          <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
            <CardTitle className="text-slate-800 dark:text-white text-lg font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              نوع الشحنة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {shipmentTypes.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFormData({ ...formData, shipment_type: type.id })}
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    formData.shipment_type === type.id
                      ? `bg-gradient-to-br from-${type.color}-500 to-${type.color}-600 text-white shadow-lg`
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  <type.icon className="w-6 h-6" />
                  <span className="text-xs font-bold text-center">{type.id}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sender Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg h-full">
            <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
              <CardTitle className="text-slate-800 dark:text-white text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                بيانات المرسل
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">اسم المرسل *</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="أدخل اسم المرسل"
                    value={formData.sender_name}
                    onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12 pe-10"
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">رقم الهاتف *</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="05xxxxxxxx"
                    value={formData.sender_phone}
                    onChange={(e) => setFormData({ ...formData, sender_phone: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12 pe-10"
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">عنوان المرسل</Label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                  <Textarea
                    placeholder="أدخل العنوان الكامل"
                    value={formData.sender_address}
                    onChange={(e) => setFormData({ ...formData, sender_address: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl pe-10 min-h-[80px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recipient Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg h-full">
            <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
              <CardTitle className="text-slate-800 dark:text-white text-lg font-bold flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-500" />
                بيانات المستلم
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">اسم المستلم *</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="أدخل اسم المستلم"
                    value={formData.recipient_name}
                    onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12 pe-10"
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">رقم الهاتف *</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="05xxxxxxxx"
                    value={formData.recipient_phone}
                    onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12 pe-10"
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">عنوان المستلم</Label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                  <Textarea
                    placeholder="أدخل العنوان الكامل"
                    value={formData.recipient_address}
                    onChange={(e) => setFormData({ ...formData, recipient_address: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl pe-10 min-h-[80px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Package & Payment Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg">
          <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
            <CardTitle className="text-slate-800 dark:text-white text-lg font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-500" />
              تفاصيل الشحنة والدفع
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">وصف المحتوى</Label>
                <Input
                  placeholder="وصف الشحنة"
                  value={formData.package_description}
                  onChange={(e) => setFormData({ ...formData, package_description: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12"
                />
              </div>
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">الوزن (كجم)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.package_weight}
                  onChange={(e) => setFormData({ ...formData, package_weight: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12"
                />
              </div>
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">تكلفة الشحن</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.shipping_cost}
                    onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12"
                  />
                  <Button onClick={calculateCost} variant="outline" className="h-12 px-3 rounded-xl">
                    <Calculator className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">طريقة الدفع</Label>
                <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نقدي">
                      <span className="flex items-center gap-2"><Banknote className="w-4 h-4" /> نقدي</span>
                    </SelectItem>
                    <SelectItem value="تحويل">
                      <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> تحويل</span>
                    </SelectItem>
                    <SelectItem value="آجل">
                      <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> آجل</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">اسم الكابتن</Label>
                <Input
                  placeholder="اسم السائق / الكابتن"
                  value={formData.captain_name}
                  onChange={(e) => setFormData({ ...formData, captain_name: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12"
                />
              </div>
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">ملاحظات</Label>
                <Input
                  placeholder="ملاحظات إضافية"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-full px-10 h-14 text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
        >
          {saving ? (
            <RefreshCw className="w-6 h-6 me-2 animate-spin" />
          ) : (
            <CheckCircle2 className="w-6 h-6 me-2" />
          )}
          حفظ الشحنة
        </Button>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-full px-8 h-14 text-lg font-bold"
        >
          <Printer className="w-6 h-6 me-2" />
          طباعة
        </Button>
        <Link href="/ecommerce/individual-shipments">
          <Button variant="ghost" className="text-slate-500 rounded-full px-8 h-14 text-lg">
            إلغاء
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
