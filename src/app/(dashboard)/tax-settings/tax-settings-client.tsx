"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Search, 
  Download, 
  Edit2, 
  Trash2, 
  Save, 
  Percent, 
  Package, 
  FileText,
  Settings,
  Tags,
  Box,
  ChartBar,
  Info,
  Users,
  ShoppingBag as ShoppingBagIcon,
  Archive
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/lib/locale-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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
import { toast } from "sonner";

interface TaxType {
  id: string;
  tax_code: string;
  name_ar: string;
  name_en: string;
  description: string;
  tax_rate: number;
  is_default: boolean;
  apply_to: string;
  status: string;
}

interface TaxSettings {
  tax_calculation_status: boolean;
  tax_included: boolean;
  tax_on_packaging: boolean;
  order_module_tax: boolean;
  parcel_module_tax: boolean;
  vendor_tax: boolean;
}

interface TaxSettingsClientProps {
  companyId: number;
}

export function TaxSettingsClient({ companyId }: TaxSettingsClientProps) {
  const t = useTranslations("sidebar.taxSettingsPage");
  const [activeTab, setActiveTab] = useState("taxTypes");
  const [taxTypes, setTaxTypes] = useState<TaxType[]>([]);
  const [settings, setSettings] = useState<TaxSettings>({
    tax_calculation_status: true,
    tax_included: false,
    tax_on_packaging: false,
    order_module_tax: false,
    parcel_module_tax: false,
    vendor_tax: false
  });
  const [isDialogOpen, setIsDialogOpened] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTaxTypes = useCallback(async () => {
    try {
      const response = await fetch(`/api/taxes/types?company_id=${companyId}`);
      const data = await response.json();
      if (data.success) {
        setTaxTypes(data.tax_types);
      }
    } catch (error) {
      console.error("Error fetching tax types:", error);
    }
  }, [companyId]);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(`/api/taxes/settings?company_id=${companyId}`);
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  }, [companyId]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchTaxTypes(), fetchSettings()]);
    };
    loadData();
  }, [fetchTaxTypes, fetchSettings]);

  const handleSaveSettings = async () => {
    try {
      const response = await fetch("/api/taxes/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, company_id: companyId })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(t("saveSuccess"));
      } else {
        toast.error(t("saveError"));
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(t("saveError"));
    }
  };

  const handleAddUpdateTax = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const taxData = {
      company_id: companyId,
      tax_code: formData.get("tax_code"),
      name_ar: formData.get("name_ar"),
      name_en: formData.get("name_en"),
      description: formData.get("description"),
      tax_rate: formData.get("tax_rate"),
      apply_to: formData.get("apply_to"),
      status: formData.get("status"),
      is_default: formData.get("is_default") === "on"
    };

    try {
      const url = editingTax ? `/api/taxes/types/${editingTax.id}` : "/api/taxes/types";
      const method = editingTax ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taxData)
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(editingTax ? "تم تحديث الضريبة" : "تم إضافة الضريبة");
        setIsDialogOpened(false);
        setEditingTax(null);
        fetchTaxTypes();
      } else {
        toast.error(data.error || "فشلت العملية");
      }
    } catch (error) {
      console.error("Error adding/updating tax:", error);
      toast.error("حدث خطأ ما");
    }
  };

  const handleDeleteTax = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    
    try {
      const response = await fetch(`/api/taxes/types/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        toast.success("تم حذف الضريبة");
        fetchTaxTypes();
      }
    } catch (error) {
      console.error("Error deleting tax:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const filteredTaxTypes = taxTypes.filter(tax => 
    tax.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tax.tax_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6" dir="rtl">
      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-[#1a2234] p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
          <Card className="relative bg-[#0d121f]/80 backdrop-blur-xl border-white/5 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                      <Percent className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-black text-white tracking-tight">{t("title")}</h1>
                      <p className="text-white/50 font-medium">{t("subtitle")}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => {
                      setEditingTax(null);
                      setIsDialogOpened(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-blue-500/25 px-6 h-12 rounded-xl font-bold"
                  >
                    <Plus className="w-5 h-5 me-2" />
                    {t("addTaxType")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Quick View */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Percent, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: t("standardTax"), value: "15%", trend: "+0%" },
            { icon: Box, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", label: t("taxedProducts"), value: "45", trend: "+12" },
            { icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", label: t("monthlyTaxes"), value: "1,250", trend: "+15%" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-[#0d121f]/60 backdrop-blur-xl border-white/5 hover:border-white/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 ${stat.bg} rounded-2xl border ${stat.border}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-white/70">
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                    <p className="text-white/40 font-bold text-sm uppercase tracking-wider mt-1">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-[#0d121f]/60 backdrop-blur-xl border border-white/5 p-1 rounded-2xl h-auto flex-wrap">
              {[
                { id: "taxTypes", icon: Tags, label: t("taxTypes"), color: "text-amber-400" },
                { id: "productTaxes", icon: Box, label: t("productTaxes"), color: "text-blue-400" },
                { id: "settings", icon: Settings, label: t("settings"), color: "text-emerald-400" },
                { id: "reports", icon: ChartBar, label: t("reports"), color: "text-purple-400" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white/70 rounded-xl px-6 py-3 font-bold transition-all"
                >
                  <tab.icon className={`w-4 h-4 me-2 ${tab.color}`} />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

          <TabsContent value="taxTypes" className="space-y-6 outline-none">
            <Card className="bg-[#0d121f]/60 backdrop-blur-xl border-white/5">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 p-6">
                <div>
                  <CardTitle className="text-white text-xl font-black">{t("taxTypes")}</CardTitle>
                  <CardDescription className="text-white/40 font-medium">إدارة أنواع الضرائب ومعدلاتها</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input 
                      placeholder="بحث..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white/5 border-white/10 text-white ps-10 w-64 rounded-xl focus:ring-blue-500/20"
                    />
                  </div>
                  <Button variant="outline" className="bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white rounded-xl">
                    <Download className="w-4 h-4 me-2" />
                    {t("export")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-white/40 font-bold uppercase text-[11px] tracking-widest">{t("taxCode")}</TableHead>
                      <TableHead className="text-white/40 font-bold uppercase text-[11px] tracking-widest">{t("taxName")}</TableHead>
                      <TableHead className="text-white/40 font-bold uppercase text-[11px] tracking-widest">{t("taxRate")}</TableHead>
                      <TableHead className="text-white/40 font-bold uppercase text-[11px] tracking-widest">{t("applyTo")}</TableHead>
                      <TableHead className="text-white/40 font-bold uppercase text-[11px] tracking-widest">{t("status")}</TableHead>
                      <TableHead className="text-white/40 font-bold uppercase text-[11px] tracking-widest text-center">{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {filteredTaxTypes.map((tax) => (
                        <motion.tr
                          key={tax.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-white/5 hover:bg-white/[0.02] transition-colors group"
                        >
                          <TableCell>
                            <code className="text-blue-400 font-mono font-bold bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
                              {tax.tax_code}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-white font-bold">{tax.name_ar}</span>
                              <span className="text-white/30 text-xs">{tax.name_en}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-emerald-400 font-black text-lg">{tax.tax_rate}%</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60">
                              {t(tax.apply_to)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                tax.status === "active" 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                  : "bg-red-500/10 text-red-400 border-red-500/20"
                              }
                            >
                              <div className={`w-1.5 h-1.5 rounded-full me-2 ${tax.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                              {t(tax.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                onClick={() => {
                                  setEditingTax(tax);
                                  setIsDialogOpened(true);
                                }}
                                variant="ghost" 
                                size="icon" 
                                className="text-white/30 hover:text-white hover:bg-white/10"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                onClick={() => handleDeleteTax(tax.id)}
                                variant="ghost" 
                                size="icon" 
                                className="text-red-400/30 hover:text-red-400 hover:bg-red-400/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
                {filteredTaxTypes.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="inline-flex p-4 rounded-full bg-white/5 border border-white/10 mb-4">
                      <Percent className="w-8 h-8 text-white/20" />
                    </div>
                    <h3 className="text-white font-bold">لا توجد ضرائب</h3>
                    <p className="text-white/30">ابدأ بإضافة أول نوع ضريبة لنظامك</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-[#0d121f]/60 backdrop-blur-xl border-white/5">
                <CardHeader className="border-b border-white/5">
                  <CardTitle className="text-white text-xl font-black">{t("settings")}</CardTitle>
                  <CardDescription className="text-white/40">تكوين القواعد العامة لحساب الضرائب</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/[0.08] transition-all">
                    <div className="space-y-1">
                      <Label className="text-white font-black text-base">{t("calculationStatus")}</Label>
                      <p className="text-white/40 text-xs font-medium">{t("calculationStatusDesc")}</p>
                    </div>
                    <Switch 
                      checked={settings.tax_calculation_status}
                      onCheckedChange={(val) => setSettings({ ...settings, tax_calculation_status: val })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/[0.08] transition-all">
                    <div className="space-y-1">
                      <Label className="text-white font-black text-base">{t("taxIncluded")}</Label>
                      <p className="text-white/40 text-xs font-medium">{t("taxIncludedDesc")}</p>
                    </div>
                    <Switch 
                      checked={settings.tax_included}
                      onCheckedChange={(val) => setSettings({ ...settings, tax_included: val })}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white/40 font-black text-[11px] uppercase tracking-widest">تطبيق الضريبة على الوحدات</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: "order_module_tax", label: t("orderModuleTax"), icon: ShoppingBagIcon },
                        { key: "parcel_module_tax", label: t("parcelModuleTax"), icon: Package },
                        { key: "vendor_tax", label: t("vendorTax"), icon: Users },
                        { key: "tax_on_packaging", label: t("taxOnPackaging"), icon: Archive }
                      ].map((module) => (
                        <div key={module.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                          <Label className="text-white font-bold text-sm">{module.label}</Label>
                          <Switch 
                            checked={(settings as any)[module.key as keyof TaxSettings]}
                            onCheckedChange={(val) => setSettings({ ...settings, [module.key]: val })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <Button 
                      onClick={handleSaveSettings}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black h-12 rounded-xl shadow-lg shadow-blue-500/20"
                    >
                      <Save className="w-5 h-5 me-2" />
                      حفظ الإعدادات
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0d121f]/60 backdrop-blur-xl border-white/5 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
                <CardHeader>
                  <CardTitle className="text-white text-xl font-black flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-400" />
                    دليل الإعدادات الضريبية
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 relative">
                  <div className="space-y-6">
                    {[
                      { title: "حساب الضريبة المضمنة", desc: "عند التفعيل، يتم استخراج الضريبة من السعر الإجمالي (السعر / 1.15). عند التعطيل، تضاف الضريبة فوق السعر (السعر * 1.15)." },
                      { title: "ضريبة وحدة الطرود", desc: "تطبق هذه الضريبة على رسوم الشحن والتوصيل للطرود الشخصية." },
                      { title: "ضريبة التاجر", desc: "تفعيل هذا الخيار يسمح للنظام بحساب ضريبة القيمة المضافة على العمولات والرسوم المستحقة من التجار." },
                    ].map((tip, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                          {i + 1}
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-white font-black text-sm">{tip.title}</h5>
                          <p className="text-white/40 text-xs leading-relaxed font-medium">{tip.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
