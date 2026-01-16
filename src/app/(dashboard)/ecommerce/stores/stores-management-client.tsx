"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Store,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  RefreshCw,
  ArrowRight,
  Phone,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
  Building2,
  Sparkles,
  XCircle,
  Eye,
  MoreVertical,
  Link as LinkIcon,
  Star,
  TrendingUp,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface StoresManagementClientProps {
  companyId: number;
}

interface StoreType {
  id: string;
  store_name: string;
  phone_number: string;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function StoresManagementClient({ companyId }: StoresManagementClientProps) {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  
  const [formData, setFormData] = useState({
    store_name: "",
    phone_number: "",
    notes: "",
    status: "نشط"
  });

  const fetchStores = useCallback(async () => {
    try {
      const response = await fetch(`/api/ecommerce/stores?company_id=${companyId}`);
      const data = await response.json();
      if (data.success) {
        setStores(data.stores || []);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("فشل في جلب المتاجر");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const resetForm = () => {
    setFormData({ store_name: "", phone_number: "", notes: "", status: "نشط" });
  };

  const handleAddStore = async () => {
    if (!formData.store_name.trim()) {
      toast.error("يرجى إدخال اسم المتجر");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/ecommerce/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, company_id: companyId })
      });

      const data = await response.json();
      if (data.success) {
        toast.success("تم إضافة المتجر بنجاح");
        setIsAddDialogOpen(false);
        resetForm();
        fetchStores();
      } else {
        toast.error(data.error || "فشل في إضافة المتجر");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الإضافة");
    } finally {
      setSaving(false);
    }
  };

  const handleEditStore = async () => {
    if (!selectedStore || !formData.store_name.trim()) {
      toast.error("يرجى إدخال اسم المتجر");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/ecommerce/stores/${selectedStore.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success("تم تحديث المتجر بنجاح");
        setIsEditDialogOpen(false);
        resetForm();
        setSelectedStore(null);
        fetchStores();
      } else {
        toast.error(data.error || "فشل في تحديث المتجر");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء التحديث");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المتجر؟")) return;

    try {
      const response = await fetch(`/api/ecommerce/stores/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        toast.success("تم حذف المتجر بنجاح");
        fetchStores();
      } else {
        toast.error(data.error || "فشل في حذف المتجر");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const openEditDialog = (store: StoreType) => {
    setSelectedStore(store);
    setFormData({
      store_name: store.store_name,
      phone_number: store.phone_number || "",
      notes: store.notes || "",
      status: store.status || "نشط"
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (store: StoreType) => {
    setSelectedStore(store);
    setIsViewDialogOpen(true);
  };

  const filteredStores = stores.filter(store =>
    store.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (store.phone_number && store.phone_number.includes(searchQuery))
  );

  const formatDate = (date: string) => new Date(date).toLocaleDateString("ar-SA");

  const getStatusBadge = (status: string) => {
    const isActive = status === "نشط" || !status;
    return (
      <Badge className={`${isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"} font-bold`}>
        {isActive ? <CheckCircle2 className="w-3 h-3 me-1" /> : <XCircle className="w-3 h-3 me-1" />}
        {isActive ? "نشط" : "غير نشط"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
            <Store className="w-8 h-8 text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-bold text-lg">جاري تحميل المتاجر...</p>
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
                <Link href="/ecommerce" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                  <ArrowRight className="w-5 h-5 text-white" />
                </Link>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">إدارة متاجر التجارة الإلكترونية</h1>
                  <p className="text-white/70 text-sm mt-1">إضافة وإدارة المتاجر الإلكترونية المتعاونة</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-bold">
                  <Store className="w-4 h-4 me-2" />
                  {stores.length} متجر
                </Badge>
                <Button
                  onClick={() => fetchStores()}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                >
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
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { icon: Store, label: "إجمالي المتاجر", value: stores.length, color: "purple", gradient: "from-purple-500 to-purple-600" },
          { icon: CheckCircle2, label: "المتاجر النشطة", value: stores.filter(s => s.status === "نشط" || !s.status).length, color: "emerald", gradient: "from-emerald-500 to-emerald-600" },
          { icon: XCircle, label: "المتاجر المتوقفة", value: stores.filter(s => s.status === "غير نشط").length, color: "red", gradient: "from-red-500 to-red-600" },
          { icon: TrendingUp, label: "معدل النمو", value: "100%", color: "blue", gradient: "from-blue-500 to-blue-600" },
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

      {/* Add Store Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg">
          <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
            <CardTitle className="text-slate-800 dark:text-white text-lg font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-500" />
              إضافة متجر جديد
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">اسم المتجر *</Label>
                <Input
                  placeholder="أدخل اسم المتجر"
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12"
                />
              </div>
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">رقم الهاتف</Label>
                <Input
                  placeholder="رقم الهاتف (اختياري)"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12"
                />
              </div>
              <div>
                <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">ملاحظات</Label>
                <Input
                  placeholder="ملاحظات (اختياري)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12"
                />
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleAddStore}
                disabled={saving || !formData.store_name.trim()}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-full px-10 h-12 font-bold shadow-lg hover:shadow-xl transition-all"
              >
                {saving ? (
                  <RefreshCw className="w-5 h-5 me-2 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5 me-2" />
                )}
                إضافة المتجر
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg">
          <CardContent className="p-5">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="البحث عن متجر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-12 pe-12"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stores Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
            <CardTitle className="text-slate-800 dark:text-white text-lg font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-500" />
              قائمة المتاجر
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 ms-2">
                {filteredStores.length} متجر
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#2c3e50] to-[#3498db]">
                    <TableHead className="text-white font-bold text-center">#</TableHead>
                    <TableHead className="text-white font-bold text-center">اسم المتجر</TableHead>
                    <TableHead className="text-white font-bold text-center">رقم الهاتف</TableHead>
                    <TableHead className="text-white font-bold text-center">ملاحظات</TableHead>
                    <TableHead className="text-white font-bold text-center">الحالة</TableHead>
                    <TableHead className="text-white font-bold text-center">تاريخ الانضمام</TableHead>
                    <TableHead className="text-white font-bold text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStores.length > 0 ? filteredStores.map((store, index) => (
                    <TableRow 
                      key={store.id} 
                      className={`${index % 2 === 0 ? "bg-slate-50 dark:bg-slate-900/30" : "bg-white dark:bg-slate-800/30"} hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors`}
                    >
                      <TableCell className="text-slate-600 dark:text-slate-300 text-center font-bold">{index + 1}</TableCell>
                      <TableCell className="text-slate-800 dark:text-white font-bold text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                            {store.store_name.charAt(0)}
                          </div>
                          <span>{store.store_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 text-center font-mono">
                        {store.phone_number || <span className="text-slate-400">---</span>}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 text-center max-w-[200px] truncate">
                        {store.notes || <span className="text-slate-400">---</span>}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(store.status)}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 text-center">
                        {formatDate(store.created_at)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => openViewDialog(store)}
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => openEditDialog(store)}
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteStore(store.id)}
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
                            <Store className="w-12 h-12 text-slate-400" />
                          </div>
                          <div>
                            <h4 className="text-slate-700 dark:text-slate-300 font-bold text-lg">لا توجد متاجر</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">لم يتم إضافة أي متاجر بعد. قم بإضافة متجر جديد للبدء.</p>
                          </div>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-lg rounded-2xl">
          <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <DialogTitle className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
                <Edit2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              تعديل بيانات المتجر
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div>
              <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">اسم المتجر *</Label>
              <Input
                placeholder="أدخل اسم المتجر"
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-11"
              />
            </div>
            <div>
              <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">رقم الهاتف</Label>
              <Input
                placeholder="رقم الهاتف"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-11"
              />
            </div>
            <div>
              <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">الحالة</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نشط">نشط</SelectItem>
                  <SelectItem value="غير نشط">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-2 block">ملاحظات</Label>
              <Textarea
                placeholder="ملاحظات"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button variant="ghost" onClick={() => { setIsEditDialogOpen(false); resetForm(); }} className="text-slate-500">
              إلغاء
            </Button>
            <Button onClick={handleEditStore} disabled={saving} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl px-6">
              {saving ? <RefreshCw className="w-4 h-4 me-2 animate-spin" /> : <Save className="w-4 h-4 me-2" />}
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-lg rounded-2xl">
          <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <DialogTitle className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              تفاصيل المتجر
            </DialogTitle>
          </DialogHeader>
          {selectedStore && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-black text-2xl">
                  {selectedStore.store_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedStore.store_name}</h3>
                  {getStatusBadge(selectedStore.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">رقم الهاتف</p>
                  <p className="text-slate-800 dark:text-white font-bold mt-1">{selectedStore.phone_number || "غير محدد"}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">تاريخ الانضمام</p>
                  <p className="text-slate-800 dark:text-white font-bold mt-1">{formatDate(selectedStore.created_at)}</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">ملاحظات</p>
                <p className="text-slate-800 dark:text-white font-medium mt-1">{selectedStore.notes || "لا توجد ملاحظات"}</p>
              </div>
            </div>
          )}
          <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button onClick={() => setIsViewDialogOpen(false)} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-6">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
