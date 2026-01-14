"use client";

import React, { useState } from "react";
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
  Tachometer,
  Shield,
  Calendar,
  User,
  MoreVertical,
  CheckCircle2
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
import { addVehicle, addSpare, addSpareCategory, createMaintenanceRequest, deleteVehicle } from "@/lib/actions/fleet";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FleetClientProps {
  initialVehicles: any[];
  initialSpares: any[];
  categories: any[];
  initialMaintenance: any[];
  employees: any[];
  companyId: number;
}

export function FleetClient({ 
  initialVehicles, 
  initialSpares, 
  categories, 
  initialMaintenance, 
  employees,
  companyId 
}: FleetClientProps) {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [spares, setSpares] = useState(initialSpares);
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // Stats
  const totalVehicles = vehicles.length;
  const totalSpares = spares.length;
  const lowStockCount = spares.filter(s => s.quantity <= s.min_quantity).length;
  const pendingMaintenance = maintenance.filter(m => m.status === 'pending').length;

  const filteredVehicles = vehicles.filter(v => 
    v.plate_number_ar?.includes(searchQuery) || 
    v.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
      {/* Luxurious Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">نظام إدارة المركبات</span>
            </h1>
            <p className="mt-2 text-slate-400 font-medium">إدارة متكاملة للأسطول، قطع الغيار، والصيانة الدورية</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <AddVehicleDialog companyId={companyId} employees={employees} />
            <AddSpareDialog companyId={companyId} categories={categories} />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="إجمالي المركبات" 
          value={totalVehicles} 
          icon={<Car className="h-6 w-6 text-blue-500" />} 
          color="blue"
        />
        <StatCard 
          title="قطع الغيار" 
          value={totalSpares} 
          icon={<Box className="h-6 w-6 text-emerald-500" />} 
          color="emerald"
        />
        <StatCard 
          title="منخفض المخزون" 
          value={lowStockCount} 
          icon={<AlertTriangle className="h-6 w-6 text-amber-500" />} 
          color="amber"
          alert={lowStockCount > 0}
        />
        <StatCard 
          title="طلبات صيانة معلقة" 
          value={pendingMaintenance} 
          icon={<Wrench className="h-6 w-6 text-rose-500" />} 
          color="rose"
        />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-4 rounded-xl bg-slate-100 p-1">
          <TabsTrigger value="dashboard" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">لوحة التحكم</TabsTrigger>
          <TabsTrigger value="vehicles" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">المركبات</TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">المخزون</TabsTrigger>
          <TabsTrigger value="maintenance" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">الصيانة</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <History className="h-5 w-5 text-blue-500" />
                  آخر عمليات الصيانة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>المركبة</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>التكلفة</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenance.slice(0, 5).map((m) => (
                      <TableRow key={m.id} className="cursor-pointer transition-colors hover:bg-slate-50">
                        <TableCell className="font-bold">{m.plate_number_ar}</TableCell>
                        <TableCell className="text-slate-500">{new Date(m.maintenance_date).toLocaleDateString('ar-SA')}</TableCell>
                        <TableCell className="font-bold text-emerald-600">{m.total_cost} ريال</TableCell>
                        <TableCell>
                          <Badge variant={m.status === 'pending' ? 'outline' : 'default'} className={m.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}>
                            {m.status === 'pending' ? 'معلق' : 'مكتمل'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  تنبيهات المخزون المنخفض
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>القطعة</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>الحد الأدنى</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spares.filter(s => s.quantity <= s.min_quantity).slice(0, 5).map((s) => (
                      <TableRow key={s.id} className="group">
                        <TableCell className="font-bold">{s.name}</TableCell>
                        <TableCell className="text-rose-600 font-black">{s.quantity}</TableCell>
                        <TableCell className="text-slate-500">{s.min_quantity}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">إضافة مخزون</Button>
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
          <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
              <div className="relative w-full max-w-sm">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="ابحث برقم اللوحة أو النوع..." 
                  className="pr-10 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-xl"><Filter className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead>اللوحة</TableHead>
                    <TableHead>النوع/الموديل</TableHead>
                    <TableHead>السائق</TableHead>
                    <TableHead>الكيلومترات</TableHead>
                    <TableHead>آخر صيانة</TableHead>
                    <TableHead className="text-left">العمليات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((v) => (
                    <TableRow key={v.id} className="transition-colors hover:bg-slate-50/80">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-slate-800">{v.plate_number_ar}</span>
                          <span className="text-xs text-slate-400 font-mono tracking-widest">{v.plate_number_en}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{v.brand}</span>
                          <span className="text-sm text-slate-500">{v.model} - {v.manufacture_year}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-600">{v.driver_name || 'غير محدد'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-800">{v.current_km?.toLocaleString()}</span>
                          <span className="text-xs text-slate-400">كم</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500">{v.last_maintenance_date ? new Date(v.last_maintenance_date).toLocaleDateString('ar-SA') : '---'}</TableCell>
                      <TableCell className="text-left">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-500 rounded-full transition-colors"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-500 rounded-full transition-colors" onClick={() => {
                            if(confirm('هل أنت متأكد من حذف هذه المركبة؟')) {
                              deleteVehicle(v.id).then(() => toast.success('تم حذف المركبة بنجاح'));
                            }
                          }}><Trash2 className="h-4 w-4" /></Button>
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
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="md:col-span-1 rounded-2xl border-none shadow-xl shadow-slate-200/50">
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="flex items-center justify-between text-lg">
                  الفئات
                  <AddCategoryDialog companyId={companyId} />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" className="justify-start font-bold bg-blue-50 text-blue-700">الكل</Button>
                  {categories.map(cat => (
                    <Button key={cat.id} variant="ghost" className="justify-start text-slate-600 hover:bg-slate-50 hover:text-blue-600">{cat.name}</Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3 rounded-2xl border-none shadow-xl shadow-slate-200/50 overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle>قائمة قطع الغيار</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead>القطعة</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead className="text-left">العمليات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spares.map(s => (
                      <TableRow key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{s.name}</span>
                            <span className="text-xs text-slate-400 uppercase tracking-tighter">Code: {s.code || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium">{s.category_name || 'بدون فئة'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-black ${s.quantity <= s.min_quantity ? 'text-rose-600' : 'text-emerald-600'}`}>{s.quantity}</span>
                            {s.quantity <= s.min_quantity && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-slate-700">{s.unit_price} ريال</TableCell>
                        <TableCell className="text-left">
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-500 rounded-full transition-colors"><Edit className="h-4 w-4" /></Button>
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
          <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
              <CardTitle>سجل طلبات الصيانة</CardTitle>
              <MaintenanceRequestDialog 
                companyId={companyId} 
                vehicles={vehicles} 
                spares={spares} 
              />
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>المركبة</TableHead>
                    <TableHead>المسؤول</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>التكلفة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">العمليات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenance.map(m => (
                    <TableRow key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono text-slate-400">#{m.id}</TableCell>
                      <TableCell className="font-bold text-slate-800">{m.plate_number_ar}</TableCell>
                      <TableCell className="font-medium text-slate-600">{m.maintenance_person}</TableCell>
                      <TableCell className="text-slate-500">{new Date(m.maintenance_date).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell className="font-black text-emerald-600">{m.total_cost} ريال</TableCell>
                      <TableCell>
                        <Badge className={m.status === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'}>
                          {m.status === 'pending' ? 'قيد الانتظار' : 'تم التأكيد'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-800 rounded-full transition-colors"><Printer className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-components for better organization

function StatCard({ title, value, icon, color, alert }: { title: string, value: number, icon: React.ReactNode, color: string, alert?: boolean }) {
  const colors: Record<string, string> = {
    blue: "from-blue-500/10 to-blue-500/5 text-blue-600",
    emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-600",
    amber: "from-amber-500/10 to-amber-500/5 text-amber-600",
    rose: "from-rose-500/10 to-rose-500/5 text-rose-600",
  };

  return (
    <Card className={`relative overflow-hidden border-none shadow-xl shadow-slate-200/40 rounded-2xl ${alert ? 'animate-pulse ring-2 ring-rose-500/20' : ''}`}>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-3xl font-black text-slate-800">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

function AddVehicleDialog({ companyId, employees }: { companyId: number, employees: any[] }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const result = await addVehicle({ ...data, company_id: companyId });
    setLoading(false);
    
    if (result.success) {
      toast.success("تمت إضافة المركبة بنجاح");
      setOpen(false);
    } else {
      toast.error("فشل في إضافة المركبة: " + result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 rounded-xl bg-blue-500 font-bold hover:bg-blue-600">
          <Plus className="ml-2 h-5 w-5" /> إضافة مركبة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-3xl border-none shadow-2xl overflow-hidden p-0">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
          <DialogTitle className="text-2xl font-bold">إضافة مركبة للأسطول</DialogTitle>
          <p className="text-blue-100 opacity-80">أدخل كافة تفاصيل المركبة بدقة</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">رقم اللوحة (عربي)</label>
              <Input name="plate_number_ar" required placeholder="أ ب ج 1 2 3" className="rounded-xl border-slate-200 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">رقم اللوحة (إنجليزي)</label>
              <Input name="plate_number_en" placeholder="ABC 123" className="rounded-xl border-slate-200 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">الماركة</label>
              <Input name="brand" required placeholder="مثال: تويوتا" className="rounded-xl border-slate-200 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">الموديل</label>
              <Input name="model" required placeholder="مثال: كامري" className="rounded-xl border-slate-200 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">سنة الصنع</label>
              <Input name="manufacture_year" type="number" placeholder="2024" className="rounded-xl border-slate-200 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">السائق</label>
              <Select name="driver_id">
                <SelectTrigger className="rounded-xl border-slate-200 h-11">
                  <SelectValue placeholder="اختر السائق" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-blue-600 font-bold hover:bg-blue-700">
              {loading ? "جاري الحفظ..." : "حفظ المركبة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddSpareDialog({ companyId, categories }: { companyId: number, categories: any[] }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const result = await addSpare({ ...data, company_id: companyId });
    setLoading(false);
    
    if (result.success) {
      toast.success("تمت إضافة القطعة للمخزون");
      setOpen(false);
    } else {
      toast.error("فشل في إضافة القطعة: " + result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 rounded-xl bg-emerald-500 font-bold hover:bg-emerald-600">
          <Plus className="ml-2 h-5 w-5" /> إضافة قطعة للمخزون
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-3xl border-none shadow-2xl overflow-hidden p-0">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white">
          <DialogTitle className="text-2xl font-bold text-right">إضافة قطعة غيار</DialogTitle>
          <p className="text-emerald-100 opacity-80 text-right">أدخل بيانات القطعة والمخزون الحالي</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-700">اسم القطعة</label>
              <Input name="name" required placeholder="مثال: فلتر زيت أصلي" className="rounded-xl border-slate-200 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">الفئة</label>
              <Select name="category_id">
                <SelectTrigger className="rounded-xl border-slate-200 h-11">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">الكود</label>
              <Input name="code" placeholder="PART-123" className="rounded-xl border-slate-200 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">الكمية الحالية</label>
              <Input name="quantity" type="number" required placeholder="0" className="rounded-xl border-slate-200 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">حد التنبيه</label>
              <Input name="min_quantity" type="number" defaultValue="5" className="rounded-xl border-slate-200 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">سعر الوحدة</label>
              <Input name="unit_price" type="number" step="0.01" required placeholder="0.00" className="rounded-xl border-slate-200 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">المورد</label>
              <Input name="supplier" placeholder="اسم المورد" className="rounded-xl border-slate-200 h-11" />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-emerald-600 font-bold hover:bg-emerald-700">
              {loading ? "جاري الحفظ..." : "حفظ القطعة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddCategoryDialog({ companyId }: { companyId: number }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    
    const result = await addSpareCategory({ company_id: companyId, name });
    setLoading(false);
    
    if (result.success) {
      toast.success("تمت إضافة الفئة بنجاح");
      setOpen(false);
    } else {
      toast.error("فشل في إضافة الفئة: " + result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl p-6">
        <DialogTitle className="mb-4">إضافة فئة جديدة</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">اسم الفئة</label>
            <Input name="name" required placeholder="مثل: محركات، فرامل..." className="rounded-xl" />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 font-bold">
            {loading ? "جاري الحفظ..." : "حفظ الفئة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MaintenanceRequestDialog({ companyId, vehicles, spares }: { companyId: number, vehicles: any[], spares: any[] }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedSpares, setSelectedSpares] = useState<any[]>([]);

  const toggleSpare = (spare: any) => {
    if (selectedSpares.find(s => s.id === spare.id)) {
      setSelectedSpares(selectedSpares.filter(s => s.id !== spare.id));
    } else {
      setSelectedSpares([...selectedSpares, { ...spare, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, qty: number) => {
    setSelectedSpares(selectedSpares.map(s => s.id === id ? { ...s, quantity: Math.max(1, qty) } : s));
  };

  const totalCost = selectedSpares.reduce((sum, s) => sum + (s.unit_price * s.quantity), 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const result = await createMaintenanceRequest({ 
      ...data, 
      company_id: companyId,
      total_cost: totalCost
    }, selectedSpares);
    
    setLoading(false);
    if (result.success) {
      toast.success("تم إنشاء طلب الصيانة بنجاح");
      setOpen(false);
      setSelectedSpares([]);
    } else {
      toast.error("فشل في إنشاء الطلب: " + result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-slate-900 font-bold text-white hover:bg-slate-800">
          <Wrench className="ml-2 h-4 w-4" /> طلب صيانة جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl rounded-3xl border-none shadow-2xl overflow-hidden p-0">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white">
          <DialogTitle className="text-2xl font-bold">إنشاء أمر صيانة</DialogTitle>
          <p className="text-slate-300 opacity-80">اختر المركبة وقطع الغيار المستخدمة</p>
        </div>
        <form onSubmit={handleSubmit} className="flex h-[70vh] flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">اختر المركبة</label>
                  <Select name="vehicle_id" required>
                    <SelectTrigger className="rounded-xl border-slate-200 h-11">
                      <SelectValue placeholder="اختر المركبة من القائمة" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(v => (
                        <SelectItem key={v.id} value={v.id.toString()}>{v.plate_number_ar} - {v.brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">اسم الفني/المسؤول</label>
                  <Input name="maintenance_person" required placeholder="اسم الفني أو الورشة" className="rounded-xl border-slate-200 h-11" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">التاريخ</label>
                    <Input name="maintenance_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="rounded-xl border-slate-200 h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">العداد الحالي (كم)</label>
                    <Input name="current_km" type="number" required placeholder="0" className="rounded-xl border-slate-200 h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">ملاحظات إضافية</label>
                  <textarea name="notes" rows={3} className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none" placeholder="اكتب أي ملاحظات تتعلق بالصيانة هنا..."></textarea>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-r pr-6">
                <h3 className="font-bold text-slate-800">قطع الغيار المستخدمة</h3>
                <ScrollArea className="h-64 rounded-xl border p-4 bg-slate-50/50">
                  <div className="grid gap-2">
                    {spares.map(spare => (
                      <div key={spare.id} className="flex items-center justify-between rounded-lg border bg-white p-2 shadow-sm transition-all hover:border-blue-200">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800">{spare.name}</p>
                          <p className="text-xs text-emerald-600">{spare.unit_price} ريال</p>
                        </div>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant={selectedSpares.find(s => s.id === spare.id) ? "default" : "outline"}
                          className={`rounded-lg ${selectedSpares.find(s => s.id === spare.id) ? "bg-emerald-500 hover:bg-emerald-600" : "text-blue-600 border-blue-200"}`}
                          onClick={() => toggleSpare(spare)}
                        >
                          {selectedSpares.find(s => s.id === spare.id) ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-600">القطع المختارة</h4>
                  <div className="space-y-2">
                    {selectedSpares.map(s => (
                      <div key={s.id} className="flex items-center justify-between gap-4 rounded-xl bg-blue-50/50 p-2 border border-blue-100">
                        <span className="flex-1 text-sm font-medium text-blue-900">{s.name}</span>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            className="h-8 w-16 rounded-lg text-center font-bold border-blue-200" 
                            value={s.quantity} 
                            onChange={(e) => updateQuantity(s.id, parseInt(e.target.value))}
                          />
                          <span className="text-xs font-bold text-blue-700">وحدة</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t bg-slate-50 p-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 font-medium">إجمالي تكلفة الصيانة</span>
              <span className="text-2xl font-black text-emerald-600">{totalCost.toLocaleString()} ريال</span>
            </div>
            <Button type="submit" disabled={loading || totalCost === 0} className="h-12 rounded-xl bg-slate-900 px-8 font-bold text-white hover:bg-slate-800 shadow-lg shadow-slate-200">
              {loading ? "جاري الحفظ..." : "إصدار أمر الصيانة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
