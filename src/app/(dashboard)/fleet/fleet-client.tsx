"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Car, 
  Settings, 
  Wrench, 
  Plus, 
  Search, 
  AlertTriangle, 
  Box, 
  Clock, 
  History, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Printer, 
  Filter,
  Package,
  Shield,
  Calendar,
  User,
  MoreVertical,
  CheckCircle2,
  X,
  RefreshCcw,
  Tag,
  FileText,
  Calculator,
  LayoutDashboard,
  Truck,
  Layers,
  FileCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { addVehicle, addSpare, addSpareCategory, addVehicleCategory, createMaintenanceRequest, deleteVehicle, deleteMaintenanceRequest, getMaintenanceDetails } from "@/lib/actions/fleet";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useReactToPrint } from "react-to-print";

// ------------------------------------------------------------------------------------------------
// Sub-components (Moved to top to prevent ReferenceError and ensure hoisting)
// ------------------------------------------------------------------------------------------------

function DashboardStatCard({ title, value, icon, color, desc, alert }: any) {
  const colorMap: any = {
    blue: { bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    emerald: { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
    amber: { bg: "bg-amber-500", light: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
    rose: { bg: "bg-rose-500", light: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
  };

  const selected = colorMap[color] || colorMap.blue;

  return (
    <motion.div whileHover={{ y: -5 }}>
      <Card className={`rounded-2xl border bg-white shadow-lg overflow-hidden ${alert ? 'ring-2 ring-rose-500/50' : ''}`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className={`p-4 rounded-xl ${selected.bg} text-white shadow-md`}>
              {icon}
            </div>
            {alert && (
              <Badge className="bg-rose-100 text-rose-700 animate-pulse border-none">تنبيه</Badge>
            )}
          </div>
          <div className="mt-4">
            <p className="text-slate-500 font-bold text-sm">{title}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{value}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">{desc}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AddVehicleCategoryDialog({ companyId }: { companyId: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await addVehicleCategory({
      company_id: companyId,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    });
    setLoading(false);
    if (res.success) {
      toast.success("تم إضافة الفئة بنجاح");
      setOpen(false);
    } else {
      toast.error("خطأ في إضافة الفئة");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-12 px-6 rounded-xl font-bold gap-2 text-slate-700 border-slate-300 hover:bg-slate-50">
          <Plus size={20} /> فئة مركبات جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">إضافة فئة مركبات</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-bold">اسم الفئة</Label>
            <Input id="name" name="name" placeholder="مثلاً: سيارات سيدان، شاحنات ثقيلة..." className="rounded-lg" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-bold">وصف إضافي</Label>
            <Input id="description" name="description" className="rounded-lg" />
          </div>
          <Button type="submit" className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold" disabled={loading}>
            {loading ? "جاري الإضافة..." : "حفظ الفئة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddCategoryDialog({ companyId }: { companyId: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await addSpareCategory({
      company_id: companyId,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    });
    setLoading(false);
    if (res.success) {
      toast.success("تم إضافة الفئة بنجاح");
      setOpen(false);
    } else {
      toast.error("خطأ في إضافة الفئة");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600">
          <Plus size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">إضافة فئة قطع غيار</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-bold">اسم الفئة</Label>
            <Input id="name" name="name" placeholder="مثلاً: فلاتر، إطارات..." className="rounded-lg" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-bold">وصف إضافي</Label>
            <Input id="description" name="description" className="rounded-lg" />
          </div>
          <Button type="submit" className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold" disabled={loading}>
            {loading ? "جاري الإضافة..." : "حفظ الفئة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddVehicleDialog({ companyId, employees, vehicleCategories }: any) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const res = await addVehicle({ ...data, company_id: companyId });
    setLoading(false);
    if (res.success) {
      toast.success("تم إضافة المركبة بنجاح");
      setOpen(false);
    } else {
      toast.error("خطأ في إضافة المركبة");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 px-8 rounded-xl font-bold gap-3 bg-emerald-600 hover:bg-emerald-700 shadow-lg transition-all">
          <Truck size={20} /> إضافة مركبة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">بيانات المركبة الجديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="font-bold text-xs">رقم اللوحة (عربي)</Label>
              <Input name="plate_number_ar" placeholder="أ ب ج 1234" className="rounded-lg" required />
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-xs">رقم اللوحة (انجليزي)</Label>
              <Input name="plate_number_en" placeholder="ABC 1234" className="rounded-lg" required />
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-xs">الماركة</Label>
              <Input name="brand" placeholder="تويوتا..." className="rounded-lg" required />
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-xs">الموديل</Label>
              <Input name="model" placeholder="هايلوكس..." className="rounded-lg" required />
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-xs">سنة الصنع</Label>
              <Input name="manufacture_year" type="number" className="rounded-lg" required />
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-xs">العداد الحالي (كم)</Label>
              <Input name="current_km" type="number" className="rounded-lg" required />
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-xs">فئة المركبة</Label>
              <Select name="category_id">
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleCategories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-xs">السائق المسؤول</Label>
              <Select name="driver_id">
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="اختر السائق" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>{emp.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold" disabled={loading}>
            {loading ? "جاري الحفظ..." : "إضافة المركبة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddSpareDialog({ companyId, categories }: any) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const res = await addSpare({ ...data, company_id: companyId });
    setLoading(false);
    if (res.success) {
      toast.success("تم إضافة القطعة بنجاح");
      setOpen(false);
    } else {
      toast.error("خطأ في إضافة القطعة");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-12 px-6 rounded-xl font-bold gap-2 text-slate-700 border-slate-300 hover:bg-slate-50">
          <Plus size={20} /> قطعة غيار جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">إضافة صنف للمخزون</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <Label className="font-bold text-xs">اسم القطعة</Label>
              <Input name="name" className="rounded-lg" required />
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-xs">كود القطعة</Label>
              <Input name="code" className="rounded-lg" />
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-xs">الفئة</Label>
              <Select name="category_id">
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-xs">الكمية الحالية</Label>
              <Input name="quantity" type="number" className="rounded-lg" required />
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-xs">الحد الأدنى</Label>
              <Input name="min_quantity" type="number" className="rounded-lg" defaultValue="5" />
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-xs">سعر التكلفة</Label>
              <Input name="unit_price" type="number" step="0.01" className="rounded-lg" required />
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-xs">سعر البيع</Label>
              <Input name="sale_price" type="number" step="0.01" className="rounded-lg" />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold" disabled={loading}>
            {loading ? "جاري الإضافة..." : "حفظ الصنف"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MaintenanceRequestDialog({ companyId, vehicles, spares }: any) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSpares, setSelectedSpares] = useState<any[]>([]);

  const totalCost = selectedSpares.reduce((sum, s) => sum + (s.quantity * s.unit_price), 0);

  function addSpareToRequest(spareId: string) {
    const spare = spares.find((s: any) => s.id.toString() === spareId);
    if (spare && !selectedSpares.find(s => s.id === spare.id)) {
      setSelectedSpares([...selectedSpares, { ...spare, quantity: 1 }]);
    }
  }

  function updateSpareQuantity(id: number, qty: number) {
    setSelectedSpares(selectedSpares.map(s => s.id === id ? { ...s, quantity: Math.max(1, qty) } : s));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      company_id: companyId,
      vehicle_id: parseInt(formData.get("vehicle_id") as string),
      maintenance_person: formData.get("maintenance_person") as string,
      maintenance_date: formData.get("maintenance_date") as string,
      current_km: parseInt(formData.get("current_km") as string),
      notes: formData.get("notes") as string,
      total_cost: totalCost,
    };

    const res = await createMaintenanceRequest(data, selectedSpares);
    setLoading(false);
    if (res.success) {
      toast.success("تم إنشاء طلب الصيانة وتحديث المخزون");
      setOpen(false);
      setSelectedSpares([]);
    } else {
      toast.error("خطأ في معالجة طلب الصيانة");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 px-8 rounded-xl font-bold gap-3 bg-blue-600 hover:bg-blue-700 shadow-lg transition-all">
          <Wrench size={20} /> طلب صيانة جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">إنشاء أمر صيانة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="font-bold text-xs">المركبة</Label>
              <Select name="vehicle_id" required>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="اختر المركبة" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v: any) => (
                    <SelectItem key={v.id} value={v.id.toString()}>{v.plate_number_ar} ({v.brand})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-xs">الفني المسؤول</Label>
              <Input name="maintenance_person" className="rounded-lg" placeholder="اسم الفني" required />
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-xs">التاريخ</Label>
              <Input name="maintenance_date" type="date" className="rounded-lg" defaultValue={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-xs">قراءة العداد</Label>
              <Input name="current_km" type="number" className="rounded-lg" placeholder="كم" required />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Package size={16} className="text-blue-500" /> قطع الغيار المستخدمة
            </h4>
            <Select onValueChange={addSpareToRequest}>
              <SelectTrigger className="rounded-lg bg-white">
                <SelectValue placeholder="أضف قطع غيار..." />
              </SelectTrigger>
              <SelectContent>
                {spares.map((s: any) => (
                  <SelectItem key={s.id} value={s.id.toString()} disabled={s.quantity <= 0}>
                    {s.name} ({s.quantity} متوفر)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ScrollArea className="h-[120px] w-full rounded-lg border bg-white p-2">
              {selectedSpares.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 border-b last:border-0">
                  <span className="font-bold text-xs text-slate-700">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      className="w-12 h-7 text-center text-xs rounded-md" 
                      value={s.quantity} 
                      onChange={(e) => updateSpareQuantity(s.id, parseInt(e.target.value))}
                    />
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-500" onClick={() => setSelectedSpares(selectedSpares.filter(item => item.id !== s.id))}>
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              ))}
              {selectedSpares.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-300 italic text-xs">لم يتم اختيار قطع غيار</div>
              )}
            </ScrollArea>
            
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-500">الإجمالي:</span>
              <span className="text-xl font-black text-emerald-600">{totalCost.toLocaleString()} <small className="text-xs">SAR</small></span>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="font-bold text-xs">ملاحظات</Label>
            <Input name="notes" className="rounded-lg" placeholder="وصف الأعمال..." />
          </div>

          <Button type="submit" className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ طلب الصيانة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteMaintenanceDialog({ id, onDeleted }: { id: number, onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await deleteMaintenanceRequest(id);
    setLoading(false);
    if (res.success) {
      toast.success("تم حذف الطلب وإعادة قطع الغيار للمخزون");
      onDeleted();
      setOpen(false);
    } else {
      toast.error("خطأ في حذف الطلب");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all">
          <Trash2 size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-8 text-center text-white">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10 }}>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl mx-auto flex items-center justify-center mb-4">
              <Trash2 size={40} />
            </div>
          </motion.div>
          <h2 className="text-2xl font-black mb-2">تأكيد الحذف</h2>
          <p className="text-white/80 font-medium text-sm">هل أنت متأكد من رغبتك في حذف هذا الطلب؟ سيتم استرجاع قطع الغيار المستخدمة إلى المخزون تلقائياً.</p>
        </div>
        <div className="p-8 bg-white flex flex-col gap-3">
          <Button 
            className="h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-lg shadow-xl shadow-rose-200"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "جاري الحذف..." : "نعم، حذف الطلب"}
          </Button>
          <Button 
            variant="ghost" 
            className="h-12 rounded-xl font-black text-slate-500 hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const MaintenanceReceipt = React.forwardRef<HTMLDivElement, { data: any, details: any[], companyName: string }>(({ data, details, companyName }, ref) => {
  if (!data) return null;

  const taxRate = 0.15;
  const subtotal = data.total_cost;
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  return (
    <div ref={ref} className="p-16 bg-white min-h-[1100px] relative font-sans text-slate-900" dir="rtl">
      {/* Aesthetic Border */}
      <div className="absolute inset-0 border-[16px] border-slate-50 pointer-events-none"></div>
      <div className="absolute top-0 right-0 left-0 h-2 bg-slate-900"></div>
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-16 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Wrench size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900">{companyName}</h1>
              <p className="text-blue-600 font-black text-sm uppercase tracking-widest">Maintenance Division</p>
            </div>
          </div>
        </div>
        <div className="text-left">
          <h2 className="text-5xl font-black text-slate-100 absolute -left-4 -top-6 select-none">INVOICE</h2>
          <div className="relative z-10 space-y-2">
            <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl">
              <p className="text-[10px] font-bold opacity-50 uppercase mb-1">Receipt Number</p>
              <p className="text-2xl font-black tracking-widest">#{data.id.toString().padStart(6, '0')}</p>
            </div>
            <p className="text-slate-400 font-bold text-xs mt-2">تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')}</p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-12 mb-16">
        <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-6">
          <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
            <Car size={14} /> تفاصيل المركبة
          </h3>
          <div className="grid grid-cols-2 gap-y-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">رقم اللوحة</p>
              <p className="text-xl font-black text-slate-800">{data.plate_number_ar}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">النوع / الموديل</p>
              <p className="text-lg font-bold text-slate-800">{data.brand} {data.model}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">العداد الحالي</p>
              <p className="text-lg font-black text-slate-800">{data.current_km.toLocaleString()} <small className="text-[10px] opacity-50">KM</small></p>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-6">
          <h3 className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-2">
            <History size={14} /> بيانات الصيانة
          </h3>
          <div className="grid grid-cols-2 gap-y-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">الفني المسؤول</p>
              <p className="text-lg font-bold text-slate-800">{data.maintenance_person}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">تاريخ الخدمة</p>
              <p className="text-lg font-bold text-slate-800">{new Date(data.maintenance_date).toLocaleDateString('ar-SA')}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-black text-slate-400 uppercase">ملاحظات الفني</p>
              <p className="text-sm font-medium text-slate-600 italic leading-relaxed">{data.notes || "لا توجد ملاحظات إضافية"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Spares Table */}
      <div className="mb-16">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 mr-4 flex items-center gap-2">
          <Package size={14} /> بيان قطع الغيار المستخدمة والأعمال
        </h3>
        <div className="rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-5 px-8 text-right font-black text-xs uppercase tracking-wider">الصنف / الوصف</th>
                <th className="py-5 px-4 text-center font-black text-xs uppercase tracking-wider">الكمية</th>
                <th className="py-5 px-4 text-center font-black text-xs uppercase tracking-wider">السعر</th>
                <th className="py-5 px-8 text-left font-black text-xs uppercase tracking-wider">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {details && details.length > 0 ? (
                details.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-6 px-8">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800">{item.spare_name}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{item.spare_code}</span>
                      </div>
                    </td>
                    <td className="py-6 px-4 text-center font-black text-slate-600">{item.quantity_used}</td>
                    <td className="py-6 px-4 text-center font-bold text-slate-600">{Number(item.unit_price).toFixed(2)}</td>
                    <td className="py-6 px-8 text-left font-black text-slate-900">{Number(item.total_price).toFixed(2)} <small className="text-[8px] opacity-30">SAR</small></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-10 px-8">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800">أعمال صيانة وإصلاح متنوعة</span>
                      <span className="text-[10px] font-bold text-slate-400">شاملة قطع الغيار واليد العاملة</span>
                    </div>
                  </td>
                  <td className="py-10 px-4 text-center font-black text-slate-600">1</td>
                  <td className="py-10 px-4 text-center font-bold text-slate-600">{subtotal.toFixed(2)}</td>
                  <td className="py-10 px-8 text-left font-black text-slate-900">{subtotal.toFixed(2)} <small className="text-[8px] opacity-30">SAR</small></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary & Totals */}
      <div className="flex justify-between items-end mb-24">
        <div className="w-1/2 space-y-6">
          <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100/50">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">إخلاء المسؤولية</h4>
            <p className="text-[10px] leading-relaxed text-blue-800 font-medium">هذا المستند يعتبر إيصالاً رسمياً لعملية الصيانة المذكورة أعلاه. تضمن الشركة جودة الإصلاح وفقاً للمعايير المتبعة. يرجى الاحتفاظ بهذا الإيصال للمراجعة الدورية.</p>
          </div>
        </div>

        <div className="w-80 space-y-4">
          <div className="flex justify-between items-center px-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">المجموع الفرعي</span>
            <span className="text-lg font-bold text-slate-700">{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center px-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">ضريبة القيمة المضافة (15%)</span>
            <span className="text-lg font-bold text-slate-700">{taxAmount.toFixed(2)}</span>
          </div>
          <div className="h-px bg-slate-100 mx-4"></div>
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">الإجمالي النهائي</span>
              <span className="text-xs font-bold">TOTAL AMOUNT</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-3xl font-black">{grandTotal.toFixed(2)}</span>
              <span className="text-[10px] font-black opacity-50">SAR / ريال سعودي</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Signatures */}
      <div className="grid grid-cols-3 gap-16 text-center border-t border-slate-100 pt-16">
        <div className="space-y-6">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">اعتماد المدير الفني</p>
          <div className="h-20 flex items-center justify-center italic text-slate-300 font-serif border-b border-dashed border-slate-200">
            Technical Approval
          </div>
        </div>
        <div className="space-y-6">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">توقيع السلم المستلم</p>
          <div className="h-20 border-b border-dashed border-slate-200 flex items-center justify-center">
            <User size={24} className="opacity-10" />
          </div>
        </div>
        <div className="relative">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest relative z-10">ختم الاعتماد الرسمي</p>
          <div className="h-20 border-b border-dashed border-slate-200"></div>
        </div>
      </div>
    </div>
  );
});

MaintenanceReceipt.displayName = "MaintenanceReceipt";

// ------------------------------------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------------------------------------

export function FleetClient({ 
  initialVehicles, 
  initialSpares, 
  categories, 
  vehicleCategories,
  initialMaintenance, 
  employees,
  companyId,
  companyName
}: FleetClientProps) {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [spares, setSpares] = useState(initialSpares);
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [selectedMaintenanceDetails, setSelectedMaintenanceDetails] = useState<any[]>([]);
  
  useEffect(() => { setVehicles(initialVehicles); }, [initialVehicles]);
  useEffect(() => { setSpares(initialSpares); }, [initialSpares]);
  useEffect(() => { setMaintenance(initialMaintenance); }, [initialMaintenance]);
  
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const totalVehicles = vehicles.length;
  const totalSpares = spares.length;
  const lowStockCount = spares.filter(s => s.quantity <= (s.min_quantity || 0)).length;
  const pendingMaintenance = maintenance.filter(m => m.status === 'pending').length;

  const filteredVehicles = vehicles.filter(v => 
    v.plate_number_ar?.includes(searchQuery) || 
    v.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* Colorful Header */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right">
            <h1 className="text-3xl font-black">إدارة الأسطول والمخزون</h1>
            <p className="text-blue-100 mt-2">مرحباً بك في لوحة تحكم الأسطول لشركة {companyName}</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            <AddVehicleCategoryDialog companyId={companyId} />
            <AddCategoryDialog companyId={companyId} />
            <AddVehicleDialog 
              companyId={companyId} 
              employees={employees} 
              vehicleCategories={vehicleCategories}
            />
            <AddSpareDialog 
              companyId={companyId} 
              categories={categories} 
            />
            <MaintenanceRequestDialog 
              companyId={companyId} 
              vehicles={vehicles} 
              spares={spares} 
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-center mb-6">
          <TabsList className="bg-white p-1 rounded-2xl shadow-md border border-slate-200 h-14">
            <TabsTrigger value="dashboard" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold">لوحة التحكم</TabsTrigger>
            <TabsTrigger value="vehicles" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold">المركبات</TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold">المخزون</TabsTrigger>
            <TabsTrigger value="maintenance" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold">الصيانة</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DashboardStatCard title="إجمالي الأسطول" value={totalVehicles} icon={<Car size={28} />} color="blue" desc="مركبة" />
            <DashboardStatCard title="قطع الغيار" value={totalSpares} icon={<Box size={28} />} color="emerald" desc="صنف" />
            <DashboardStatCard title="تنبيهات المخزون" value={lowStockCount} icon={<AlertTriangle size={28} />} color="amber" desc="صنف ناقص" alert={lowStockCount > 0} />
            <DashboardStatCard title="طلبات الصيانة" value={pendingMaintenance} icon={<FileCheck size={28} />} color="rose" desc="طلب" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl shadow-md border-none overflow-hidden">
              <CardHeader className="bg-slate-50 border-b p-4">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <History className="text-blue-600" size={20} /> آخر عمليات الصيانة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">المركبة</TableHead>
                      <TableHead className="font-bold">التاريخ</TableHead>
                      <TableHead className="font-bold">التكلفة</TableHead>
                      <TableHead className="font-bold">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenance.slice(0, 5).map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-black">{m.plate_number_ar}</TableCell>
                        <TableCell className="text-slate-500">{new Date(m.maintenance_date).toLocaleDateString('ar-SA')}</TableCell>
                        <TableCell className="font-bold text-emerald-600">{m.total_cost} SAR</TableCell>
                        <TableCell>
                          <Badge className={m.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}>
                            {m.status === 'pending' ? 'قيد الانتظار' : 'مكتمل'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-md border-none overflow-hidden">
              <CardHeader className="bg-slate-50 border-b p-4">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <AlertTriangle className="text-rose-600" size={20} /> نقص في المخزون
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">القطعة</TableHead>
                      <TableHead className="font-bold">المخزون</TableHead>
                      <TableHead className="font-bold">الحد الأدنى</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spares.filter(s => s.quantity <= (s.min_quantity || 0)).slice(0, 5).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-bold">{s.name}</TableCell>
                        <TableCell><Badge variant="destructive">{s.quantity}</Badge></TableCell>
                        <TableCell className="font-bold text-slate-400">{s.min_quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card className="rounded-2xl shadow-md border-none overflow-hidden">
            <CardHeader className="bg-white border-b p-6 flex flex-row items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="بحث عن مركبة..." 
                  className="pr-10 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-black">لوحة المركبة</TableHead>
                    <TableHead className="font-black">النوع والموديل</TableHead>
                    <TableHead className="font-black">السائق</TableHead>
                    <TableHead className="font-black">العداد</TableHead>
                    <TableHead className="font-black text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((v) => (
                    <TableRow key={v.id} className="hover:bg-slate-50 transition-all">
                      <TableCell>
                        <div className="h-10 w-14 border-2 border-slate-900 rounded-md bg-white flex flex-col items-center justify-center font-black">
                          <span className="text-xs leading-none">{v.plate_number_ar}</span>
                          <span className="text-[8px] text-slate-400">{v.plate_number_en}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">{v.brand}</span>
                          <span className="text-xs text-slate-400">{v.model} - {v.manufacture_year}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-600">{v.driver_name || '---'}</TableCell>
                      <TableCell className="font-black">{v.current_km?.toLocaleString()} <small className="text-slate-400">KM</small></TableCell>
                      <TableCell className="text-left">
                        <Button variant="ghost" size="icon" className="text-rose-500 hover:bg-rose-50" onClick={() => {
                          if(confirm('هل أنت متأكد من حذف هذه المركبة؟')) {
                            deleteVehicle(v.id).then(() => toast.success('تم حذف المركبة'));
                          }
                        }}>
                          <Trash2 size={18} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="rounded-2xl shadow-md border-none p-4 h-fit">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-black text-sm flex items-center gap-2"><Layers size={16} /> الفئات</h3>
                <AddCategoryDialog companyId={companyId} />
              </div>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start font-bold bg-blue-50 text-blue-700 rounded-xl">الكل</Button>
                {categories.map(cat => (
                  <Button key={cat.id} variant="ghost" className="w-full justify-start text-slate-600 font-bold rounded-xl">{cat.name}</Button>
                ))}
              </div>
            </Card>
            
            <Card className="md:col-span-3 rounded-2xl shadow-md border-none overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-black">القطعة</TableHead>
                      <TableHead className="font-black">الفئة</TableHead>
                      <TableHead className="font-black">الكمية</TableHead>
                      <TableHead className="font-black">التكلفة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spares.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-bold">{s.name}</TableCell>
                        <TableCell><Badge variant="outline">{s.category_name || 'بدون'}</Badge></TableCell>
                        <TableCell>
                          <span className={`font-black ${s.quantity <= (s.min_quantity || 0) ? 'text-rose-600' : 'text-slate-900'}`}>{s.quantity}</span>
                        </TableCell>
                        <TableCell className="font-bold">{s.unit_price} SAR</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card className="rounded-2xl shadow-md border-none overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-black">رقم الطلب</TableHead>
                    <TableHead className="font-black">المركبة</TableHead>
                    <TableHead className="font-black">الفني</TableHead>
                    <TableHead className="font-black">التاريخ</TableHead>
                    <TableHead className="font-black">التكلفة</TableHead>
                    <TableHead className="font-black">الحالة</TableHead>
                    <TableHead className="font-black text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenance.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-slate-400">#{m.id.toString().padStart(6, '0')}</TableCell>
                      <TableCell className="font-black">{m.plate_number_ar}</TableCell>
                      <TableCell className="font-bold">{m.maintenance_person}</TableCell>
                      <TableCell>{new Date(m.maintenance_date).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell className="font-black text-emerald-600">{m.total_cost} SAR</TableCell>
                      <TableCell>
                        <Badge className={m.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}>
                          {m.status === 'pending' ? 'قيد الانتظار' : 'مكتمل'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 text-blue-600 hover:bg-blue-50"
                            onClick={async () => {
                              setSelectedMaintenance(m);
                              const res = await getMaintenanceDetails(m.id);
                              if (res.success) {
                                setSelectedMaintenanceDetails(res.details || []);
                              }
                              setTimeout(() => handlePrint(), 500);
                            }}
                          >
                            <Printer size={18} />
                          </Button>
                          <DeleteMaintenanceDialog id={m.id} onDeleted={() => {
                            setMaintenance(prev => prev.filter(item => item.id !== m.id));
                          }} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hidden Print Content */}
      <div className="opacity-0 pointer-events-none absolute -z-50 overflow-hidden h-0 w-0">
        <MaintenanceReceipt ref={printRef} data={selectedMaintenance} details={selectedMaintenanceDetails} companyName={companyName} />
      </div>
    </div>
  );
}

interface FleetClientProps {
  initialVehicles: any[];
  initialSpares: any[];
  categories: any[];
  vehicleCategories: any[];
  initialMaintenance: any[];
  employees: any[];
  companyId: number;
  companyName: string;
}
