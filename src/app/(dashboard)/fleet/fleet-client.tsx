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
import { addVehicle, addSpare, addSpareCategory, addVehicleCategory, createMaintenanceRequest, deleteVehicle, deleteMaintenanceRequest, getMaintenanceDetails } from "@/lib/actions/fleet";
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
    const [selectedMaintenanceDetails, setSelectedMaintenanceDetails] = useState<any[]>([]);
  
    // Sync state with props when server revalidates

  useEffect(() => {
    setVehicles(initialVehicles);
  }, [initialVehicles]);

  useEffect(() => {
    setSpares(initialSpares);
  }, [initialSpares]);

  useEffect(() => {
    setMaintenance(initialMaintenance);
  }, [initialMaintenance]);
  
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
              <AddVehicleCategoryDialog companyId={companyId} />
              <AddCategoryDialog companyId={companyId} />
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
                                title="طباعة الإيصال"
                                className="h-11 w-11 rounded-xl text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-md transition-all border border-transparent hover:border-blue-100"
                                onClick={async () => {
                                  setSelectedMaintenance(m);
                                  const res = await getMaintenanceDetails(m.id);
                                  if (res.success) {
                                    setSelectedMaintenanceDetails(res.details || []);
                                  }
                                  setTimeout(() => handlePrint(), 500);
                                }}
                              >
                                <Printer size={20} />
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
                </div>
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
  
  // ------------------------------------------------------------------------------------------------
  // Sub-components
  // ------------------------------------------------------------------------------------------------

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
            <div className="flex items-center gap-4 opacity-30 grayscale">
              <div className="h-10 w-10 rounded-lg bg-slate-200"></div>
              <div className="h-4 w-32 bg-slate-200 rounded-full"></div>
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
            <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl flex justify-between items-center transform scale-105 origin-left">
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
              <div className="w-16 h-16 rounded-full border-2 border-slate-100 flex items-center justify-center opacity-20">
                <User size={24} />
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-slate-50 border-double rotate-12 flex items-center justify-center opacity-10">
                <div className="text-[8px] font-black text-slate-400 text-center uppercase tracking-tighter">
                  OFFICIAL STAMP<br/>ZOOLSYS LOGISTICS<br/>{new Date().getFullYear()}
                </div>
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest relative z-10 mb-20">ختم الاعتماد الرسمي</p>
          </div>
        </div>

        <div className="absolute bottom-12 right-16 left-16 flex justify-between items-center text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">
          <span>ZOOLSYS PRO LOGISTICS MANAGEMENT</span>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <span>CONFIDENTIAL DOCUMENT</span>
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
          </div>
          <span>PAGE 01 OF 01</span>
        </div>
      </div>
    );
  });
  
  MaintenanceReceipt.displayName = "MaintenanceReceipt";

