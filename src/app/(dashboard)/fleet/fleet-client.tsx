"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  FileCheck,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  PlusCircle,
  ShieldCheck,
  Gauge,
  Mail,
  Send,
  Eye,
  Loader2
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
import { cn } from "@/lib/utils";

// ------------------------------------------------------------------------------------------------
// Sub-components
// ------------------------------------------------------------------------------------------------

function DashboardStatCard({ title, value, icon, color, desc, alert }: any) {
  const colorMap: any = {
    blue: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/20",
    emerald: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/20",
    amber: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/20",
    rose: "from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/20",
  };

  const selected = colorMap[color] || colorMap.blue;

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className={cn(
        "relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border shadow-2xl transition-all group",
        selected
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
          {React.cloneElement(icon, { size: 24 })}
        </div>
        {alert && (
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        )}
      </div>
      <div>
        <p className="text-white/50 font-black text-[10px] uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white tracking-tight">{value}</span>
          <span className="text-[10px] font-black opacity-40 uppercase">{desc}</span>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {React.cloneElement(icon, { size: 80 })}
      </div>
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
        <button className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white font-black text-sm hover:bg-white/20 transition-all shadow-xl active:scale-95">
          <Layers size={18} />
          فئة مركبات جديدة
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] bg-slate-900 text-white border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">إضافة فئة مركبات</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">اسم الفئة</Label>
            <Input name="name" placeholder="مثلاً: سيارات سيدان..." className="bg-white/5 border-white/10 rounded-xl h-12 text-white" required />
          </div>
          <div className="space-y-2">
            <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">وصف إضافي</Label>
            <Input name="description" className="bg-white/5 border-white/10 rounded-xl h-12 text-white" />
          </div>
          <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-lg shadow-xl shadow-blue-500/20" disabled={loading}>
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
        <button className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white font-black text-sm hover:bg-white/20 transition-all shadow-xl active:scale-95">
          <Tag size={18} />
          فئة قطع غيار
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] bg-slate-900 text-white border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">إضافة فئة قطع غيار</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">اسم الفئة</Label>
            <Input name="name" placeholder="مثلاً: فلاتر..." className="bg-white/5 border-white/10 rounded-xl h-12 text-white" required />
          </div>
          <div className="space-y-2">
            <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">وصف إضافي</Label>
            <Input name="description" className="bg-white/5 border-white/10 rounded-xl h-12 text-white" />
          </div>
          <Button type="submit" className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-lg shadow-xl shadow-emerald-500/20" disabled={loading}>
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
        <button className="flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white font-black text-sm rounded-2xl hover:bg-emerald-600 transition-all shadow-xl active:scale-95">
          <Truck size={18} />
          إضافة مركبة
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] bg-slate-900 text-white border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black">بيانات المركبة الجديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">رقم اللوحة (عربي)</Label>
              <Input name="plate_number_ar" placeholder="أ ب ج 1234" className="bg-white/5 border-white/10 rounded-xl h-12 text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">رقم اللوحة (انجليزي)</Label>
              <Input name="plate_number_en" placeholder="ABC 1234" className="bg-white/5 border-white/10 rounded-xl h-12 text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">الماركة</Label>
              <Input name="brand" placeholder="تويوتا..." className="bg-white/5 border-white/10 rounded-xl h-12 text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">الموديل</Label>
              <Input name="model" placeholder="هايلوكس..." className="bg-white/5 border-white/10 rounded-xl h-12 text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">سنة الصنع</Label>
              <Input name="manufacture_year" type="number" className="bg-white/5 border-white/10 rounded-xl h-12 text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">العداد الحالي (كم)</Label>
              <Input name="current_km" type="number" className="bg-white/5 border-white/10 rounded-xl h-12 text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">فئة المركبة</Label>
              <Select name="category_id">
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-white">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  {vehicleCategories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">السائق المسؤول</Label>
              <Select name="driver_id">
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-white">
                  <SelectValue placeholder="اختر السائق" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-lg shadow-xl shadow-emerald-500/20" disabled={loading}>
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
        <button className="flex items-center gap-3 px-6 py-3 bg-blue-500 text-white font-black text-sm rounded-2xl hover:bg-blue-600 transition-all shadow-xl active:scale-95">
          <Box size={18} />
          إضافة صنف مخزون
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] bg-slate-900 text-white border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">إضافة صنف للمخزون</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">اسم القطعة</Label>
              <Input name="name" className="bg-white/5 border-white/10 rounded-xl h-12 text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">كود القطعة</Label>
              <Input name="code" className="bg-white/5 border-white/10 rounded-xl h-12 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">الفئة</Label>
              <Select name="category_id">
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-white">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">الكمية الحالية</Label>
              <Input name="quantity" type="number" className="bg-white/5 border-white/10 rounded-xl h-12 text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">الحد الأدنى</Label>
              <Input name="min_quantity" type="number" className="bg-white/5 border-white/10 rounded-xl h-12 text-white" defaultValue="5" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">سعر التكلفة</Label>
              <Input name="unit_price" type="number" step="0.01" className="bg-white/5 border-white/10 rounded-xl h-12 text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">سعر البيع</Label>
              <Input name="sale_price" type="number" step="0.01" className="bg-white/5 border-white/10 rounded-xl h-12 text-white" />
            </div>
          </div>
          <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-lg shadow-xl shadow-blue-500/20" disabled={loading}>
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
        <button className="flex items-center gap-3 px-6 py-3 bg-amber-500 text-white font-black text-sm rounded-2xl hover:bg-amber-600 transition-all shadow-xl active:scale-95">
          <Wrench size={18} />
          أمر صيانة
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] bg-slate-900 text-white border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black">إنشاء أمر صيانة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">المركبة</Label>
              <Select name="vehicle_id" required>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-white">
                  <SelectValue placeholder="اختر المركبة" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  {vehicles.map((v: any) => (
                    <SelectItem key={v.id} value={v.id.toString()}>{v.plate_number_ar} ({v.brand})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">الفني المسؤول</Label>
              <Input name="maintenance_person" className="bg-white/5 border-white/10 rounded-xl h-12 text-white" placeholder="اسم الفني" required />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">التاريخ</Label>
              <Input name="maintenance_date" type="date" className="bg-white/5 border-white/10 rounded-xl h-12 text-white" defaultValue={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">قراءة العداد</Label>
              <Input name="current_km" type="number" className="bg-white/5 border-white/10 rounded-xl h-12 text-white" placeholder="كم" required />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
            <h4 className="font-black text-white/70 text-sm flex items-center gap-2">
              <Package size={18} className="text-amber-400" /> قطع الغيار المستخدمة
            </h4>
            <Select onValueChange={addSpareToRequest}>
              <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-white">
                <SelectValue placeholder="أضف قطع غيار..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                {spares.map((s: any) => (
                  <SelectItem key={s.id} value={s.id.toString()} disabled={s.quantity <= 0}>
                    {s.name} ({s.quantity} متوفر)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ScrollArea className="h-[150px] w-full rounded-2xl border border-white/10 bg-black/20 p-4">
              <AnimatePresence>
                {selectedSpares.map(s => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    key={s.id} 
                    className="flex items-center justify-between p-3 border-b border-white/5 last:border-0"
                  >
                    <div className="flex flex-col">
                      <span className="font-black text-sm text-white">{s.name}</span>
                      <span className="text-[10px] text-white/30 font-mono tracking-widest">{s.code}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input 
                        type="number" 
                        className="w-16 h-8 text-center bg-white/5 border-white/10 rounded-lg text-white font-black" 
                        value={s.quantity} 
                        onChange={(e) => updateSpareQuantity(s.id, parseInt(e.target.value))}
                      />
                      <button onClick={() => setSelectedSpares(selectedSpares.filter(item => item.id !== s.id))} className="text-rose-400 hover:text-rose-300 p-1">
                        <X size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {selectedSpares.length === 0 && (
                <div className="h-full flex items-center justify-center text-white/20 italic text-sm">لم يتم اختيار قطع غيار</div>
              )}
            </ScrollArea>
            
            <div className="flex justify-between items-center bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
              <span className="font-black text-emerald-400/70 text-sm">التكلفة الإجمالية</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400">{totalCost.toLocaleString()}</span>
                <span className="text-xs font-black text-emerald-400/50 uppercase tracking-widest">SAR</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/60 font-black text-[10px] uppercase tracking-widest">ملاحظات</Label>
            <Input name="notes" className="bg-white/5 border-white/10 rounded-xl h-12 text-white" placeholder="وصف الأعمال..." />
          </div>

          <Button type="submit" className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 font-black text-lg shadow-xl shadow-amber-500/20" disabled={loading}>
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
        <button className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95">
          <Trash2 size={18} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] bg-slate-900 p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-rose-600 to-rose-700 p-10 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10 }}>
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] mx-auto flex items-center justify-center mb-6 border border-white/30 shadow-2xl">
              <AlertTriangle size={48} className="text-white animate-pulse" />
            </div>
          </motion.div>
          <h2 className="text-3xl font-black mb-3 tracking-tight">تأكيد الحذف</h2>
          <p className="text-rose-100 font-medium text-sm leading-relaxed">هل أنت متأكد من رغبتك في حذف هذا الطلب؟ سيتم استرجاع قطع الغيار المستخدمة إلى المخزون تلقائياً.</p>
        </div>
        <div className="p-10 bg-slate-900 flex flex-col gap-4">
          <Button 
            className="h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xl shadow-xl shadow-rose-900/50 transition-all active:scale-95"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "جاري الحذف..." : "نعم، حذف الطلب"}
          </Button>
          <Button 
            variant="ghost" 
            className="h-14 rounded-2xl font-black text-slate-400 hover:bg-white/5 text-lg"
            onClick={() => setOpen(false)}
          >
            إلغاء العملية
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const MaintenanceReceipt = React.forwardRef<HTMLDivElement, { data: any, details: any[], companyName: string }>(({ data, details, companyName }, ref) => {
  const taxRate = 0.15;
  const subtotal = Number(data?.total_cost || 0);
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  return (
    <div ref={ref}>
      {!data ? null : (
        <div className="p-16 bg-white min-h-[1100px] relative font-sans text-slate-900" dir="rtl">
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
                <p className="text-slate-400 font-bold text-xs mt-2">تاريخ الإصدار: {new Date().toLocaleDateString('en-GB')}</p>
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
                  <p className="text-lg font-bold text-slate-800">{new Date(data.maintenance_date).toLocaleDateString('en-GB')}</p>
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
      )}
    </div>
  );
});

MaintenanceReceipt.displayName = "MaintenanceReceipt";

function ViewPrintEmailDialog({ 
  maintenance, 
  companyId, 
  companyName,
  companyEmail,
  onClose 
}: { 
  maintenance: any; 
  companyId: number; 
  companyName: string;
  companyEmail: string;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [details, setDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailMode, setEmailMode] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadDetails() {
      const res = await getMaintenanceDetails(maintenance.id);
      if (res.success) {
        setDetails(res.details || []);
      }
      setLoading(false);
    }
    loadDetails();
  }, [maintenance.id]);

    const handlePrintNow = useCallback(() => {
      if (printRef.current) {
        const printContent = printRef.current.innerHTML;
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl">
              <head>
                <title>طباعة أمر الصيانة #${maintenance.id}</title>
                <style>
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; direction: rtl; }
                  @page { size: A4; margin: 0; }
                  @media print {
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                  }
                </style>
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
              </head>
              <body></body>
            </html>
          `);
          printWindow.document.body.innerHTML = printContent;
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
        }
      }
    }, [maintenance.id]);

  const handleSendEmail = async () => {
      if (!emailTo.trim()) {
        toast.error("الرجاء إدخال البريد الإلكتروني");
        return;
      }
      
      setSendingEmail(true);
      try {
        const sparesList = details.length > 0 
          ? details.map(item => `<tr><td style="padding: 12px; border: 1px solid #e2e8f0;">${item.spare_name}</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">${item.spare_code || '-'}</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">${item.quantity_used}</td></tr>`).join('')
          : '<tr><td colspan="3" style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">أعمال صيانة عامة</td></tr>';

        const emailBody = `
          <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f59e0b; color: white; padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px;">${companyName}</h1>
              <p style="margin: 5px 0 0; opacity: 0.9;">أمر صيانة</p>
            </div>
            
            <div style="background: #fef3c7; border: 2px solid #fcd34d; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">هذا أمر صيانة رسمي. يرجى تنفيذ الأعمال المطلوبة وفقاً للتعليمات.</p>
            </div>
            
            <h2 style="color: #1e293b; margin-bottom: 15px;">أمر صيانة #${maintenance.id.toString().padStart(6, '0')}</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr style="background: #f8fafc;">
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">المركبة</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">${maintenance.plate_number_ar} - ${maintenance.brand} ${maintenance.model}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">الفني المسؤول</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">${maintenance.maintenance_person}</td>
              </tr>
              <tr style="background: #f8fafc;">
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">تاريخ التنفيذ</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">${new Date(maintenance.maintenance_date).toLocaleDateString('en-GB')}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">قراءة العداد</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">${maintenance.current_km?.toLocaleString()} كم</td>
              </tr>
            </table>
            
            <h3 style="color: #1e293b; margin-bottom: 10px;">قطع الغيار المطلوبة:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr style="background: #1e293b; color: white;">
                <th style="padding: 12px; text-align: right;">الصنف</th>
                <th style="padding: 12px; text-align: center;">الكود</th>
                <th style="padding: 12px; text-align: center;">الكمية</th>
              </tr>
              ${sparesList}
            </table>
            
            ${maintenance.notes ? `<div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 12px; margin-bottom: 20px;"><p style="margin: 0; color: #1e40af;"><strong>تعليمات:</strong> ${maintenance.notes}</p></div>` : ''}
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px;">تم إرسال هذا البريد من نظام ${companyName} لإدارة الأسطول</p>
            </div>
          </div>
        `;

        const response = await fetch('/api/fleet/send-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: emailTo,
            subject: `أمر صيانة #${maintenance.id.toString().padStart(6, '0')} - ${companyName}`,
            html: emailBody,
          }),
        });

      const result = await response.json();
      if (result.success) {
        toast.success("تم إرسال البريد الإلكتروني بنجاح");
        setEmailMode(false);
        setEmailTo("");
      } else {
        toast.error(result.error || "حدث خطأ في إرسال البريد");
      }
    } catch {
      toast.error("حدث خطأ في إرسال البريد الإلكتروني");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const taxRate = 0.15;
  const subtotal = Number(maintenance?.total_cost || 0);
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] rounded-[2rem] bg-slate-900 text-white border-white/10 p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-white/10 bg-white/5">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-xl">
                <FileText className="text-amber-400" size={24} />
              </div>
              أمر صيانة #{maintenance.id.toString().padStart(6, '0')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-3 p-4 border-b border-white/10 bg-white/5">
          <Button 
            onClick={handlePrintNow}
            className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-black gap-2"
          >
            <Printer size={18} />
            طباعة
          </Button>
          <Button 
            onClick={() => setEmailMode(!emailMode)}
            variant={emailMode ? "secondary" : "outline"}
            className={cn(
              "flex-1 h-12 rounded-xl font-black gap-2",
              emailMode ? "bg-emerald-600 hover:bg-emerald-700 text-white border-none" : "border-white/20 text-white hover:bg-white/10"
            )}
          >
            <Mail size={18} />
            إرسال بالبريد
          </Button>
        </div>

        {emailMode && (
          <div className="p-4 border-b border-white/10 bg-emerald-500/5">
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="أدخل البريد الإلكتروني..."
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className="flex-1 bg-white/5 border-white/10 rounded-xl h-12 text-white"
              />
              <Button
                onClick={handleSendEmail}
                disabled={sendingEmail || !emailTo.trim()}
                className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black gap-2"
              >
                {sendingEmail ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                إرسال
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => setEmailTo(companyEmail)}
                className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-white/70 hover:bg-white/20 transition-all"
              >
                إيميل الشركة ({companyEmail || "غير متوفر"})
              </button>
            </div>
          </div>
        )}

        <ScrollArea className="max-h-[50vh] p-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={40} className="animate-spin text-white/30" />
            </div>
          ) : (
            <div ref={printRef} className="bg-white rounded-2xl overflow-hidden">
                <div className="p-12 bg-white min-h-[800px] relative font-sans text-slate-900" dir="rtl">
                  <div className="absolute top-0 right-0 left-0 h-2 bg-amber-500"></div>
                  
                  <div className="flex justify-between items-start mb-12 relative z-10">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-xl">
                          <Wrench size={28} />
                        </div>
                        <div>
                          <h1 className="text-3xl font-black tracking-tight text-slate-900">{companyName}</h1>
                          <p className="text-amber-600 font-black text-sm uppercase tracking-widest">أمر صيانة</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="bg-amber-500 text-white px-5 py-2 rounded-xl shadow-xl">
                        <p className="text-[10px] font-bold opacity-70 uppercase mb-1">رقم الأمر</p>
                        <p className="text-xl font-black tracking-widest">#{maintenance.id.toString().padStart(6, '0')}</p>
                      </div>
                      <p className="text-slate-400 font-bold text-xs mt-2">تاريخ الإصدار: {new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-8">
                    <h3 className="text-amber-700 font-black text-lg mb-2 flex items-center gap-2">
                      <AlertTriangle size={20} />
                      تعليمات للفني المسؤول
                    </h3>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      هذا أمر صيانة رسمي صادر من الإدارة. يرجى تنفيذ الأعمال المطلوبة وفقاً للتعليمات أدناه والتأكد من استخدام القطع المحددة فقط.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                      <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Car size={14} /> تفاصيل المركبة
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">رقم اللوحة</p>
                          <p className="text-lg font-black text-slate-800">{maintenance.plate_number_ar}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">النوع / الموديل</p>
                          <p className="text-base font-bold text-slate-800">{maintenance.brand} {maintenance.model}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">قراءة العداد</p>
                          <p className="text-base font-black text-slate-800">{maintenance.current_km?.toLocaleString()} <small className="text-[10px] opacity-50">KM</small></p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                      <h3 className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <History size={14} /> بيانات أمر الصيانة
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">الفني المسؤول</p>
                          <p className="text-base font-bold text-slate-800">{maintenance.maintenance_person}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">تاريخ التنفيذ</p>
                          <p className="text-base font-bold text-slate-800">{new Date(maintenance.maintenance_date).toLocaleDateString('en-GB')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 mr-4 flex items-center gap-2">
                      <Package size={14} /> قطع الغيار المطلوبة للصيانة
                    </h3>
                    <div className="rounded-2xl border border-slate-100 overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-900 text-white">
                            <th className="py-4 px-6 text-right font-black text-xs uppercase tracking-wider">الصنف / الوصف</th>
                            <th className="py-4 px-4 text-center font-black text-xs uppercase tracking-wider">الكود</th>
                            <th className="py-4 px-4 text-center font-black text-xs uppercase tracking-wider">الكمية المطلوبة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {details && details.length > 0 ? (
                            details.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-6">
                                  <span className="font-black text-slate-800">{item.spare_name}</span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">{item.spare_code || '-'}</span>
                                </td>
                                <td className="py-4 px-4 text-center font-black text-slate-800">{item.quantity_used}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="py-6 px-6 text-center text-slate-500">
                                أعمال صيانة عامة بدون قطع غيار محددة
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {maintenance.notes && (
                    <div className="mb-8 p-6 rounded-2xl bg-blue-50 border border-blue-100">
                      <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <FileText size={14} /> تعليمات وملاحظات داخلية
                      </h3>
                      <p className="text-slate-700 leading-relaxed">{maintenance.notes}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-12 text-center border-t border-slate-100 pt-12 mt-8">
                    <div className="space-y-4">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">توقيع مدير الصيانة</p>
                      <div className="h-16 flex items-center justify-center italic text-slate-300 font-serif border-b border-dashed border-slate-200">
                        Manager Signature
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">توقيع الفني المستلم</p>
                      <div className="h-16 border-b border-dashed border-slate-200 flex items-center justify-center">
                        <User size={20} className="opacity-10" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">ختم الاستلام</p>
                      <div className="h-16 border-b border-dashed border-slate-200"></div>
                    </div>
                  </div>
                </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

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
  companyName,
  companyEmail
}: FleetClientProps) {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [spares, setSpares] = useState(initialSpares);
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingMaintenance, setViewingMaintenance] = useState<any>(null);
  
  useEffect(() => { setVehicles(initialVehicles); }, [initialVehicles]);
  useEffect(() => { setSpares(initialSpares); }, [initialSpares]);
  useEffect(() => { setMaintenance(initialMaintenance); }, [initialMaintenance]);

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
    <div className="max-w-[95%] mx-auto p-4 md:p-8 space-y-8" dir="rtl">
      
      {/* Luxurious Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-10 text-white shadow-2xl border border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500 animate-gradient-x" />
        
        <div className="relative z-10 space-y-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-right space-y-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 mb-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-blue-200 font-black text-[10px] uppercase tracking-widest">إدارة الأسطول اللوجستي</span>
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                إدارة المركبات والمخزون
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
                لوحة تحكم ذكية لمتابعة حالة الأسطول، قطع الغيار، وعمليات الصيانة الدورية لشركة {companyName}
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
                <AddVehicleDialog companyId={companyId} employees={employees} vehicleCategories={vehicleCategories} />
                <AddSpareDialog companyId={companyId} categories={categories} />
                <MaintenanceRequestDialog companyId={companyId} vehicles={vehicles} spares={spares} />
                <button 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white font-black text-sm hover:bg-white/20 transition-all shadow-xl active:scale-95"
                >
                  <RefreshCcw size={18} className="text-blue-400" />
                  تحديث البيانات
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <AddVehicleCategoryDialog companyId={companyId} />
                <AddCategoryDialog companyId={companyId} />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Decorative Orbs */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      </motion.div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-center mb-8">
          <TabsList className="bg-[#1e293b]/50 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 h-16 shadow-2xl">
              {[
                { id: "dashboard", label: "لوحة التحكم", icon: <LayoutDashboard size={18} /> },
                { id: "vehicles", label: "المركبات", icon: <Car size={18} /> },
                { id: "inventory", label: "المخزون", icon: <Box size={18} /> },
                { id: "maintenance", label: "الصيانة", icon: <Wrench size={18} /> },
                { id: "costs", label: "تكاليف الصيانة", icon: <Calculator size={18} /> }
              ].map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="rounded-xl px-8 h-full data-[state=active]:bg-white data-[state=active]:text-[#1e293b] data-[state=active]:shadow-xl font-black text-white/50 transition-all gap-2"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DashboardStatCard title="إجمالي الأسطول" value={totalVehicles} icon={<Car />} color="blue" desc="مركبة" />
            <DashboardStatCard title="قطع الغيار" value={totalSpares} icon={<Box />} color="emerald" desc="صنف" />
            <DashboardStatCard title="تنبيهات المخزون" value={lowStockCount} icon={<AlertTriangle />} color="amber" desc="صنف ناقص" alert={lowStockCount > 0} />
            <DashboardStatCard title="طلبات الصيانة" value={pendingMaintenance} icon={<FileCheck />} color="rose" desc="طلب" />
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden group">
              <CardHeader className="p-8 border-b border-white/10 flex flex-row items-center justify-between bg-white/5">
                <CardTitle className="text-xl font-black text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <History className="text-blue-400" size={24} />
                  </div>
                  آخر عمليات الصيانة
                </CardTitle>
                <ArrowUpRight className="text-white/20 group-hover:text-blue-400 transition-colors" />
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-white/40 font-black uppercase text-[10px]">المركبة</TableHead>
                      <TableHead className="text-white/40 font-black uppercase text-[10px]">التاريخ</TableHead>
                      <TableHead className="text-white/40 font-black uppercase text-[10px]">التكلفة</TableHead>
                      <TableHead className="text-white/40 font-black uppercase text-[10px] text-center">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenance.slice(0, 5).map((m) => (
                      <TableRow key={m.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="font-black text-white">
                          <span className="px-3 py-1 bg-white/10 rounded-lg border border-white/10">{m.plate_number_ar}</span>
                        </TableCell>
                        <TableCell className="text-white/50 text-xs font-bold">{new Date(m.maintenance_date).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell className="font-black text-emerald-400">
                          {m.total_cost} <small className="opacity-50">SAR</small>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={cn(
                            "font-black text-[10px] px-3 py-1 rounded-full border",
                            m.status === 'pending' 
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          )}>
                            {m.status === 'pending' ? 'قيد الانتظار' : 'مكتمل'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden group">
              <CardHeader className="p-8 border-b border-white/10 flex flex-row items-center justify-between bg-white/5">
                <CardTitle className="text-xl font-black text-white flex items-center gap-3">
                  <div className="p-2 bg-rose-500/20 rounded-xl">
                    <AlertTriangle className="text-rose-400" size={24} />
                  </div>
                  نقص في المخزون
                </CardTitle>
                <TrendingDown className="text-white/20 group-hover:text-rose-400 transition-colors" />
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-white/40 font-black uppercase text-[10px]">الصنف</TableHead>
                      <TableHead className="text-white/40 font-black uppercase text-[10px]">المخزون</TableHead>
                      <TableHead className="text-white/40 font-black uppercase text-[10px]">الحد الأدنى</TableHead>
                      <TableHead className="text-white/40 font-black uppercase text-[10px] text-center">الإجراء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spares.filter(s => s.quantity <= (s.min_quantity || 0)).slice(0, 5).map((s) => (
                      <TableRow key={s.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="font-black text-white">{s.name}</TableCell>
                        <TableCell>
                          <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 font-black">{s.quantity}</Badge>
                        </TableCell>
                        <TableCell className="font-bold text-white/30">{s.min_quantity}</TableCell>
                        <TableCell className="text-center">
                          <button className="p-2 bg-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-500 hover:text-white transition-all">
                            <PlusCircle size={14} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-2xl">
                  <Car className="text-emerald-400" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">سجل الأسطول</h3>
                  <p className="text-white/40 text-sm font-medium">عرض وإدارة كافة المركبات المسجلة</p>
                </div>
              </div>
              <div className="relative w-full md:w-96">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                <input
                  type="text"
                  placeholder="بحث عن مركبة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-medium focus:bg-white/10 focus:border-blue-500/50 outline-none transition-all placeholder:text-white/20"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5 border-white/10">
                    <TableHead className="text-white/40 font-black uppercase text-[10px] px-8 py-5">لوحة المركبة</TableHead>
                    <TableHead className="text-white/40 font-black uppercase text-[10px]">النوع والموديل</TableHead>
                    <TableHead className="text-white/40 font-black uppercase text-[10px]">السائق المسؤول</TableHead>
                    <TableHead className="text-white/40 font-black uppercase text-[10px]">عداد المسافة</TableHead>
                    <TableHead className="text-white/40 font-black uppercase text-[10px] text-center">الحالة</TableHead>
                    <TableHead className="text-white/40 font-black uppercase text-[10px] text-left px-8">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((v) => (
                    <TableRow key={v.id} className="border-white/5 hover:bg-white/5 transition-all group">
                      <TableCell className="px-8 py-6">
                        <div className="h-12 w-16 border-2 border-white/20 rounded-xl bg-white/5 flex flex-col items-center justify-center font-black group-hover:border-emerald-500/50 transition-colors">
                          <span className="text-xs text-white leading-none">{v.plate_number_ar}</span>
                          <span className="text-[8px] text-white/30 tracking-widest mt-1">{v.plate_number_en}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-black text-white group-hover:text-emerald-400 transition-colors">{v.brand}</span>
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{v.model} - {v.manufacture_year}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <User size={14} />
                          </div>
                          <span className="font-bold text-white/70">{v.driver_name || '---'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Gauge size={14} className="text-white/20" />
                          <span className="font-black text-white">{v.current_km?.toLocaleString()}</span>
                          <small className="text-[10px] font-black text-white/20 uppercase">KM</small>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black text-[10px] px-3">نشط</Badge>
                      </TableCell>
<TableCell className="text-left px-8">
                          <div className="flex justify-end gap-2">
                            <button className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all">
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                if(confirm('هل أنت متأكد من حذف هذه المركبة؟')) {
                                  deleteVehicle(v.id).then(() => {
                                    toast.success('تم حذف المركبة');
                                    window.location.reload();
                                  });
                                }
                              }}
                              className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="grid gap-8 md:grid-cols-4">
            <Card className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl p-6 h-fit">
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="font-black text-white text-sm flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Layers size={18} className="text-blue-400" />
                  </div>
                  الفئات
                </h3>
                <AddCategoryDialog companyId={companyId} />
              </div>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between px-4 py-3 bg-white/10 text-white rounded-xl font-black text-xs transition-all border border-white/10">
                  <span>الكل</span>
                  <ChevronRight size={14} className="opacity-40" />
                </button>
                {categories.map(cat => (
                  <button key={cat.id} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 text-white/50 hover:text-white rounded-xl font-bold text-xs transition-all">
                    <span>{cat.name}</span>
                    <ChevronRight size={14} className="opacity-20" />
                  </button>
                ))}
              </div>
            </Card>
            
            <Card className="md:col-span-3 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden">
              <CardHeader className="bg-white/5 border-b border-white/10 p-8 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-2xl">
                    <Box className="text-blue-400" size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">إدارة قطع الغيار</h3>
                    <p className="text-white/40 text-sm font-medium">مراقبة المخزون وتوريد الأصناف</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white/5 border-white/10">
                      <TableHead className="text-white/40 font-black uppercase text-[10px] px-8 py-5">الصنف</TableHead>
                      <TableHead className="text-white/40 font-black uppercase text-[10px]">الفئة</TableHead>
                      <TableHead className="text-white/40 font-black uppercase text-[10px]">الكمية المتوفرة</TableHead>
                      <TableHead className="text-white/40 font-black uppercase text-[10px]">التكلفة</TableHead>
                      <TableHead className="text-white/40 font-black uppercase text-[10px] text-left px-8">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spares.map(s => (
                      <TableRow key={s.id} className="border-white/5 hover:bg-white/5 transition-all group">
                        <TableCell className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-white group-hover:text-blue-400 transition-colors">{s.name}</span>
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{s.code}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-white/10 text-white/50 text-[10px] font-black px-3">{s.category_name || 'بدون فئة'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg",
                              s.quantity <= (s.min_quantity || 0) ? "bg-rose-500/20 text-rose-400 border border-rose-500/20" : "bg-white/10 text-white border border-white/10"
                            )}>
                              {s.quantity}
                            </div>
                            {s.quantity <= (s.min_quantity || 0) && (
                              <Badge className="bg-rose-500 text-white font-black text-[9px] animate-pulse border-none">ناقص</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-white">{s.unit_price}</span>
                            <span className="text-[10px] font-black text-white/30 uppercase">SAR</span>
                          </div>
                        </TableCell>
<TableCell className="text-left px-8">
                            <div className="flex justify-end gap-2">
                              <button className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all">
                                <Edit size={16} />
                              </button>
                              <button className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                                <PlusCircle size={16} />
                              </button>
                            </div>
                          </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-2xl">
                  <Wrench className="text-amber-400" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">سجل الصيانة والخدمة</h3>
                  <p className="text-white/40 text-sm font-medium">متابعة الأوامر والتقارير الفنية</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-white/50 font-black text-xs hover:bg-white/10 transition-all">
                  <Filter size={16} />
                  تصفية
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5 border-white/10">
                    <TableHead className="text-white/40 font-black uppercase text-[10px] px-8 py-5">رقم الأمر</TableHead>
                    <TableHead className="text-white/40 font-black uppercase text-[10px]">المركبة</TableHead>
                    <TableHead className="text-white/40 font-black uppercase text-[10px]">الفني المسؤول</TableHead>
                    <TableHead className="text-white/40 font-black uppercase text-[10px]">التاريخ</TableHead>
                    <TableHead className="text-white/40 font-black uppercase text-[10px]">التكلفة الإجمالية</TableHead>
                    <TableHead className="text-white/40 font-black uppercase text-[10px] text-center">الحالة</TableHead>
                    <TableHead className="text-white/40 font-black uppercase text-[10px] text-left px-8">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenance.map(m => (
                    <TableRow key={m.id} className="border-white/5 hover:bg-white/5 transition-all group">
                      <TableCell className="px-8 py-6">
                        <span className="font-mono text-xs text-white/30 tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 group-hover:text-amber-400 group-hover:border-amber-400/30 transition-all">
                          #{m.id.toString().padStart(6, '0')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Car size={14} className="text-white/20" />
                          <span className="font-black text-white">{m.plate_number_ar}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <ShieldCheck size={14} />
                          </div>
                          <span className="font-bold text-white/70">{m.maintenance_person}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs text-white/40 font-bold">
                          <Calendar size={14} />
                          {new Date(m.maintenance_date).toLocaleDateString('en-GB')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-emerald-400">{m.total_cost}</span>
                          <span className="text-[10px] font-black text-emerald-400/40 uppercase">SAR</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "font-black text-[10px] px-4 py-1.5 rounded-full border shadow-lg",
                          m.status === 'pending' 
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        )}>
                          {m.status === 'pending' ? 'قيد الانتظار' : 'مكتمل'}
                        </Badge>
                      </TableCell>
<TableCell className="text-left px-8">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setViewingMaintenance(m)}
                              className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                              title="عرض وطباعة"
                            >
                              <Eye size={16} />
                            </button>
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

          <TabsContent value="costs">
            <div className="space-y-8">
              <div className="grid gap-6 md:grid-cols-4">
                <DashboardStatCard 
                  title="إجمالي تكاليف الصيانة" 
                  value={maintenance.reduce((sum, m) => sum + Number(m.total_cost || 0), 0).toLocaleString()} 
                  icon={<Calculator />} 
                  color="blue" 
                  desc="ريال" 
                />
                <DashboardStatCard 
                  title="قيمة المخزون" 
                  value={spares.reduce((sum, s) => sum + (Number(s.quantity || 0) * Number(s.unit_price || 0)), 0).toLocaleString()} 
                  icon={<Box />} 
                  color="emerald" 
                  desc="ريال" 
                />
                <DashboardStatCard 
                  title="عدد أوامر الصيانة" 
                  value={maintenance.length} 
                  icon={<FileCheck />} 
                  color="amber" 
                  desc="أمر" 
                />
                <DashboardStatCard 
                  title="متوسط تكلفة الصيانة" 
                  value={maintenance.length > 0 ? Math.round(maintenance.reduce((sum, m) => sum + Number(m.total_cost || 0), 0) / maintenance.length).toLocaleString() : 0} 
                  icon={<TrendingUp />} 
                  color="rose" 
                  desc="ريال/أمر" 
                />
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <Card className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden">
                  <CardHeader className="p-8 border-b border-white/10 bg-white/5">
                    <CardTitle className="text-xl font-black text-white flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-xl">
                        <Calendar className="text-blue-400" size={24} />
                      </div>
                      تكاليف الصيانة حسب الشهر
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {(() => {
                        const monthlyData: { [key: string]: number } = {};
                        maintenance.forEach(m => {
                          const date = new Date(m.maintenance_date);
                          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(m.total_cost || 0);
                        });
                        const sortedMonths = Object.entries(monthlyData).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);
                        const maxValue = Math.max(...sortedMonths.map(([, v]) => v), 1);
                        
                        return sortedMonths.map(([month, cost]) => {
                          const [year, monthNum] = month.split('-');
                          const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
                          return (
                            <div key={month} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-white/70 font-bold text-sm">{monthNames[parseInt(monthNum) - 1]} {year}</span>
                                <span className="text-emerald-400 font-black">{cost.toLocaleString()} ريال</span>
                              </div>
                              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                                  style={{ width: `${(cost / maxValue) * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        });
                      })()}
                      {maintenance.length === 0 && (
                        <div className="text-center text-white/30 py-8">لا توجد بيانات صيانة</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden">
                  <CardHeader className="p-8 border-b border-white/10 bg-white/5">
                    <CardTitle className="text-xl font-black text-white flex items-center gap-3">
                      <div className="p-2 bg-amber-500/20 rounded-xl">
                        <Car className="text-amber-400" size={24} />
                      </div>
                      تكاليف الصيانة حسب المركبة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                          <TableHead className="text-white/40 font-black uppercase text-[10px]">المركبة</TableHead>
                          <TableHead className="text-white/40 font-black uppercase text-[10px]">عدد الصيانات</TableHead>
                          <TableHead className="text-white/40 font-black uppercase text-[10px]">إجمالي التكلفة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const vehicleCosts: { [key: string]: { plate: string, count: number, cost: number } } = {};
                          maintenance.forEach(m => {
                            const key = m.plate_number_ar;
                            if (!vehicleCosts[key]) {
                              vehicleCosts[key] = { plate: key, count: 0, cost: 0 };
                            }
                            vehicleCosts[key].count++;
                            vehicleCosts[key].cost += Number(m.total_cost || 0);
                          });
                          return Object.values(vehicleCosts)
                            .sort((a, b) => b.cost - a.cost)
                            .slice(0, 8)
                            .map((v, idx) => (
                              <TableRow key={idx} className="border-white/5 hover:bg-white/5 transition-colors">
                                <TableCell className="font-black text-white">
                                  <span className="px-3 py-1 bg-white/10 rounded-lg border border-white/10">{v.plate}</span>
                                </TableCell>
                                <TableCell className="text-white/50 font-bold">{v.count} صيانة</TableCell>
                                <TableCell className="font-black text-emerald-400">{v.cost.toLocaleString()} <small className="opacity-50">SAR</small></TableCell>
                              </TableRow>
                            ));
                        })()}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-[2.5rem] bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden">
                <CardHeader className="p-8 border-b border-white/10 bg-white/5">
                  <CardTitle className="text-xl font-black text-white flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-xl">
                      <Package className="text-emerald-400" size={24} />
                    </div>
                    مقارنة تكاليف الصيانة بقيمة المخزون
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center space-y-4">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-2xl mx-auto flex items-center justify-center">
                        <Wrench size={32} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-blue-300/70 font-bold text-sm uppercase tracking-widest mb-2">إجمالي تكاليف الصيانة</p>
                        <p className="text-4xl font-black text-blue-400">
                          {maintenance.reduce((sum, m) => sum + Number(m.total_cost || 0), 0).toLocaleString()}
                        </p>
                        <p className="text-blue-300/50 font-bold text-xs mt-1">ريال سعودي</p>
                      </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl mx-auto flex items-center justify-center">
                        <Box size={32} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-emerald-300/70 font-bold text-sm uppercase tracking-widest mb-2">قيمة المخزون الحالي</p>
                        <p className="text-4xl font-black text-emerald-400">
                          {spares.reduce((sum, s) => sum + (Number(s.quantity || 0) * Number(s.unit_price || 0)), 0).toLocaleString()}
                        </p>
                        <p className="text-emerald-300/50 font-bold text-xs mt-1">ريال سعودي</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-white/50 font-bold">نسبة تكاليف الصيانة إلى قيمة المخزون</span>
                      <span className="text-2xl font-black text-amber-400">
                        {(() => {
                          const maintenanceCost = maintenance.reduce((sum, m) => sum + Number(m.total_cost || 0), 0);
                          const inventoryValue = spares.reduce((sum, s) => sum + (Number(s.quantity || 0) * Number(s.unit_price || 0)), 0);
                          return inventoryValue > 0 ? ((maintenanceCost / inventoryValue) * 100).toFixed(1) : 0;
                        })()}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

      {viewingMaintenance && (
        <ViewPrintEmailDialog
          maintenance={viewingMaintenance}
          companyId={companyId}
          companyName={companyName}
          companyEmail={companyEmail}
          onClose={() => setViewingMaintenance(null)}
        />
      )}

      {/* Footer Branding */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest pt-4 opacity-40">
        <div className="flex items-center gap-2">
          <Sparkles size={10} className="text-blue-500" />
          <span>نظام ZoolSpeed Logistics - منصة إدارة الأسطول والمخزون</span>
        </div>
        <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
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
  companyEmail: string;
}
