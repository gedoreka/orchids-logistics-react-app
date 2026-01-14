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
import { addVehicle, addSpare, addSpareCategory, addVehicleCategory, createMaintenanceRequest, deleteVehicle } from "@/lib/actions/fleet";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useReactToPrint } from "react-to-print";

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
  
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  // Stats
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
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500 bg-slate-50/50 min-h-screen">
      {/* Luxurious Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]"></div>
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-center md:text-right">
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">نظام إدارة الأسطول</span>
            </h1>
            <p className="mt-3 text-slate-400 font-medium text-lg">تحكم كامل واحترافي في المركبات، قطع الغيار، وعمليات الصيانة</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <AddVehicleDialog 
              companyId={companyId} 
              companyName={companyName}
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

      {/* Main Navigation Tabs */}
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-center mb-8">
          <TabsList className="grid grid-cols-4 w-full max-w-3xl h-16 rounded-2xl bg-white/80 backdrop-blur-md p-1.5 shadow-xl shadow-slate-200/50 border border-slate-200">
            <TabsTrigger value="dashboard" className="rounded-xl flex items-center gap-2 text-base font-bold data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
              <LayoutDashboard size={20} /> لوحة التحكم
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="rounded-xl flex items-center gap-2 text-base font-bold data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
              <Truck size={20} /> المركبات
            </TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-xl flex items-center gap-2 text-base font-bold data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
              <Package size={20} /> المخزون
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="rounded-xl flex items-center gap-2 text-base font-bold data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
              <Wrench size={20} /> الصيانة
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-8 outline-none">
          {/* Dashboard Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DashboardStatCard 
              title="إجمالي الأسطول" 
              value={totalVehicles} 
              icon={<Car size={32} />} 
              color="blue"
              desc="مركبة نشطة"
            />
            <DashboardStatCard 
              title="قطع الغيار" 
              value={totalSpares} 
              icon={<Box size={32} />} 
              color="emerald"
              desc="صنف متوفر"
            />
            <DashboardStatCard 
              title="تنبيهات المخزون" 
              value={lowStockCount} 
              icon={<AlertTriangle size={32} />} 
              color="amber"
              desc="أصناف قاربت على النفاد"
              alert={lowStockCount > 0}
            />
            <DashboardStatCard 
              title="أوامر الصيانة" 
              value={pendingMaintenance} 
              icon={<FileCheck size={32} />} 
              color="rose"
              desc="طلب قيد الانتظار"
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="rounded-[2rem] border-none shadow-2xl shadow-slate-200/60 overflow-hidden bg-white">
              <CardHeader className="border-b bg-slate-50/80 p-6 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl font-black text-slate-800">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
                    <History size={24} />
                  </div>
                  آخر عمليات الصيانة
                </CardTitle>
                <Button variant="ghost" className="text-blue-600 font-bold hover:bg-blue-50 rounded-xl">عرض الكل</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/30 hover:bg-transparent">
                        <TableHead className="py-4 font-bold text-slate-600">المركبة</TableHead>
                        <TableHead className="py-4 font-bold text-slate-600">التاريخ</TableHead>
                        <TableHead className="py-4 font-bold text-slate-600">التكلفة</TableHead>
                        <TableHead className="py-4 font-bold text-slate-600">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenance.slice(0, 5).map((m) => (
                        <TableRow key={m.id} className="group cursor-pointer transition-all hover:bg-slate-50/80">
                          <TableCell className="py-4">
                            <div className="flex flex-col">
                              <span className="font-black text-slate-800">{m.plate_number_ar}</span>
                              <span className="text-xs text-slate-400 font-medium">{m.brand} - {m.model}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-slate-500 font-medium">
                            {new Date(m.maintenance_date).toLocaleDateString('ar-SA')}
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-lg font-black text-emerald-600">{m.total_cost} <small className="text-[10px] text-slate-400 uppercase">SAR</small></span>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge className={`rounded-lg px-3 py-1 font-bold ${
                              m.status === 'pending' 
                                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {m.status === 'pending' ? 'قيد الانتظار' : 'مكتمل'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-2xl shadow-slate-200/60 overflow-hidden bg-white">
              <CardHeader className="border-b bg-slate-50/80 p-6 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl font-black text-slate-800">
                  <div className="p-2 bg-rose-500/10 rounded-xl text-rose-600">
                    <AlertTriangle size={24} />
                  </div>
                  نقص في قطع الغيار
                </CardTitle>
                <Button variant="ghost" className="text-rose-600 font-bold hover:bg-rose-50 rounded-xl">طلب توريد</Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/30 hover:bg-transparent">
                      <TableHead className="py-4 font-bold text-slate-600">القطعة</TableHead>
                      <TableHead className="py-4 font-bold text-slate-600">المخزون</TableHead>
                      <TableHead className="py-4 font-bold text-slate-600">الحد الأدنى</TableHead>
                      <TableHead className="py-4 text-left"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spares.filter(s => s.quantity <= (s.min_quantity || 0)).slice(0, 5).map((s) => (
                      <TableRow key={s.id} className="group transition-all hover:bg-slate-50/80">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                              <Package size={20} />
                            </div>
                            <span className="font-bold text-slate-800">{s.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none font-black text-sm px-3">{s.quantity}</Badge>
                        </TableCell>
                        <TableCell className="py-4 text-slate-500 font-bold">{s.min_quantity}</TableCell>
                        <TableCell className="py-4 text-left">
                          <Button size="sm" className="rounded-xl bg-slate-900 font-bold opacity-0 group-hover:opacity-100 transition-all">إضافة</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {spares.filter(s => s.quantity <= (s.min_quantity || 0)).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-12 text-center text-slate-400 font-medium italic">
                          لا توجد تنبيهات للمخزون حالياً
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card className="rounded-[2rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bg-slate-50/50 p-6">
              <div className="relative w-full max-w-lg">
                <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="ابحث برقم اللوحة، الماركة، أو الموديل..." 
                  className="h-14 pr-12 rounded-[1.25rem] border-slate-200 bg-white text-lg font-medium shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <AddVehicleCategoryDialog companyId={companyId} />
                <Button variant="outline" size="lg" className="h-14 px-6 rounded-[1.25rem] font-bold gap-2 text-slate-600 border-slate-200 hover:bg-white hover:shadow-md transition-all">
                  <Filter size={20} /> تصفية النتائج
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-transparent">
                      <TableHead className="py-5 px-6 font-black text-slate-600 text-sm uppercase tracking-wider">لوحة المركبة</TableHead>
                      <TableHead className="py-5 font-black text-slate-600 text-sm uppercase tracking-wider">النوع والموديل</TableHead>
                      <TableHead className="py-5 font-black text-slate-600 text-sm uppercase tracking-wider">السائق الحالي</TableHead>
                      <TableHead className="py-5 font-black text-slate-600 text-sm uppercase tracking-wider">العداد (كم)</TableHead>
                      <TableHead className="py-5 font-black text-slate-600 text-sm uppercase tracking-wider">آخر صيانة</TableHead>
                      <TableHead className="py-5 px-6 text-left"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map((v) => (
                      <TableRow key={v.id} className="group transition-all hover:bg-blue-50/30">
                        <TableCell className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center h-14 w-20 rounded-xl border-2 border-slate-900 bg-white shadow-sm overflow-hidden">
                              <div className="h-1/3 w-full bg-slate-900 flex items-center justify-center text-[8px] font-black text-white tracking-[0.2em]">KSA</div>
                              <div className="flex-1 flex flex-col items-center justify-center">
                                <span className="text-sm font-black text-slate-900 leading-none">{v.plate_number_ar}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{v.plate_number_en}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex flex-col">
                            <span className="text-lg font-black text-slate-800">{v.brand}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="rounded-md font-bold text-xs bg-slate-50">{v.model}</Badge>
                              <span className="text-sm text-slate-400 font-medium">{v.manufacture_year}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                              <User size={18} />
                            </div>
                            <span className="font-bold text-slate-700">{v.driver_name || <span className="text-slate-300 italic">غير محدد</span>}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-black text-slate-800">{(v.current_km || 0).toLocaleString()}</span>
                            <span className="text-xs font-black text-slate-400 uppercase">KM</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">
                              {v.last_maintenance_date ? new Date(v.last_maintenance_date).toLocaleDateString('ar-SA') : 'لم تجرى بعد'}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">{v.maintenance_count || 0} عملية صيانة</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5 px-6 text-left">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-md border border-transparent hover:border-blue-100 transition-all">
                              <Edit size={20} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-slate-400 hover:bg-white hover:text-rose-600 hover:shadow-md border border-transparent hover:border-rose-100 transition-all" onClick={() => {
                              if(confirm('هل أنت متأكد من حذف هذه المركبة؟')) {
                                deleteVehicle(v.id).then(() => toast.success('تم حذف المركبة بنجاح'));
                              }
                            }}>
                              <Trash2 size={20} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredVehicles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-24 text-center">
                          <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                            <Truck size={64} className="opacity-20" />
                            <p className="text-xl font-medium">لم يتم العثور على أي مركبات تطابق البحث</p>
                            <Button variant="outline" className="rounded-xl" onClick={() => setSearchQuery("")}>إعادة ضبط البحث</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-3">
              <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 bg-white sticky top-24">
                <CardHeader className="border-b bg-slate-50/50 p-6 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Layers size={18} className="text-blue-500" /> الفئات
                  </CardTitle>
                  <AddCategoryDialog companyId={companyId} />
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" className="h-12 justify-start font-black text-base bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100">
                      الكل <span className="mr-auto text-xs opacity-50">{spares.length}</span>
                    </Button>
                    {categories.map(cat => (
                      <Button key={cat.id} variant="ghost" className="h-12 justify-start text-base font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl">
                        {cat.name} <span className="mr-auto text-xs opacity-30">{spares.filter(s => s.category_id === cat.id).length}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-9">
              <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
                <CardHeader className="border-b bg-slate-50/50 p-8 flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-black text-slate-800">قائمة المخزون</CardTitle>
                  <div className="flex gap-4">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input placeholder="بحث في المخزون..." className="h-11 pr-10 rounded-xl w-64 border-slate-200" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 hover:bg-transparent">
                        <TableHead className="py-6 px-8 font-black text-slate-600">اسم القطعة</TableHead>
                        <TableHead className="py-6 font-black text-slate-600">الفئة</TableHead>
                        <TableHead className="py-6 font-black text-slate-600">حالة المخزون</TableHead>
                        <TableHead className="py-6 font-black text-slate-600">سعر الوحدة</TableHead>
                        <TableHead className="py-6 px-8 text-left"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {spares.map(s => (
                        <TableRow key={s.id} className="group transition-all hover:bg-slate-50/80">
                          <TableCell className="py-6 px-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                                <Package size={24} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-lg font-black text-slate-800">{s.name}</span>
                                <span className="text-xs font-mono text-slate-400 tracking-widest">{s.code || 'NO-CODE'}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-lg">
                              {s.category_name || 'بدون فئة'}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col">
                                <span className={`text-xl font-black ${s.quantity <= (s.min_quantity || 0) ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {s.quantity}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">وحدة متوفرة</span>
                              </div>
                              {s.quantity <= (s.min_quantity || 0) && (
                                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg animate-pulse">
                                  <AlertTriangle size={16} />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="flex flex-col">
                              <span className="text-xl font-black text-slate-800">{s.unit_price} <small className="text-[10px] text-slate-400">SAR</small></span>
                              {s.sale_price && s.sale_price > 0 && (
                                <span className="text-xs font-bold text-blue-600">سعر الفاتورة: {s.sale_price}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-8 text-left">
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-slate-300 hover:bg-white hover:text-blue-600 hover:shadow-md transition-all">
                              <Edit size={22} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 p-8">
              <CardTitle className="text-2xl font-black text-slate-800">سجل طلبات الصيانة</CardTitle>
              <div className="flex gap-4">
                <Button variant="outline" className="h-12 rounded-xl font-bold border-slate-200 text-slate-600">تصدير اكسل</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-transparent">
                      <TableHead className="py-6 px-8 font-black text-slate-600">رقم الطلب</TableHead>
                      <TableHead className="py-6 font-black text-slate-600">المركبة</TableHead>
                      <TableHead className="py-6 font-black text-slate-600">فني الصيانة</TableHead>
                      <TableHead className="py-6 font-black text-slate-600">التاريخ</TableHead>
                      <TableHead className="py-6 font-black text-slate-600">التكلفة الإجمالية</TableHead>
                      <TableHead className="py-6 font-black text-slate-600">الحالة</TableHead>
                      <TableHead className="py-6 px-8 text-left"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenance.map(m => (
                      <TableRow key={m.id} className="group transition-all hover:bg-slate-50/80">
                        <TableCell className="py-6 px-8">
                          <span className="font-mono text-slate-400 text-sm font-bold tracking-widest">#{m.id.toString().padStart(6, '0')}</span>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex flex-col">
                            <span className="text-lg font-black text-slate-800">{m.plate_number_ar}</span>
                            <span className="text-xs text-slate-400 font-bold">{m.brand} {m.model}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 font-bold text-slate-700">{m.maintenance_person}</TableCell>
                        <TableCell className="py-6 text-slate-500 font-medium">{new Date(m.maintenance_date).toLocaleDateString('ar-SA')}</TableCell>
                        <TableCell className="py-6">
                          <span className="text-xl font-black text-emerald-600">{m.total_cost} <small className="text-[10px] text-slate-400 uppercase">SAR</small></span>
                        </TableCell>
                        <TableCell className="py-6">
                          <Badge className={`rounded-xl px-4 py-1.5 font-black text-xs ${
                            m.status === 'pending' 
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' 
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                          }`}>
                            {m.status === 'pending' ? 'قيد الانتظار' : 'تم الإصلاح'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6 px-8 text-left">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-11 w-11 rounded-xl text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-md transition-all border border-transparent hover:border-slate-100"
                              onClick={() => {
                                setSelectedMaintenance(m);
                                setTimeout(() => handlePrint(), 100);
                              }}
                            >
                              <Printer size={20} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                              <FileText size={20} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hidden Print Content */}
      <div style={{ display: 'none' }}>
        <MaintenanceReceipt ref={printRef} data={selectedMaintenance} companyName={companyName} />
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Sub-components
// ------------------------------------------------------------------------------------------------

function DashboardStatCard({ title, value, icon, color, desc, alert }: { title: string, value: number, icon: React.ReactNode, color: 'blue' | 'emerald' | 'amber' | 'rose', desc: string, alert?: boolean }) {
  const colorStyles = {
    blue: "bg-blue-600 text-blue-100 shadow-blue-200/50 border-blue-500",
    emerald: "bg-emerald-600 text-emerald-100 shadow-emerald-200/50 border-emerald-500",
    amber: "bg-amber-600 text-amber-100 shadow-amber-200/50 border-amber-500",
    rose: "bg-rose-600 text-rose-100 shadow-rose-200/50 border-rose-500",
  };

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative overflow-hidden border-2 p-6 rounded-[2rem] shadow-2xl transition-all ${colorStyles[color]} ${alert ? 'animate-pulse ring-4 ring-rose-500/30' : ''}`}
    >
      <div className="absolute -right-6 -top-6 opacity-20 transform rotate-12">{icon}</div>
      <div className="relative z-10 flex flex-col gap-1">
        <p className="text-sm font-bold uppercase tracking-widest opacity-80">{title}</p>
        <h3 className="text-4xl font-black">{value}</h3>
        <p className="text-xs font-medium mt-2 opacity-70">{desc}</p>
      </div>
    </motion.div>
  );
}

function AddVehicleDialog({ companyId, companyName, employees, vehicleCategories }: { companyId: number, companyName: string, employees: any[], vehicleCategories: any[] }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [driverSearch, setDriverSearch] = useState("");
  const [isOwnerCompany, setIsOwnerCompany] = useState(true);
  const [ownerName, setOwnerName] = useState(companyName);

  const filteredDrivers = employees.filter(e => 
    e.name?.includes(driverSearch) || e.iqama_number?.includes(driverSearch)
  );

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
        <Button className="h-16 px-8 rounded-2xl bg-white text-slate-900 font-black text-lg hover:bg-white shadow-xl hover:shadow-white/20 hover:-translate-y-1 transition-all border-none">
          <Plus className="ml-2 h-6 w-6 text-blue-500" /> إضافة مركبة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl rounded-[2.5rem] border-none shadow-3xl overflow-hidden p-0 bg-white">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative">
          <div className="absolute right-0 top-0 w-32 h-full bg-blue-500/10 blur-3xl rounded-full"></div>
          <DialogTitle className="text-3xl font-black">إضافة مركبة جديدة للأسطول</DialogTitle>
          <p className="text-slate-400 font-medium mt-1">تأكد من إدخال كافة البيانات الفنية والقانونية بدقة</p>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Section 1: Basic Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 border-r-4 border-blue-500 pr-4">
              <Car className="text-blue-500" /> معلومات المركبة الأساسية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">الفئة</label>
                <Select name="category_id">
                  <SelectTrigger className="h-12 rounded-xl border-slate-200">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">رقم اللوحة (عربي)</label>
                <Input name="plate_number_ar" required placeholder="أ ب ج 1234" className="h-12 rounded-xl border-slate-200 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">رقم اللوحة (إنجليزي)</label>
                <Input name="plate_number_en" placeholder="ABC 1234" className="h-12 rounded-xl border-slate-200 font-bold uppercase" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">الماركة (Brand)</label>
                <Input name="brand" required placeholder="مثال: Mercedes" className="h-12 rounded-xl border-slate-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">الموديل (Model)</label>
                <Input name="model" required placeholder="مثال: Actros" className="h-12 rounded-xl border-slate-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">سنة الصنع</label>
                <Input name="manufacture_year" type="number" placeholder="2024" className="h-12 rounded-xl border-slate-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">اللون</label>
                <Input name="color" placeholder="أبيض" className="h-12 rounded-xl border-slate-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">رقم الهيكل (VIN)</label>
                <Input name="chassis_number" placeholder="رقم الهيكل المكون من 17 خانة" className="h-12 rounded-xl border-slate-200 font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">الرقم التسلسلي</label>
                <Input name="serial_number" placeholder="رقم التسلسل" className="h-12 rounded-xl border-slate-200 font-mono" />
              </div>
            </div>
          </div>

          {/* Section 2: Owner & Driver */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 border-r-4 border-emerald-500 pr-4">
              <User className="text-emerald-500" /> المالك والسائق
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-slate-700">معلومات المالك</label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className={`h-8 rounded-lg font-bold ${isOwnerCompany ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}
                    onClick={() => {
                      setIsOwnerCompany(!isOwnerCompany);
                      if (!isOwnerCompany) setOwnerName(companyName);
                      else setOwnerName("");
                    }}
                  >
                    {isOwnerCompany ? 'اسم الشركة (تلقائي)' : 'إدخال يدوي'}
                  </Button>
                </div>
                <Input 
                  name="owner_name" 
                  value={ownerName} 
                  onChange={(e) => setOwnerName(e.target.value)} 
                  placeholder="اسم المالك" 
                  className="h-12 rounded-xl bg-white" 
                />
                <Input name="owner_id_number" placeholder="رقم هوية المالك / السجل" className="h-12 rounded-xl bg-white" />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-black text-slate-700">تعيين السائق</label>
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="ابحث بالاسم أو رقم الهوية..." 
                      className="h-11 pr-10 rounded-xl bg-slate-50 border-slate-200"
                      value={driverSearch}
                      onChange={(e) => setDriverSearch(e.target.value)}
                    />
                  </div>
                  <Select name="driver_id">
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white">
                      <SelectValue placeholder="اختر السائق من النتائج" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDrivers.map(emp => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          <div className="flex flex-col text-right">
                            <span className="font-bold">{emp.name}</span>
                            <span className="text-[10px] text-slate-400">{emp.iqama_number}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider">تاريخ استلام السائق</label>
                    <Input name="driver_receive_date" type="date" className="h-11 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Legal & Maintenance */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 border-r-4 border-amber-500 pr-4">
              <Shield className="text-amber-500" /> الوثائق القانونية والصيانة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">رقم وثيقة التأمين</label>
                <Input name="insurance_policy_number" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">انتهاء التأمين</label>
                <Input name="insurance_end_date" type="date" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">انتهاء الاستمارة</label>
                <Input name="registration_expiry_date" type="date" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">بطاقة التشغيل</label>
                <Input name="operation_card_expiry_date" type="date" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">العداد الحالي</label>
                <Input name="current_km" type="number" placeholder="0" className="h-12 rounded-xl font-black text-blue-600" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">آخر غيار زيت (كم)</label>
                <Input name="last_oil_change_km" type="number" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">صلاحية الزيت (كم)</label>
                <Input name="oil_valid_km" type="number" defaultValue="10000" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600">نوع الوقود</label>
                <Select name="fuel_type">
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diesel">ديزل (Diesel)</SelectItem>
                    <SelectItem value="91">بنزين 91</SelectItem>
                    <SelectItem value="95">بنزين 95</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-8 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-14 px-8 rounded-2xl font-bold text-slate-400">إلغاء</Button>
            <Button type="submit" disabled={loading} className="h-14 px-12 rounded-2xl bg-slate-900 text-white font-black text-lg hover:bg-slate-800 shadow-xl transition-all">
              {loading ? (
                <div className="flex items-center gap-3">
                  <RefreshCcw className="animate-spin" /> جاري الحفظ...
                </div>
              ) : "تأكيد إضافة المركبة"}
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
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);
  const [taxRate, setTaxRate] = useState(15);
  const [quantity, setQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);

  // Auto calculate unit price if total and quantity are provided
  useEffect(() => {
    if (quantity > 0 && totalPrice > 0) {
      setUnitPrice(Number((totalPrice / quantity).toFixed(2)));
    }
  }, [quantity, totalPrice]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Calculate tax amount for storage
    const calculatedTaxAmount = isTaxInclusive 
      ? (Number(totalPrice) - (Number(totalPrice) / (1 + (taxRate / 100))))
      : (Number(totalPrice) * (taxRate / 100));

    const result = await addSpare({ 
      ...data, 
      company_id: companyId,
      is_tax_inclusive: isTaxInclusive,
      tax_rate: taxRate,
      tax_amount: calculatedTaxAmount,
      unit_price: unitPrice,
      total_price: totalPrice
    });
    setLoading(false);
    
    if (result.success) {
      toast.success("تمت إضافة القطعة للمخزون بنجاح");
      setOpen(false);
      // Reset form
      setQuantity(0); setTotalPrice(0); setUnitPrice(0);
    } else {
      toast.error("فشل في إضافة القطعة: " + result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-16 px-8 rounded-2xl bg-slate-100 text-slate-700 font-black text-lg hover:bg-white shadow-lg hover:shadow-slate-200 transition-all border-none">
          <Package className="ml-2 h-6 w-6 text-emerald-500" /> إدارة المخزون
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl rounded-[2.5rem] border-none shadow-3xl overflow-hidden p-0 bg-white">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-8 text-white flex items-center justify-between">
          <div>
            <DialogTitle className="text-3xl font-black">إضافة قطعة غيار</DialogTitle>
            <p className="text-emerald-100 font-medium mt-1">تسجيل صنف جديد في مستودع الشركة</p>
          </div>
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
            <Package size={40} />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-black text-slate-600">اسم القطعة أو الصنف</label>
              <Input name="name" required placeholder="مثال: طقم تيل فرامل أمامي - أصلي" className="h-14 rounded-2xl border-slate-200 text-lg font-bold" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-600">الفئة</label>
              <Select name="category_id">
                <SelectTrigger className="h-12 rounded-xl border-slate-200">
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
              <label className="text-sm font-black text-slate-600">كود القطعة (رقم متسلسل)</label>
              <Input name="code" placeholder="P-0001" className="h-12 rounded-xl font-mono" />
            </div>

            <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 space-y-4 col-span-2">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-800 flex items-center gap-2">
                  <Calculator size={18} className="text-emerald-500" /> حسابات التكلفة والضريبة
                </h4>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-slate-500">شامل الضريبة؟</span>
                  <button 
                    type="button" 
                    onClick={() => setIsTaxInclusive(!isTaxInclusive)}
                    className={`w-10 h-6 rounded-full transition-all relative ${isTaxInclusive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isTaxInclusive ? 'right-5' : 'right-1'}`}></div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">الكمية</label>
                  <Input 
                    name="quantity" 
                    type="number" 
                    required 
                    value={quantity} 
                    onChange={(e) => setQuantity(Number(e.target.value))} 
                    className="h-12 rounded-xl border-slate-200 font-black text-center" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">إجمالي المبلغ بالفاتورة</label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={totalPrice} 
                    onChange={(e) => setTotalPrice(Number(e.target.value))} 
                    className="h-12 rounded-xl border-slate-200 font-black text-center" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">سعر الوحدة (تلقائي)</label>
                  <div className="h-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center font-black text-emerald-600 text-lg">
                    {unitPrice}
                  </div>
                  <input type="hidden" name="unit_price" value={unitPrice} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">سعر البيع (للفاتورة)</label>
                  <Input name="sale_price" type="number" step="0.01" placeholder="0.00" className="h-12 rounded-xl border-blue-200 focus:ring-blue-500/20 text-blue-700 font-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">نسبة الضريبة (%)</label>
                  <Input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="h-12 rounded-xl border-slate-200 font-bold" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-600">حد التنبيه (Low Stock)</label>
              <Input name="min_quantity" type="number" defaultValue="5" className="h-12 rounded-xl border-rose-100" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-600">المورد</label>
              <Input name="supplier" placeholder="اسم المورد أو الشركة" className="h-12 rounded-xl border-slate-200" />
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button type="submit" disabled={loading} className="w-full h-16 rounded-[1.5rem] bg-emerald-600 text-white font-black text-xl hover:bg-emerald-700 shadow-2xl shadow-emerald-200/50 transition-all">
              {loading ? "جاري المعالجة..." : "حفظ الصنف في المستودع"}
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
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all border border-blue-100">
          <Plus size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl p-8 max-w-sm">
        <DialogTitle className="text-2xl font-black mb-6">فئة قطع غيار جديدة</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">اسم الفئة</label>
            <Input name="name" required placeholder="مثل: نظام المحرك" className="h-12 rounded-xl" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-lg">
            {loading ? "جاري الحفظ..." : "إضافة الفئة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddVehicleCategoryDialog({ companyId }: { companyId: number }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    
    const result = await addVehicleCategory({ company_id: companyId, name, description });
    setLoading(false);
    
    if (result.success) {
      toast.success("تمت إضافة فئة المركبات بنجاح");
      setOpen(false);
    } else {
      toast.error("فشل في إضافة الفئة: " + result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="h-14 px-6 rounded-[1.25rem] font-bold gap-2 text-indigo-600 border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-all">
          <Tag size={20} /> إدارة الفئات
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2rem] p-8 max-w-md">
        <DialogTitle className="text-2xl font-black mb-2">إضافة فئة مركبات</DialogTitle>
        <p className="text-slate-400 font-medium mb-6">مثل: شاحنات ثقيلة، سيارات صغيرة، الخ...</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">اسم الفئة</label>
            <Input name="name" required placeholder="مثال: شاحنات نقل ثقيل" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">وصف مختصر</label>
            <Input name="description" placeholder="اختياري..." className="h-12 rounded-xl" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-indigo-600 text-white font-black hover:bg-indigo-700 shadow-lg shadow-indigo-200">
            {loading ? "جاري الحفظ..." : "حفظ الفئة الجديدة"}
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
  const [searchSpare, setSearchSpare] = useState("");
  const [searchVehicle, setSearchVehicle] = useState("");

  const filteredSpares = spares.filter(s => 
    s.name?.toLowerCase().includes(searchSpare.toLowerCase()) || 
    s.code?.toLowerCase().includes(searchSpare.toLowerCase())
  );

  const filteredVehicles = vehicles.filter(v => 
    v.plate_number_ar?.includes(searchVehicle) || 
    v.brand?.toLowerCase().includes(searchVehicle.toLowerCase())
  );

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
      toast.success("تم إنشاء أمر الصيانة بنجاح");
      setOpen(false);
      setSelectedSpares([]);
    } else {
      toast.error("فشل في إنشاء الطلب: " + result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-16 px-8 rounded-2xl bg-slate-900 text-white font-black text-lg hover:bg-slate-800 shadow-xl hover:-translate-y-1 transition-all border-none">
          <Wrench className="ml-2 h-6 w-6 text-amber-500" /> أمر صيانة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl rounded-[3rem] border-none shadow-3xl overflow-hidden p-0 bg-white">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white flex items-center justify-between">
          <div>
            <DialogTitle className="text-3xl font-black">إصدار أمر صيانة جديد</DialogTitle>
            <p className="text-slate-400 font-medium mt-1">تحديد قطع الغيار المستخدمة وتكلفة اليد العاملة</p>
          </div>
          <div className="p-4 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-xl">
            <Wrench size={48} className="text-amber-500" />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex h-[80vh] flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-10">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-800 border-r-4 border-blue-500 pr-4">بيانات العملية</h3>
                  
                  <div className="space-y-4">
                    <label className="text-sm font-black text-slate-700">المركبة المعنية</label>
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="ابحث برقم اللوحة..." 
                        className="h-11 pr-10 rounded-xl bg-slate-50 border-slate-200"
                        value={searchVehicle}
                        onChange={(e) => setSearchVehicle(e.target.value)}
                      />
                    </div>
                    <Select name="vehicle_id" required>
                      <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-white text-lg font-bold">
                        <SelectValue placeholder="اختر المركبة" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredVehicles.map(v => (
                          <SelectItem key={v.id} value={v.id.toString()}>
                            <div className="flex items-center gap-4 text-right">
                              <span className="font-black text-slate-800">{v.plate_number_ar}</span>
                              <span className="text-xs text-slate-400 font-bold">{v.brand} {v.model}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700">التاريخ</label>
                      <Input name="maintenance_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700">عداد الكيلومتر (KM)</label>
                      <Input name="current_km" type="number" required placeholder="0" className="h-12 rounded-xl font-black" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700">الفني أو الورشة المسؤولة</label>
                    <Input name="maintenance_person" required placeholder="اسم الشخص أو اسم مركز الصيانة" className="h-12 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700">شرح حالة المركبة / الملاحظات</label>
                    <textarea name="notes" rows={4} className="w-full rounded-2xl border border-slate-200 p-4 text-base font-medium focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-slate-50" placeholder="ما هي المشكلة التي تم إصلاحها؟"></textarea>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-8 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <Package size={24} className="text-emerald-500" /> اختيار قطع الغيار
                  </h3>
                  <div className="relative w-48">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="بحث..." 
                      className="h-10 pr-10 rounded-xl bg-white border-slate-200 text-xs"
                      value={searchSpare}
                      onChange={(e) => setSearchSpare(e.target.value)}
                    />
                  </div>
                </div>

                <ScrollArea className="h-[300px] pr-4">
                  <div className="grid gap-3">
                    {filteredSpares.map(spare => (
                      <motion.div 
                        layout
                        key={spare.id} 
                        className={`flex items-center justify-between rounded-2xl border-2 p-3 transition-all ${
                          selectedSpares.find(s => s.id === spare.id) 
                            ? "bg-white border-emerald-500 shadow-lg shadow-emerald-100" 
                            : "bg-white/80 border-transparent hover:border-slate-200"
                        }`}
                      >
                        <div className="flex-1 flex flex-col">
                          <span className="text-sm font-black text-slate-800">{spare.name}</span>
                          <span className="text-[10px] font-bold text-emerald-600 tracking-wider">السعر: {spare.unit_price} ريال</span>
                        </div>
                        <Button 
                          type="button" 
                          size="icon" 
                          variant={selectedSpares.find(s => s.id === spare.id) ? "default" : "outline"}
                          className={`h-10 w-10 rounded-xl transition-all ${
                            selectedSpares.find(s => s.id === spare.id) 
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                              : "text-slate-400 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                          }`}
                          onClick={() => toggleSpare(spare)}
                        >
                          {selectedSpares.find(s => s.id === spare.id) ? <CheckCircle2 size={20} /> : <Plus size={20} />}
                        </Button>
                      </motion.div>
                    ))}
                    {filteredSpares.length === 0 && (
                      <div className="py-10 text-center text-slate-400 font-medium italic">لم يتم العثور على نتائج</div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="flex-1 flex flex-col gap-4 border-t border-slate-200 pt-6 mt-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">القطع المضافة للفاتورة ({selectedSpares.length})</h4>
                  <div className="space-y-3 overflow-y-auto max-h-[200px] custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                      {selectedSpares.map(s => (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          key={s.id} 
                          className="flex items-center justify-between gap-4 rounded-2xl bg-white p-3 border border-slate-200 shadow-sm"
                        >
                          <div className="flex-1 flex flex-col">
                            <span className="text-xs font-black text-slate-800 truncate">{s.name}</span>
                            <span className="text-[10px] font-bold text-slate-400">الإجمالي: {(s.unit_price * s.quantity).toFixed(2)} ريال</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-100 px-2 py-1">
                              <button type="button" onClick={() => updateQuantity(s.id, s.quantity - 1)} className="h-6 w-6 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all">-</button>
                              <span className="text-sm font-black w-6 text-center">{s.quantity}</span>
                              <button type="button" onClick={() => updateQuantity(s.id, s.quantity + 1)} className="h-6 w-6 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all">+</button>
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" onClick={() => toggleSpare(s)}>
                              <X size={16} />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {selectedSpares.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-slate-300 opacity-50">
                        <Box size={32} />
                        <span className="text-[10px] font-bold mt-2">لا توجد قطع مضافة</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t bg-slate-900 p-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-black uppercase tracking-[0.2em]">إجمالي التكلفة التقديرية</span>
                <span className="text-4xl font-black text-emerald-400">{totalCost.toLocaleString()} <small className="text-sm opacity-50">SAR</small></span>
              </div>
              <div className="h-10 w-px bg-white/10 hidden md:block"></div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs text-slate-500 font-black uppercase tracking-[0.2em]">الحالة عند الحفظ</span>
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/10 px-3 py-1 font-bold">قيد المراجعة</Badge>
              </div>
            </div>
            <div className="flex gap-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-16 px-8 rounded-2xl font-bold text-white/50 hover:text-white hover:bg-white/5">إلغاء الأمر</Button>
              <Button type="submit" disabled={loading || totalCost === 0} className="h-16 rounded-[2rem] bg-blue-600 px-12 font-black text-xl text-white hover:bg-blue-500 shadow-2xl shadow-blue-900/50 transition-all hover:scale-105">
                {loading ? "جاري المعالجة..." : "إصدار وإغلاق الأمر"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------------------------------------------------------------------------
// Printable Receipt Component
// ------------------------------------------------------------------------------------------------

const MaintenanceReceipt = React.forwardRef<HTMLDivElement, { data: any, companyName: string }>(({ data, companyName }, ref) => {
  if (!data) return null;

  return (
    <div ref={ref} className="p-10 bg-white min-h-[1000px] relative font-sans" dir="rtl">
      {/* Header Decorative */}
      <div className="absolute top-0 right-0 left-0 h-4 bg-slate-900"></div>
      
      <div className="flex justify-between items-start mb-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">{companyName}</h1>
          <p className="text-slate-500 font-bold">إيصال صيانة مركبة رسمي</p>
          <div className="h-1 w-20 bg-blue-600"></div>
        </div>
        <div className="text-left space-y-1">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-lg">
            رقم الإيصال: {data.id.toString().padStart(6, '0')}
          </div>
          <p className="text-slate-400 font-medium text-xs">تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-10 mb-12">
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b pb-2">تفاصيل المركبة</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400">رقم اللوحة</p>
              <p className="text-lg font-black text-slate-800">{data.plate_number_ar}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">النوع / الموديل</p>
              <p className="text-lg font-bold text-slate-800">{data.brand} {data.model}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">عداد الكيلومتر</p>
              <p className="text-lg font-bold text-slate-800">{data.current_km.toLocaleString()} KM</p>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b pb-2">بيانات العملية</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400">الفني المسؤول</p>
              <p className="text-lg font-bold text-slate-800">{data.maintenance_person}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">تاريخ الصيانة</p>
              <p className="text-lg font-bold text-slate-800">{new Date(data.maintenance_date).toLocaleDateString('ar-SA')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b pb-4 mb-4">قطع الغيار والخدمات</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="py-4 px-4 text-right font-black text-slate-600 text-sm border">البيان</th>
              <th className="py-4 px-4 text-center font-black text-slate-600 text-sm border">الكمية</th>
              <th className="py-4 px-4 text-center font-black text-slate-600 text-sm border">سعر الوحدة</th>
              <th className="py-4 px-4 text-left font-black text-slate-600 text-sm border">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {/* Logic to show details would go here if fetched. For now, showing placeholder based on total */}
            <tr>
              <td className="py-6 px-4 border font-bold text-slate-700">تكاليف صيانة وقطع غيار متنوعة</td>
              <td className="py-6 px-4 border text-center font-bold">1</td>
              <td className="py-6 px-4 border text-center font-bold">{data.total_cost}</td>
              <td className="py-6 px-4 border text-left font-black text-slate-900">{data.total_cost} ر.س</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-24">
        <div className="w-1/3 space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-bold text-slate-500">المجموع الفرعي</span>
            <span className="font-bold text-slate-900">{data.total_cost} ر.س</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-bold text-slate-500">الضريبة (15%)</span>
            <span className="font-bold text-slate-900">{(data.total_cost * 0.15).toFixed(2)} ر.س</span>
          </div>
          <div className="flex justify-between items-center py-4 bg-slate-900 text-white px-4 rounded-xl">
            <span className="text-lg font-black">الإجمالي النهائي</span>
            <span className="text-xl font-black">{(data.total_cost * 1.15).toFixed(2)} ر.س</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-10 text-center pt-10 border-t border-slate-100">
        <div className="space-y-4">
          <p className="text-sm font-black text-slate-400">توقيع المسؤول</p>
          <div className="h-16 w-full border-b border-dashed border-slate-300"></div>
        </div>
        <div className="space-y-4">
          <p className="text-sm font-black text-slate-400">توقيع السائق</p>
          <div className="h-16 w-full border-b border-dashed border-slate-300"></div>
        </div>
        <div className="space-y-4">
          <p className="text-sm font-black text-slate-400">ختم الشركة</p>
          <div className="h-24 w-24 rounded-full border-2 border-dashed border-slate-200 mx-auto flex items-center justify-center opacity-30 italic text-[10px]">ختم رسمي</div>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 left-10 flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-widest">
        <span>ZoolSys Logistics Management System</span>
        <span>صالح للاستخدام الداخلي فقط</span>
      </div>
    </div>
  );
});

MaintenanceReceipt.displayName = "MaintenanceReceipt";
