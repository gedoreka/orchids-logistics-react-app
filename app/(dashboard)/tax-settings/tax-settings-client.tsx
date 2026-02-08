"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus, Search, Download, Edit2, Trash2, Save, Percent,
  Package, FileText, Settings, Tags, Box, Info, Users,
  ShoppingBag, Archive, X, Loader2, AlertTriangle,
  CheckCircle2, AlertCircle, Printer, RefreshCw, Eye,
  Shield, Zap, Globe, ToggleLeft, ChevronDown, ChevronUp,
  Hash, Calendar, Target, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────
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
  created_at?: string;
}

interface TaxSettings {
  tax_calculation_status: boolean;
  tax_included: boolean;
  tax_on_packaging: boolean;
  order_module_tax: boolean;
  parcel_module_tax: boolean;
  vendor_tax: boolean;
  zatca_enabled?: boolean;
  zatca_environment?: string;
  zatca_vat_number?: string;
  zatca_vat_rate?: number;
  zatca_phase?: number;
  zatca_auto_signature?: boolean;
  zatca_immediate_send?: boolean;
}

interface Stats {
  totalTypes: number;
  activeCount: number;
  inactiveCount: number;
  defaultRate: number;
  avgRate: number;
}

interface TaxSettingsClientProps {
  companyId: number;
}

type ModalType = "idle" | "add-tax" | "edit-tax" | "view-tax" | "delete-confirm" | "deleting" | "delete-success" | "delete-error" | "notification";

interface ModalState {
  type: ModalType;
  taxId?: string | null;
  taxData?: TaxType | null;
  errorMessage?: string;
  notificationType?: "success" | "error" | "warning" | "info";
  notificationTitle?: string;
  notificationMessage?: string;
}

// ─── Main Component ──────────────────────────────────────────────
export function TaxSettingsClient({ companyId }: TaxSettingsClientProps) {
  // Data state
  const [taxTypes, setTaxTypes] = useState<TaxType[]>([]);
  const [settings, setSettings] = useState<TaxSettings>({
    tax_calculation_status: true,
    tax_included: false,
    tax_on_packaging: false,
    order_module_tax: false,
    parcel_module_tax: false,
    vendor_tax: false,
    zatca_enabled: false,
    zatca_environment: "sandbox",
    zatca_vat_number: "",
    zatca_vat_rate: 15,
    zatca_phase: 1,
    zatca_auto_signature: false,
    zatca_immediate_send: false,
  });
  const [stats, setStats] = useState<Stats>({ totalTypes: 0, activeCount: 0, inactiveCount: 0, defaultRate: 15, avgRate: 0 });

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"types" | "settings" | "zatca">("types");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [modal, setModal] = useState<ModalState>({ type: "idle" });

  // Form state for add/edit
  const [formData, setFormData] = useState({
    tax_code: "", name_ar: "", name_en: "", description: "",
    tax_rate: "15", apply_to: "all", status: "active", is_default: false,
  });

  // ─── Notification ──────────────────────────────────────────────
  const showNotification = useCallback((type: "success" | "error" | "warning" | "info", title: string, message: string) => {
    setModal({ type: "notification", notificationType: type, notificationTitle: title, notificationMessage: message });
    if (type === "success" || type === "info") {
      setTimeout(() => setModal(prev => prev.type === "notification" ? { type: "idle" } : prev), 2500);
    }
  }, []);

  // ─── Fetch Data ────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/taxes/types?company_id=${companyId}`);
      const data = await res.json();
      if (data.success) {
        setTaxTypes(data.tax_types || []);
        if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
        if (data.stats) setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Filtered data ─────────────────────────────────────────────
  const filteredTaxTypes = useMemo(() => {
    let filtered = taxTypes;
    if (statusFilter !== "all") {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name_ar.toLowerCase().includes(q) ||
        t.name_en?.toLowerCase().includes(q) ||
        t.tax_code.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [taxTypes, statusFilter, searchQuery]);

  // ─── Handlers ──────────────────────────────────────────────────
  const openAddModal = () => {
    setFormData({ tax_code: "", name_ar: "", name_en: "", description: "", tax_rate: "15", apply_to: "all", status: "active", is_default: false });
    setModal({ type: "add-tax" });
  };

  const openEditModal = (tax: TaxType) => {
    setFormData({
      tax_code: tax.tax_code, name_ar: tax.name_ar, name_en: tax.name_en || "",
      description: tax.description || "", tax_rate: String(tax.tax_rate),
      apply_to: tax.apply_to || "all", status: tax.status || "active", is_default: tax.is_default,
    });
    setModal({ type: "edit-tax", taxId: tax.id, taxData: tax });
  };

  const openViewModal = (tax: TaxType) => {
    setModal({ type: "view-tax", taxData: tax });
  };

  const openDeleteConfirm = (tax: TaxType) => {
    setModal({ type: "delete-confirm", taxId: tax.id, taxData: tax });
  };

  const closeModal = () => setModal({ type: "idle" });

  const handleSaveTax = async () => {
    if (!formData.tax_code || !formData.name_ar || !formData.tax_rate) {
      return showNotification("warning", "بيانات ناقصة", "يرجى ملء جميع الحقول المطلوبة");
    }

    setSaving(true);
    try {
      const isEdit = modal.type === "edit-tax";
      const url = isEdit ? `/api/taxes/types/${modal.taxId}` : "/api/taxes/types";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, company_id: companyId, tax_rate: formData.tax_rate }),
      });
      const data = await res.json();

      if (data.success) {
        showNotification("success", isEdit ? "تم التحديث" : "تمت الإضافة", isEdit ? "تم تحديث نوع الضريبة بنجاح" : "تمت إضافة نوع الضريبة بنجاح");
        fetchData();
      } else {
        showNotification("error", "خطأ", data.error || "فشل في حفظ البيانات");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!modal.taxId) return;
    const id = modal.taxId;
    setModal({ type: "deleting", taxId: id, taxData: modal.taxData });

    try {
      const res = await fetch(`/api/taxes/types/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setModal({ type: "delete-success", taxId: id, taxData: modal.taxData });
        fetchData();
      } else {
        setModal({ type: "delete-error", taxId: id, errorMessage: data.error || "فشل في الحذف" });
      }
    } catch {
      setModal({ type: "delete-error", taxId: id, errorMessage: "حدث خطأ أثناء الحذف" });
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/taxes/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, company_id: companyId }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", "تم الحفظ", "تم حفظ الإعدادات بنجاح");
      } else {
        showNotification("error", "خطأ", "فشل في حفظ الإعدادات");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  // ─── CSV Export ────────────────────────────────────────────────
  const exportCsv = () => {
    if (taxTypes.length === 0) return showNotification("warning", "تنبيه", "لا توجد بيانات للتصدير");
    const rows = ["رمز الضريبة,الاسم بالعربي,الاسم بالإنجليزي,النسبة,تطبيق على,الحالة"];
    taxTypes.forEach(t => {
      rows.push(`${t.tax_code},"${t.name_ar}","${t.name_en || ""}",${t.tax_rate}%,${t.apply_to},${t.status}`);
    });
    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tax-types-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification("success", "تم التصدير", "تم تصدير البيانات بنجاح");
  };

  // ─── Print ─────────────────────────────────────────────────────
  const handlePrint = () => {
    if (taxTypes.length === 0) return showNotification("warning", "تنبيه", "لا توجد بيانات للطباعة");
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const html = `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>إعدادات الضريبة</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,sans-serif;background:#fff;color:#1e293b;padding:40px}
      .header{background:linear-gradient(135deg,#1e40af,#7c3aed);color:#fff;padding:30px 40px;border-radius:16px;margin-bottom:30px;display:flex;justify-content:space-between;align-items:center}
      .header h1{font-size:24px;font-weight:900}.header p{font-size:12px;opacity:0.8;margin-top:4px}
      .info-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:30px}
      .info-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center}
      .info-card .val{font-size:28px;font-weight:900;color:#1e40af}.info-card .lbl{font-size:11px;color:#64748b;margin-top:4px}
      table{width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden}
      th{background:#f1f5f9;padding:12px 16px;font-size:11px;font-weight:800;text-transform:uppercase;color:#475569;text-align:right;border-bottom:2px solid #e2e8f0}
      td{padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:13px}
      tr:hover{background:#f8fafc}
      .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700}
      .active{background:#dcfce7;color:#16a34a}.inactive{background:#fef2f2;color:#dc2626}
      .rate{font-size:18px;font-weight:900;color:#059669}
      .footer{margin-top:30px;text-align:center;color:#94a3b8;font-size:11px;border-top:1px solid #e2e8f0;padding-top:20px}
      .settings-section{margin-top:30px;background:#f8fafc;border-radius:12px;padding:24px;border:1px solid #e2e8f0}
      .settings-section h3{font-size:16px;font-weight:800;margin-bottom:16px;color:#1e293b}
      .setting-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9}
      .setting-row .lbl{font-weight:600;color:#475569}.setting-row .val{font-weight:800}
      .on{color:#16a34a}.off{color:#dc2626}
      @media print{body{padding:20px}.header{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head>
      <body><div class="header"><div><h1>إعدادات الضريبة</h1><p>تقرير شامل لأنواع الضرائب والإعدادات</p></div><div style="text-align:left"><p>${new Date().toLocaleDateString("ar-SA")}</p><p style="font-size:11px">عدد الأنواع: ${taxTypes.length}</p></div></div>
      <div class="info-grid">
        <div class="info-card"><div class="val">${stats.defaultRate}%</div><div class="lbl">نسبة الضريبة الافتراضية</div></div>
        <div class="info-card"><div class="val">${stats.totalTypes}</div><div class="lbl">إجمالي الأنواع</div></div>
        <div class="info-card"><div class="val">${stats.activeCount}</div><div class="lbl">أنواع مفعلة</div></div>
        <div class="info-card"><div class="val">${stats.avgRate}%</div><div class="lbl">متوسط النسبة</div></div>
      </div>
      <table><thead><tr><th>رمز الضريبة</th><th>الاسم بالعربي</th><th>الاسم بالإنجليزي</th><th>النسبة</th><th>تطبيق على</th><th>الحالة</th><th>افتراضي</th></tr></thead><tbody>
      ${taxTypes.map(t => `<tr><td><strong>${t.tax_code}</strong></td><td>${t.name_ar}</td><td>${t.name_en || "-"}</td><td class="rate">${t.tax_rate}%</td><td>${t.apply_to === "all" ? "الكل" : t.apply_to === "products" ? "المنتجات" : t.apply_to === "services" ? "الخدمات" : "الشحن"}</td><td><span class="badge ${t.status === "active" ? "active" : "inactive"}">${t.status === "active" ? "مفعل" : "معطل"}</span></td><td>${t.is_default ? "نعم" : "-"}</td></tr>`).join("")}
      </tbody></table>
      <div class="settings-section"><h3>إعدادات الضريبة العامة</h3>
        <div class="setting-row"><span class="lbl">حالة حساب الضريبة</span><span class="val ${settings.tax_calculation_status ? "on" : "off"}">${settings.tax_calculation_status ? "مفعل" : "معطل"}</span></div>
        <div class="setting-row"><span class="lbl">الضريبة مشمولة في السعر</span><span class="val ${settings.tax_included ? "on" : "off"}">${settings.tax_included ? "نعم" : "لا"}</span></div>
        <div class="setting-row"><span class="lbl">ضريبة التغليف</span><span class="val ${settings.tax_on_packaging ? "on" : "off"}">${settings.tax_on_packaging ? "نعم" : "لا"}</span></div>
        <div class="setting-row"><span class="lbl">ضريبة الطلبات</span><span class="val ${settings.order_module_tax ? "on" : "off"}">${settings.order_module_tax ? "نعم" : "لا"}</span></div>
        <div class="setting-row"><span class="lbl">ضريبة الطرود</span><span class="val ${settings.parcel_module_tax ? "on" : "off"}">${settings.parcel_module_tax ? "نعم" : "لا"}</span></div>
        <div class="setting-row"><span class="lbl">ضريبة الموردين</span><span class="val ${settings.vendor_tax ? "on" : "off"}">${settings.vendor_tax ? "نعم" : "لا"}</span></div>
      </div>
      <div class="footer"><p>تم إنشاء التقرير بواسطة النظام المحاسبي - ${new Date().toLocaleString("ar-SA")}</p></div></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
  };

  // ─── Apply-to label ────────────────────────────────────────────
  const getApplyToLabel = (v: string) => {
    switch (v) {
      case "all": return "الكل";
      case "products": return "المنتجات";
      case "services": return "الخدمات";
      case "shipping": return "الشحن";
      default: return v;
    }
  };

  // ─── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
            <Loader2 size={48} className="text-blue-500 animate-spin relative z-10" />
          </div>
          <p className="text-slate-400 font-black text-sm">جاري تحميل إعدادات الضريبة...</p>
        </motion.div>
      </div>
    );
  }

  // ─── Tab counts ────────────────────────────────────────────────
  const statusTabs = [
    { key: "all" as const, label: "الكل", count: taxTypes.length, gradient: "from-slate-500 to-slate-600" },
    { key: "active" as const, label: "مفعل", count: stats.activeCount, gradient: "from-emerald-500 to-teal-600" },
    { key: "inactive" as const, label: "معطل", count: stats.inactiveCount, gradient: "from-red-500 to-rose-600" },
  ];

  return (
    <div className="min-h-screen pb-20 bg-transparent" dir="rtl">
      {/* ═══════════ Premium Modals ═══════════ */}
      <AnimatePresence>
        {modal.type !== "idle" && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !["deleting", "add-tax", "edit-tax", "view-tax"].includes(modal.type) && closeModal()}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
            />

            {/* ══ Add / Edit Tax Modal ══ */}
            {(modal.type === "add-tax" || modal.type === "edit-tax") && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-2xl bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.3)] overflow-hidden border-4 border-blue-500/20 max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 p-8 text-white text-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="absolute rounded-full bg-white/20" style={{
                        width: `${60 + i * 40}px`, height: `${60 + i * 40}px`,
                        top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                      }} />
                    ))}
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", damping: 15 }}
                    className="relative z-10 mx-auto w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-4 shadow-2xl border-4 border-white/30"
                  >
                    {modal.type === "edit-tax" ? <Edit2 size={36} className="text-white" /> : <Plus size={36} className="text-white" />}
                  </motion.div>
                  <h3 className="text-2xl font-black relative z-10">
                    {modal.type === "edit-tax" ? "تعديل نوع الضريبة" : "إضافة نوع ضريبة جديد"}
                  </h3>
                  <p className="text-white/70 font-medium mt-1 relative z-10">
                    {modal.type === "edit-tax" ? "قم بتعديل بيانات نوع الضريبة" : "أدخل بيانات نوع الضريبة الجديد"}
                  </p>
                  <button onClick={closeModal} className="absolute top-6 left-6 z-20 w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <X size={20} className="text-white" />
                  </button>
                </div>

                {/* Form */}
                <div className="p-8 space-y-6">
                  {/* Row 1: Code + Rate */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-white/60 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                        <Hash size={12} className="text-blue-400" /> رمز الضريبة *
                      </label>
                      <input
                        value={formData.tax_code}
                        onChange={(e) => setFormData({ ...formData, tax_code: e.target.value })}
                        placeholder="VAT-15"
                        className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/20 font-bold focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                        <Percent size={12} className="text-emerald-400" /> نسبة الضريبة (%) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.tax_rate}
                        onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                        placeholder="15"
                        className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/20 font-bold focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 2: Names */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-white/60 font-bold text-xs uppercase tracking-wider">الاسم بالعربي *</label>
                      <input
                        value={formData.name_ar}
                        onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                        placeholder="ضريبة القيمة المضافة"
                        className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/20 font-bold focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 font-bold text-xs uppercase tracking-wider">الاسم بالإنجليزي</label>
                      <input
                        value={formData.name_en}
                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                        placeholder="Value Added Tax"
                        className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/20 font-bold focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-white/60 font-bold text-xs uppercase tracking-wider">الوصف</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="وصف نوع الضريبة..."
                      rows={2}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/20 font-bold focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Row 3: Apply To + Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-white/60 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                        <Target size={12} className="text-amber-400" /> تطبيق على
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "all", label: "الكل" },
                          { value: "products", label: "المنتجات" },
                          { value: "services", label: "الخدمات" },
                          { value: "shipping", label: "الشحن" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setFormData({ ...formData, apply_to: opt.value })}
                            className={`px-3 py-2.5 rounded-xl text-xs font-black transition-all border-2 ${
                              formData.apply_to === opt.value
                                ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                        <Activity size={12} className="text-emerald-400" /> الحالة
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setFormData({ ...formData, status: "active" })}
                          className={`px-3 py-2.5 rounded-xl text-xs font-black transition-all border-2 ${
                            formData.status === "active"
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                              : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                          }`}
                        >
                          مفعل
                        </button>
                        <button
                          onClick={() => setFormData({ ...formData, status: "inactive" })}
                          className={`px-3 py-2.5 rounded-xl text-xs font-black transition-all border-2 ${
                            formData.status === "inactive"
                              ? "bg-red-500/20 border-red-500/50 text-red-300"
                              : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                          }`}
                        >
                          معطل
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Default toggle */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border-2 border-white/10">
                    <div>
                      <p className="text-white font-black text-sm">ضريبة افتراضية</p>
                      <p className="text-white/40 text-xs">تطبق تلقائياً على جميع العمليات</p>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, is_default: !formData.is_default })}
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                        formData.is_default ? "bg-blue-500" : "bg-white/10"
                      }`}
                    >
                      <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${
                        formData.is_default ? "left-7" : "left-0.5"
                      }`} />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={closeModal}
                      className="flex-1 flex items-center justify-center gap-3 bg-slate-800 text-slate-300 py-4 rounded-2xl font-black text-base hover:bg-slate-700 transition-colors"
                    >
                      <X size={18} /> إلغاء
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59,130,246,0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveTax}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-600 text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-blue-500/30 border-b-4 border-blue-700/50 disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      {saving ? "جاري الحفظ..." : modal.type === "edit-tax" ? "تحديث" : "حفظ"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ View Tax Detail Modal ══ */}
            {modal.type === "view-tax" && modal.taxData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.3)] overflow-hidden border-4 border-blue-500/20"
              >
                <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-8 text-white text-center overflow-hidden">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", damping: 15 }}
                    className="relative z-10 mx-auto w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-4 shadow-2xl border-4 border-white/30"
                  >
                    <Eye size={36} className="text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-black relative z-10">تفاصيل نوع الضريبة</h3>
                  <p className="text-white/70 font-bold mt-1 relative z-10">{modal.taxData.tax_code}</p>
                  <button onClick={closeModal} className="absolute top-6 left-6 z-20 w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <X size={20} className="text-white" />
                  </button>
                </div>
                <div className="p-8 space-y-4">
                  {[
                    { label: "رمز الضريبة", value: modal.taxData.tax_code, color: "text-blue-400" },
                    { label: "الاسم بالعربي", value: modal.taxData.name_ar, color: "text-white" },
                    { label: "الاسم بالإنجليزي", value: modal.taxData.name_en || "-", color: "text-white/70" },
                    { label: "النسبة", value: `${modal.taxData.tax_rate}%`, color: "text-emerald-400 text-2xl font-black" },
                    { label: "تطبيق على", value: getApplyToLabel(modal.taxData.apply_to), color: "text-amber-400" },
                    { label: "الحالة", value: modal.taxData.status === "active" ? "مفعل" : "معطل", color: modal.taxData.status === "active" ? "text-emerald-400" : "text-red-400" },
                    { label: "افتراضي", value: modal.taxData.is_default ? "نعم" : "لا", color: "text-white" },
                    { label: "الوصف", value: modal.taxData.description || "-", color: "text-white/60" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-white/40 font-bold text-xs uppercase tracking-wider">{item.label}</span>
                      <span className={`font-black text-sm ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={closeModal}
                    className="w-full mt-4 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-base shadow-xl shadow-blue-500/30"
                  >
                    إغلاق
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ══ Delete Confirm ══ */}
            {modal.type === "delete-confirm" && modal.taxData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.3)] overflow-hidden border-4 border-red-500/20"
              >
                <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center overflow-hidden">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", damping: 15 }}
                    className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                  >
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <AlertTriangle size={48} className="text-white drop-shadow-lg" />
                    </motion.div>
                  </motion.div>
                  <h3 className="text-3xl font-black tracking-tight relative z-10">تأكيد الحذف</h3>
                  <p className="text-white/80 font-bold mt-2 relative z-10">هل أنت متأكد من حذف هذا النوع؟</p>
                </div>
                <div className="p-8 text-center space-y-6">
                  <div className="bg-red-950/30 rounded-2xl p-6 border-2 border-red-900/50">
                    <p className="text-slate-300 font-bold text-lg">سيتم حذف نوع الضريبة نهائياً</p>
                    <p className="text-red-400 font-black text-xl mt-2">&quot;{modal.taxData.name_ar}&quot;</p>
                    <p className="text-slate-500 text-sm mt-1">{modal.taxData.tax_code} - {modal.taxData.tax_rate}%</p>
                  </div>
                  <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-3">
                    <p className="text-amber-400 text-xs font-bold">هذا الإجراء لا يمكن التراجع عنه</p>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal}
                      className="flex-1 flex items-center justify-center gap-3 bg-slate-800 text-slate-300 py-4 rounded-2xl font-black text-lg hover:bg-slate-700 transition-colors">
                      <X size={20} /> إلغاء
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(239,68,68,0.4)" }} whileTap={{ scale: 0.98 }} onClick={handleDelete}
                      className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-500/30 border-b-4 border-red-700/50">
                      <Trash2 size={20} /> تأكيد الحذف
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ Deleting ══ */}
            {modal.type === "deleting" && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-full max-w-md bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.3)] overflow-hidden border-4 border-blue-500/20">
                <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 p-10 text-white text-center">
                  <div className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30">
                    <Loader2 size={48} className="text-white animate-spin" />
                  </div>
                  <h3 className="text-2xl font-black relative z-10">جاري الحذف</h3>
                  <p className="text-white/80 font-bold mt-2 relative z-10">يرجى الانتظار...</p>
                </div>
                <div className="p-8">
                  <div className="bg-blue-950/30 rounded-2xl p-5 border-2 border-blue-900/50">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <p className="text-blue-400 font-bold text-center mt-3 text-sm">جاري حذف البيانات...</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ Delete Success ══ */}
            {modal.type === "delete-success" && (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="relative w-full max-w-lg bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(16,185,129,0.3)] overflow-hidden border-4 border-emerald-500/20">
                <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-10 text-white text-center overflow-hidden">
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: "spring", damping: 15 }}
                    className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30">
                    <CheckCircle2 size={48} className="text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-black relative z-10">تم الحذف بنجاح</h3>
                  <p className="text-white/80 font-bold mt-2 relative z-10">تم حذف نوع الضريبة نهائياً</p>
                </div>
                <div className="p-8 text-center">
                  <div className="bg-emerald-950/30 rounded-2xl p-6 border-2 border-emerald-900/50 mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10">
                      <Trash2 size={14} className="text-emerald-400" />
                      <span className="text-sm font-black text-emerald-300">{modal.taxData?.name_ar || ""}</span>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal}
                    className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-lg shadow-xl shadow-emerald-500/30">
                    إغلاق
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ══ Delete Error ══ */}
            {modal.type === "delete-error" && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-full max-w-md bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.2)] overflow-hidden border-4 border-red-500/20">
                <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center">
                  <div className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30">
                    <AlertCircle size={48} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-black relative z-10">فشل الحذف</h3>
                </div>
                <div className="p-8 text-center space-y-4">
                  <div className="bg-red-950/30 rounded-2xl p-4 border border-red-900/50">
                    <p className="text-red-400 font-bold text-sm">{modal.errorMessage}</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-800 text-white font-black text-lg hover:bg-slate-700 transition-colors">
                    حسناً
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ══ Notification Modal ══ */}
            {modal.type === "notification" && (() => {
              const nType = modal.notificationType || "info";
              const gradients: Record<string, string> = {
                success: "from-emerald-500 via-teal-600 to-emerald-700",
                error: "from-red-500 via-rose-600 to-red-700",
                warning: "from-amber-500 via-orange-600 to-amber-700",
                info: "from-blue-500 via-indigo-600 to-blue-700",
              };
              const shadows: Record<string, string> = {
                success: "shadow-[0_0_80px_rgba(16,185,129,0.3)] border-emerald-500/20",
                error: "shadow-[0_0_80px_rgba(239,68,68,0.3)] border-red-500/20",
                warning: "shadow-[0_0_80px_rgba(245,158,11,0.3)] border-amber-500/20",
                info: "shadow-[0_0_80px_rgba(59,130,246,0.3)] border-blue-500/20",
              };
              const icons: Record<string, React.ReactNode> = {
                success: <CheckCircle2 size={36} className="text-white" />,
                error: <AlertCircle size={36} className="text-white" />,
                warning: <AlertTriangle size={36} className="text-white" />,
                info: <Info size={36} className="text-white" />,
              };
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 30 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className={`relative w-full max-w-md bg-slate-900 rounded-[3rem] ${shadows[nType]} overflow-hidden border-4`}
                >
                  <div className={`relative bg-gradient-to-br ${gradients[nType]} p-8 text-white text-center overflow-hidden`}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", damping: 15 }}
                      className="relative z-10 mx-auto w-18 h-18 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-4 shadow-2xl border-4 border-white/30 p-4">
                      {icons[nType]}
                    </motion.div>
                    <h3 className="text-xl font-black relative z-10">{modal.notificationTitle}</h3>
                    <p className="text-white/80 font-bold mt-1 text-sm relative z-10">{modal.notificationMessage}</p>
                  </div>
                  <div className="p-6 text-center">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal}
                      className="w-full px-6 py-3.5 rounded-2xl bg-slate-800 text-white font-black hover:bg-slate-700 transition-colors">
                      حسناً
                    </motion.button>
                  </div>
                </motion.div>
              );
            })()}
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════ Page Content ═══════════ */}
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6" style={{ zoom: "0.9" }}>

        {/* ── Header ── */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/10">
                  <Settings className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">إعدادات الضريبة</h1>
                  <p className="text-white/40 font-medium mt-0.5">إدارة شاملة لأنواع الضرائب والإعدادات العامة</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={fetchData}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
                  <RefreshCw size={18} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handlePrint}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
                  <Printer size={18} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={exportCsv}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
                  <Download size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59,130,246,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openAddModal}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-blue-500/25 px-6 py-3 rounded-xl font-black transition-all"
                >
                  <Plus size={18} /> إضافة نوع ضريبة
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: Percent, label: "النسبة الافتراضية", value: `${stats.defaultRate}%`, gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20", iconBg: "bg-emerald-500/10", iconBorder: "border-emerald-500/20" },
            { icon: Tags, label: "إجمالي الأنواع", value: String(stats.totalTypes), gradient: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20", iconBg: "bg-blue-500/10", iconBorder: "border-blue-500/20" },
            { icon: Zap, label: "أنواع مفعلة", value: String(stats.activeCount), gradient: "from-purple-500 to-violet-600", shadow: "shadow-purple-500/20", iconBg: "bg-purple-500/10", iconBorder: "border-purple-500/20" },
            { icon: Activity, label: "أنواع معطلة", value: String(stats.inactiveCount), gradient: "from-red-500 to-rose-600", shadow: "shadow-red-500/20", iconBg: "bg-red-500/10", iconBorder: "border-red-500/20" },
            { icon: Target, label: "متوسط النسبة", value: `${stats.avgRate}%`, gradient: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/20", iconBg: "bg-amber-500/10", iconBorder: "border-amber-500/20" },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className={`relative group bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300 overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`p-2.5 ${card.iconBg} rounded-xl border ${card.iconBorder} w-fit mb-3`}>
                    <card.icon className="w-5 h-5 text-white/70" />
                  </div>
                  <h3 className="text-2xl font-black text-white">{card.value}</h3>
                  <p className="text-white/30 font-bold text-[10px] uppercase tracking-widest mt-1">{card.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Main Tabs ── */}
        <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-1.5">
          {[
            { key: "types" as const, label: "أنواع الضرائب", icon: Tags, color: "text-blue-400" },
            { key: "settings" as const, label: "الإعدادات العامة", icon: Settings, color: "text-emerald-400" },
            { key: "zatca" as const, label: "ZATCA / الفوترة الإلكترونية", icon: Shield, color: "text-purple-400" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-black transition-all ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <tab.icon size={16} className={activeTab === tab.key ? "text-white" : tab.color} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ Tab: Tax Types ═══ */}
        {activeTab === "types" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Status filter + search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-1.5 flex-shrink-0">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                      statusFilter === tab.key
                        ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                        : "text-white/50 hover:text-white/80 hover:bg-white/5"
                    }`}
                  >
                    {tab.label}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      statusFilter === tab.key ? "bg-white/20 text-white" : "bg-white/5 text-white/30"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث بالاسم أو الرمز..."
                  className="w-full bg-slate-900/60 border border-white/5 rounded-2xl pe-11 ps-4 py-3 text-white placeholder-white/20 font-bold text-sm focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Tax Types List */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredTaxTypes.map((tax, index) => (
                  <motion.div
                    key={tax.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-transparent to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-500" />
                    <div className="relative z-10 flex items-center gap-5">
                      {/* Tax Code Badge */}
                      <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl border border-blue-500/20">
                        <code className="text-blue-400 font-mono font-black text-sm">{tax.tax_code}</code>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-white font-black text-base truncate">{tax.name_ar}</h3>
                          {tax.is_default && (
                            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-[10px] font-black">
                              افتراضي
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-white/30 text-xs font-medium">{tax.name_en || "-"}</span>
                          <span className="text-white/10">|</span>
                          <span className="text-white/30 text-xs font-medium">تطبيق: {getApplyToLabel(tax.apply_to)}</span>
                        </div>
                      </div>

                      {/* Rate */}
                      <div className="flex-shrink-0 text-center">
                        <span className="text-2xl font-black text-emerald-400">{tax.tax_rate}%</span>
                        <p className="text-white/20 text-[10px] font-bold mt-0.5">النسبة</p>
                      </div>

                      {/* Status */}
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border ${
                          tax.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${tax.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                          {tax.status === "active" ? "مفعل" : "معطل"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => openViewModal(tax)}
                          className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-500/20 transition-all">
                          <Eye size={16} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => openEditModal(tax)}
                          className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 hover:bg-amber-500/20 transition-all">
                          <Edit2 size={16} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => openDeleteConfirm(tax)}
                          className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-all">
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredTaxTypes.length === 0 && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-16 text-center">
                  <div className="inline-flex p-5 rounded-full bg-white/5 border border-white/10 mb-4">
                    <Percent className="w-10 h-10 text-white/15" />
                  </div>
                  <h3 className="text-white/50 font-black text-lg">لا توجد أنواع ضرائب</h3>
                  <p className="text-white/20 text-sm mt-1">قم بإضافة نوع ضريبة جديد للبدء</p>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={openAddModal}
                    className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-blue-500/25">
                    <Plus size={16} /> إضافة نوع ضريبة
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ Tab: General Settings ═══ */}
        {activeTab === "settings" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Settings Card */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <ToggleLeft className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg">الإعدادات العامة</h3>
                    <p className="text-white/30 text-xs font-medium">تحكم في حساب الضرائب والتطبيقات</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Main Toggles */}
                {[
                  { key: "tax_calculation_status", label: "حالة حساب الضريبة", desc: "تفعيل أو تعطيل حساب الضرائب على جميع العمليات", icon: Zap, color: "emerald" },
                  { key: "tax_included", label: "الضريبة مشمولة في السعر", desc: "تضمين الضريبة في أسعار المنتجات والخدمات", icon: Tags, color: "blue" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-${item.color}-500/10 rounded-xl border border-${item.color}-500/20`}>
                        <item.icon size={16} className={`text-${item.color}-400`} />
                      </div>
                      <div>
                        <p className="text-white font-black text-sm">{item.label}</p>
                        <p className="text-white/30 text-xs font-medium">{item.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, [item.key]: !(settings as any)[item.key] })}
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                        (settings as any)[item.key] ? "bg-emerald-500" : "bg-white/10"
                      }`}
                    >
                      <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${
                        (settings as any)[item.key] ? "left-7" : "left-0.5"
                      }`} />
                    </button>
                  </div>
                ))}

                {/* Module Toggles */}
                <div className="pt-2">
                  <p className="text-white/20 font-black text-[10px] uppercase tracking-widest mb-3 px-1">تطبيق الضريبة على الوحدات</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "order_module_tax", label: "وحدة الطلبات", icon: ShoppingBag },
                      { key: "parcel_module_tax", label: "وحدة الطرود", icon: Package },
                      { key: "vendor_tax", label: "ضريبة الموردين", icon: Users },
                      { key: "tax_on_packaging", label: "ضريبة التغليف", icon: Archive },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-xl border border-white/5 hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-2.5">
                          <item.icon size={14} className="text-white/40" />
                          <span className="text-white/70 font-bold text-xs">{item.label}</span>
                        </div>
                        <button
                          onClick={() => setSettings({ ...settings, [item.key]: !(settings as any)[item.key] })}
                          className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                            (settings as any)[item.key] ? "bg-blue-500" : "bg-white/10"
                          }`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300 ${
                            (settings as any)[item.key] ? "left-5" : "left-0.5"
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-white/5">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59,130,246,0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-blue-500/25 disabled:opacity-50 transition-all"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Guide Card */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
              <div className="p-6 border-b border-white/5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Info className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg">دليل الإعدادات</h3>
                    <p className="text-white/30 text-xs font-medium">كيفية إدارة إعدادات الضريبة</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4 relative z-10">
                {[
                  { title: "إضافة نوع ضريبة", desc: "أضف أنواع ضرائب مختلفة بنسب متعددة حسب احتياجات عملك", icon: Plus, color: "blue" },
                  { title: "تفعيل الحساب التلقائي", desc: "فعّل حساب الضريبة التلقائي ليتم تطبيقه على جميع الفواتير والعمليات", icon: Zap, color: "emerald" },
                  { title: "ربط مع زاتكا", desc: "اربط نظامك مع هيئة الزكاة والضريبة للفوترة الإلكترونية", icon: Shield, color: "purple" },
                  { title: "تقارير الضرائب", desc: "راجع تقارير الضرائب الشهرية والربع سنوية من صفحة الإقرارات الضريبية", icon: FileText, color: "amber" },
                ].map((tip, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-${tip.color}-500/10 border border-${tip.color}-500/20 flex items-center justify-center`}>
                      <tip.icon size={16} className={`text-${tip.color}-400`} />
                    </div>
                    <div>
                      <h5 className="text-white font-black text-sm">{tip.title}</h5>
                      <p className="text-white/30 text-xs leading-relaxed mt-0.5">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

          {/* ═══ Tab: ZATCA ═══ */}
          {activeTab === "zatca" && (
            <ZatcaTab
              companyId={companyId}
              settings={settings}
              setSettings={setSettings}
              saving={saving}
              handleSaveSettings={handleSaveSettings}
              showNotification={showNotification}
            />
          )}
      </div>
    </div>
  );
}

// ─── X509 Certificate Display Component ─────────────────────────
function X509CertificateCard({ certBase64 }: { certBase64: string }) {
  // Parse basic cert info from base64 DER
  const certInfo = useMemo(() => {
    try {
      const der = atob(certBase64);

      // Try to find serial number (large integer near start)
      let serialHex = "";
      for (let i = 0; i < Math.min(der.length, 100); i++) {
        if (der.charCodeAt(i) === 0x02) { // INTEGER tag
          const len = der.charCodeAt(i + 1);
          if (len > 10 && len < 40) {
            for (let j = 0; j < len; j++) {
              serialHex += der.charCodeAt(i + 2 + j).toString(10);
            }
            break;
          }
        }
      }

      // Find strings that look like org/CN/country
      const strings: string[] = [];
      for (let i = 0; i < der.length - 3; i++) {
        const tag = der.charCodeAt(i);
        if (tag === 0x0c || tag === 0x13) { // UTF8String or PrintableString
          const len = der.charCodeAt(i + 1);
          if (len > 1 && len < 100 && i + 2 + len <= der.length) {
            const str = der.substring(i + 2, i + 2 + len);
            if (/^[\x20-\x7E\u0600-\u06FF]+$/.test(str)) {
              strings.push(str);
            }
          }
        }
      }

      // Heuristic: find CN, O, OU, C from cert strings
      const country = strings.find(s => s === "SA") || "SA";
      const org = strings.find(s => s.length > 5 && s !== "SA" && !s.includes("ZATCA") && !s.startsWith("EGS")) || "";
      const cn = strings.find(s => s.startsWith("EGS") || s.includes("TST")) || strings.find(s => s.length > 10) || "";
      const ou = strings.find(s => /RIYADH|riyadh|Riyadh|Jeddah|Dammam/i.test(s)) || "";

      return {
        serialNumber: serialHex || "N/A",
        cn: cn || "N/A",
        org: org || "N/A",
        ou: ou || "N/A",
        country,
        notBefore: "تم الإصدار بنجاح",
        notAfter: "",
      };
    } catch {
      return null;
    }
  }, [certBase64]);

  if (!certInfo) return null;

  return (
    <div className="relative bg-gradient-to-br from-yellow-50/10 to-green-50/10 rounded-2xl border-4 border-purple-500/30 p-6 overflow-hidden">
      {/* Decorative star */}
      <div className="absolute top-4 right-4">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M20 0L24.5 15.5L40 20L24.5 24.5L20 40L15.5 24.5L0 20L15.5 15.5Z" fill="rgb(147,51,234)" fillOpacity="0.6"/>
        </svg>
      </div>

      <h4 className="text-xl font-black text-white text-center mb-4">
        شهادة رقمية <span className="text-purple-300">X509Certificate</span>
      </h4>

      <div className="space-y-2 text-sm text-center">
        {certInfo.serialNumber !== "N/A" && (
          <p className="text-white/60">
            <span className="text-white/40">الرقم التسلسلي: </span>
            <span className="font-mono text-xs text-white/50">{certInfo.serialNumber.substring(0, 40)}...</span>
          </p>
        )}
        {certInfo.cn !== "N/A" && (
          <p className="text-white/70">
            <span className="text-white/40">الاسم العام: </span>
            <span className="font-bold">{certInfo.cn}</span>
          </p>
        )}
        {certInfo.org !== "N/A" && (
          <p className="text-white/70">
            <span className="text-white/40">المنظمة: </span>
            <span className="font-bold">{certInfo.org}</span>
          </p>
        )}
        {certInfo.ou !== "N/A" && (
          <p className="text-white/70">
            <span className="text-white/40">الوحدة التنظيمية: </span>
            <span className="font-bold">{certInfo.ou}</span>
          </p>
        )}
        <p className="text-white/70">
          <span className="text-white/40">الدولة: </span>
          <span className="font-bold">{certInfo.country}</span>
        </p>
      </div>

      <p className="text-emerald-400 text-xs font-bold text-center mt-4">
        تم التحقق من صحة هذه الشهادة وإصدارها بواسطة هيئة الزكاة والضريبة
      </p>
    </div>
  );
}

// ─── Compliance Test Item Component ──────────────────────────────
function ComplianceTestItem({
  label,
  status,
  isRunning,
}: {
  label: string;
  status: "pending" | "success" | "failed" | "warning" | "running";
  isRunning: boolean;
}) {
  const bgColor = status === "success" ? "bg-emerald-500" :
    status === "failed" ? "bg-red-500" :
    status === "warning" ? "bg-amber-500" :
    isRunning ? "bg-blue-500/50" : "bg-cyan-100/10";
  const textColor = status === "success" || status === "failed" || status === "warning"
    ? "text-white" : isRunning ? "text-blue-200" : "text-white/70";
  const borderColor = status === "success" ? "border-emerald-400/30" :
    status === "failed" ? "border-red-400/30" :
    status === "warning" ? "border-amber-400/30" :
    "border-white/5";

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${bgColor} border ${borderColor} transition-all duration-500`}>
      <div className="flex-shrink-0">
        {status === "success" ? (
          <CheckCircle2 size={20} className="text-white" />
        ) : status === "failed" ? (
          <AlertCircle size={20} className="text-white" />
        ) : status === "warning" ? (
          <AlertTriangle size={20} className="text-white" />
        ) : isRunning ? (
          <Loader2 size={20} className="text-blue-200 animate-spin" />
        ) : (
          <Info size={20} className="text-blue-400" />
        )}
      </div>
      <span className={`font-bold text-sm flex-1 text-center ${textColor}`}>
        {label}
        {status === "success" && " تم بنجاح"}
      </span>
    </div>
  );
}

// ─── ZATCA Tab Component ─────────────────────────────────────────
function ZatcaTab({
  companyId,
  settings,
  setSettings,
  saving,
  handleSaveSettings,
  showNotification,
}: {
  companyId: number;
  settings: TaxSettings;
  setSettings: (s: TaxSettings) => void;
  saving: boolean;
  handleSaveSettings: () => Promise<void>;
  showNotification: (type: "success" | "error" | "warning" | "info", title: string, message: string) => void;
}) {
  const [credentials, setCredentials] = useState<any>(null);
  const [credLoading, setCredLoading] = useState(true);
  const [stepLoading, setStepLoading] = useState("");
  const [otp, setOtp] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgId, setOrgId] = useState("");
  const [commonName, setCommonName] = useState("");
  const [location, setLocation] = useState("Riyadh");
  const [industry, setIndustry] = useState("Logistics");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [complianceResults, setComplianceResults] = useState<Array<{
    id: string;
    label_ar: string;
    status: "pending" | "success" | "failed" | "warning" | "running";
  }>>([]);
  const [complianceRunning, setComplianceRunning] = useState(false);
  const [allCompliancePassed, setAllCompliancePassed] = useState(false);

  // Fetch credentials on mount
  useEffect(() => {
    fetchCredentials();
    fetchSubmissions();
  }, [companyId]);

  const fetchCredentials = async () => {
    try {
      const res = await fetch(`/api/zatca/credentials?company_id=${companyId}`);
      const data = await res.json();
      if (data.success) setCredentials(data.credentials);
    } catch { /* ignore */ }
    finally { setCredLoading(false); }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`/api/zatca/submissions?company_id=${companyId}&limit=10`);
      const data = await res.json();
      if (data.success) setSubmissions(data.submissions || []);
    } catch { /* ignore */ }
  };

  // Step 1: Generate Keys & CSR
  const handleGenerateKeys = async () => {
    if (!orgName || !orgId) {
      return showNotification("warning", "بيانات ناقصة", "يرجى إدخال اسم المنشأة ورقم التسجيل");
    }
    setStepLoading("keys");
    try {
      const res = await fetch("/api/zatca/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          organization_name: orgName,
          organization_identifier: orgId,
          common_name: commonName || undefined,
          location: location || "Riyadh",
          industry: industry || "Logistics",
          environment: settings.zatca_environment || "sandbox",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", "تم إنشاء المفاتيح", "تم إنشاء مفاتيح التشفير و CSR بنجاح");
        fetchCredentials();
      } else {
        showNotification("error", "خطأ", data.error);
      }
    } catch {
      showNotification("error", "خطأ", "فشل في إنشاء المفاتيح");
    } finally { setStepLoading(""); }
  };

  // Step 2: Onboarding (CCSID) with OTP
  const handleOnboarding = async () => {
    if (!otp) return showNotification("warning", "OTP مطلوب", "أدخل رمز OTP من بوابة هيئة الزكاة");
    setStepLoading("onboarding");
    try {
      const res = await fetch("/api/zatca/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId, otp }),
      });
      const data = await res.json();
      if (data.success) {
          showNotification("success", "تم إنشاء شهادة موقته بنجاح", data.message || "تم الحصول على CCSID بنجاح");
          fetchCredentials();
        } else {
          const msg = data.hint ? `${data.error}\n${data.hint}` : data.error;
          showNotification("error", "خطأ", msg);
        }
    } catch {
      showNotification("error", "خطأ", "فشل التسجيل");
    } finally { setStepLoading(""); }
  };

  // Step 3: Run all 6 compliance checks
  const handleCompliance = async () => {
    setComplianceRunning(true);
    setAllCompliancePassed(false);

    // Initialize all tests as pending
    const testDefs = [
      { id: "simplified_invoice", label_ar: "مشاركة الفاتورة المبسطة في منصة فاتورة" },
      { id: "simplified_debit_note", label_ar: "مشاركة الاشعار الالكتروني المدين في منصة فاتورة" },
      { id: "simplified_credit_note", label_ar: "مشاركة الاشعار الالكتروني الدائن في منصة فاتورة" },
      { id: "standard_invoice", label_ar: "إعتماد الفاتورة الضريبية في منصة فاتورة" },
      { id: "standard_debit_note", label_ar: "إعتماد الاشعار الالكتروني المدين في منصة فاتورة" },
      { id: "standard_credit_note", label_ar: "إعتماد الاشعار الالكتروني الدائن في منصة فاتورة" },
    ];

    setComplianceResults(testDefs.map(t => ({ id: t.id, label_ar: t.label_ar, status: "pending" as const })));

    try {
      // Run all tests at once via API
      const res = await fetch("/api/zatca/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId }),
      });
      const data = await res.json();

      if (data.success && data.results) {
        // Update results from API response
        setComplianceResults(data.results.map((r: any) => ({
          id: r.id,
          label_ar: testDefs.find(t => t.id === r.id)?.label_ar || r.label_ar,
          status: r.status,
        })));

        if (data.allPassed) {
          setAllCompliancePassed(true);
          showNotification("success", "اجتياز جميع الاختبارات", "تم اجتياز جميع اختبارات المطابقة بنجاح");
        } else {
          showNotification("warning", "بعض الاختبارات فشلت", "لم يتم اجتياز جميع اختبارات المطابقة");
        }
      } else {
        setComplianceResults(testDefs.map(t => ({ id: t.id, label_ar: t.label_ar, status: "failed" as const })));
        showNotification("error", "خطأ", data.error || "فشل اختبار المطابقة");
      }
    } catch {
      setComplianceResults(testDefs.map(t => ({ id: t.id, label_ar: t.label_ar, status: "failed" as const })));
      showNotification("error", "خطأ", "فشل اختبار المطابقة");
    } finally {
      setComplianceRunning(false);
    }
  };

  // Step 4: Production CSID
  const handleProduction = async () => {
    setStepLoading("production");
    try {
      const res = await fetch("/api/zatca/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", "جاهز للإنتاج", data.message || "تم الحصول على شهادة الإنتاج بنجاح - صالحة لمدة 5 سنوات");
        fetchCredentials();
      } else {
        showNotification("error", "خطأ", data.error);
      }
    } catch {
      showNotification("error", "خطأ", "فشل الحصول على شهادة الإنتاج");
    } finally { setStepLoading(""); }
  };

  const getStatusStep = () => {
    if (!credentials) return 0;
    switch (credentials.status) {
      case "pending": return 1;
      case "compliance": return 2;
      case "production": return 4;
      case "active": return 4;
      default: return 0;
    }
  };

  const statusStep = getStatusStep();

  const statusColors: Record<string, string> = {
    success: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    failed: "text-red-400 bg-red-500/10 border-red-500/20",
    warning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    pending: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  };

  const envLabel = settings.zatca_environment === "production" ? "الوضع الفعلي" :
    settings.zatca_environment === "simulation" ? "وضع المحاكاة" : "الوضع التجريبي";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* ZATCA Header + Settings */}
      <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl border border-purple-500/20">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">الربط مع هيئة الزكاة والضريبة</h2>
              <p className="text-red-400 font-bold text-sm">{envLabel}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <Zap size={18} className="text-purple-400" />
                <div>
                  <p className="text-white font-black text-sm">تفعيل ZATCA</p>
                  <p className="text-white/30 text-xs">ربط مع هيئة الزكاة</p>
                </div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, zatca_enabled: !settings.zatca_enabled })}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${settings.zatca_enabled ? "bg-purple-500" : "bg-white/10"}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${settings.zatca_enabled ? "left-7" : "left-0.5"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-blue-400" />
                <div>
                  <p className="text-white font-black text-sm">البيئة</p>
                  <p className="text-white/30 text-xs">اختر بيئة العمل</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[
                  { value: "sandbox", label: "تجريبي" },
                  { value: "simulation", label: "محاكاة" },
                  { value: "production", label: "إنتاجي" },
                ].map((env) => (
                  <button key={env.value}
                    onClick={() => setSettings({ ...settings, zatca_environment: env.value })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      settings.zatca_environment === env.value
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                    }`}
                  >{env.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* VAT fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <label className="text-white/40 font-bold text-xs">رقم التسجيل الضريبي (VAT)</label>
              <input value={settings.zatca_vat_number || ""}
                onChange={(e) => setSettings({ ...settings, zatca_vat_number: e.target.value })}
                placeholder="3XXXXXXXX00003"
                className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 font-bold text-sm focus:border-purple-500/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-white/40 font-bold text-xs">نسبة الضريبة %</label>
              <input type="number" value={settings.zatca_vat_rate || 15}
                onChange={(e) => setSettings({ ...settings, zatca_vat_rate: parseFloat(e.target.value) })}
                className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:border-purple-500/50 outline-none transition-all"
              />
            </div>
            <div className="flex items-end gap-2">
              {[
                { key: "zatca_auto_signature", label: "توقيع تلقائي" },
                { key: "zatca_immediate_send", label: "إرسال فوري" },
              ].map((item) => (
                <button key={item.key}
                  onClick={() => setSettings({ ...settings, [item.key]: !(settings as any)[item.key] })}
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all border-2 ${
                    (settings as any)[item.key]
                      ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                      : "bg-white/5 border-white/10 text-white/40"
                  }`}
                >{item.label}</button>
              ))}
            </div>
          </div>

          {/* Save settings */}
          <div className="mt-4 flex justify-end">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSaveSettings} disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-purple-500/25 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ─── Onboarding Wizard ─── */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8">
        <h3 className="text-xl font-black text-white mb-2 flex items-center gap-3">
          <Shield size={20} className="text-purple-400" />
          الربط مع هيئة الزكاة والضريبة
        </h3>
        <p className="text-red-400 font-bold text-sm mb-6">{envLabel}</p>

        {/* Progress Steps Bar */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { step: 1, label: "إنشاء المفاتيح والشهادة" },
            { step: 2, label: "اختبار النماذج" },
            { step: 3, label: "شهادة الإنتاج" },
          ].map((s, i) => (
            <React.Fragment key={s.step}>
              <div className={`flex-1 h-10 rounded-lg flex items-center justify-center text-sm font-black transition-all ${
                statusStep >= s.step
                  ? "bg-emerald-500 text-white"
                  : statusStep === s.step - 1 || (s.step === 2 && statusStep >= 2 && statusStep < 4)
                  ? "bg-blue-500/30 text-blue-200 border border-blue-500/30"
                  : "bg-white/5 text-white/30 border border-white/10"
              }`}>
                <span className="ml-2 font-black">{s.step}</span>
              </div>
              {i < 2 && <div className={`w-8 h-0.5 ${statusStep > s.step ? "bg-emerald-500" : "bg-white/10"}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        {credLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="text-purple-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">

            {/* ═══ Step 1: Generate Keys + Get CCSID ═══ */}
            {statusStep < 2 && (
              <>
                {/* Step 1a: Generate Keys & CSR */}
                {statusStep < 1 && (
                  <div className="space-y-4">
                    <h4 className="text-white font-black text-base flex items-center gap-2">
                      <span className="w-7 h-7 bg-purple-500 rounded-lg flex items-center justify-center text-xs text-white font-black">1</span>
                      إنشاء مفاتيح التشفير وشهادة CSR
                    </h4>
                    <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-white/40 font-bold text-xs">اسم المنشأة *</label>
                          <input value={orgName} onChange={(e) => setOrgName(e.target.value)}
                            placeholder="اسم المنشأة بالإنجليزي"
                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 font-bold text-sm focus:border-purple-500/50 outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-white/40 font-bold text-xs">رقم تسجيل المنشأة (VAT) *</label>
                          <input value={orgId} onChange={(e) => setOrgId(e.target.value)}
                            placeholder="300XXXXXXXXX00003"
                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 font-bold text-sm focus:border-purple-500/50 outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-white/40 font-bold text-xs">الاسم الشائع (CN)</label>
                          <input value={commonName} onChange={(e) => setCommonName(e.target.value)}
                            placeholder="اختياري - يتم توليده تلقائياً"
                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 font-bold text-sm focus:border-purple-500/50 outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-white/40 font-bold text-xs">المدينة / الموقع</label>
                          <input value={location} onChange={(e) => setLocation(e.target.value)}
                            placeholder="Riyadh"
                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 font-bold text-sm focus:border-purple-500/50 outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-white/40 font-bold text-xs">القطاع / الصناعة</label>
                          <input value={industry} onChange={(e) => setIndustry(e.target.value)}
                            placeholder="Logistics"
                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 font-bold text-sm focus:border-purple-500/50 outline-none"
                          />
                        </div>
                      </div>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleGenerateKeys} disabled={stepLoading === "keys"}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3.5 rounded-xl font-black text-sm disabled:opacity-50 shadow-lg shadow-purple-500/20"
                      >
                        {stepLoading === "keys" ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                        {stepLoading === "keys" ? "جاري إنشاء المفاتيح..." : "إنشاء المفاتيح و CSR"}
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Step 1b: Enter OTP and get CCSID */}
                {statusStep >= 1 && (
                  <div className="space-y-4">
                    {/* Show success message for keys */}
                    <div className="bg-emerald-500 rounded-xl p-3 flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-white flex-shrink-0" />
                      <span className="text-white font-bold text-sm">تم إنشاء مفاتيح التشفير وإنشاء شهادة موقته بنجاح</span>
                    </div>

                    {/* Certificate display */}
                    {credentials?.certificate && (
                      <X509CertificateCard certBase64={credentials.certificate} />
                    )}

                    <h4 className="text-white font-black text-base flex items-center gap-2 mt-4">
                      <span className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-xs text-white font-black">2</span>
                      التسجيل في بوابة ZATCA (رمز OTP)
                    </h4>
                    <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-6 space-y-4">
                      <p className="text-white/50 text-xs leading-relaxed">
                        أدخل رمز OTP الذي حصلت عليه من بوابة هيئة الزكاة والضريبة والجمارك.
                        بعد الإدخال سيتم الحصول على شهادة المطابقة (CCSID) المؤقتة.
                      </p>
                      <input value={otp} onChange={(e) => setOtp(e.target.value)}
                        placeholder="أدخل رمز OTP من بوابة هيئة الزكاة"
                        maxLength={6}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em] placeholder-white/20 font-bold focus:border-blue-500/50 outline-none"
                      />
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleOnboarding} disabled={stepLoading === "onboarding"}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-black text-sm disabled:opacity-50 shadow-lg shadow-blue-500/20"
                      >
                        {stepLoading === "onboarding" ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                        {stepLoading === "onboarding" ? "جاري التسجيل والتحقق..." : "التحقق والحصول على شهادة المطابقة"}
                      </motion.button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ═══ Step 2: Compliance Tests (6 tests) ═══ */}
            {statusStep >= 2 && statusStep < 4 && (
              <div className="space-y-4">
                {/* Certificate display */}
                {credentials?.certificate && (
                  <X509CertificateCard certBase64={credentials.certificate} />
                )}

                {/* Success for step 1 */}
                <div className="bg-emerald-500 rounded-xl p-3 flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-white flex-shrink-0" />
                  <span className="text-white font-bold text-sm">تم إنشاء مفاتيح التشفير وإنشاء شهادة موقته بنجاح</span>
                </div>

                <h4 className="text-white font-black text-base text-center mt-4">
                  إختبار النماذج في منصة فاتورة في {envLabel}
                </h4>
                <div className="h-px bg-white/10 mb-4" />

                {/* Compliance test list */}
                <div className="space-y-3">
                  {complianceResults.length > 0 ? (
                    complianceResults.map((test) => (
                      <ComplianceTestItem
                        key={test.id}
                        label={test.label_ar}
                        status={test.status}
                        isRunning={complianceRunning}
                      />
                    ))
                  ) : (
                    // Show default test list before running
                    [
                      "مشاركة الفاتورة المبسطة في منصة فاتورة",
                      "مشاركة الاشعار الالكتروني المدين في منصة فاتورة",
                      "مشاركة الاشعار الالكتروني الدائن في منصة فاتورة",
                      "إعتماد الفاتورة الضريبية في منصة فاتورة",
                      "إعتماد الاشعار الالكتروني المدين في منصة فاتورة",
                      "إعتماد الاشعار الالكتروني الدائن في منصة فاتورة",
                    ].map((label, i) => (
                      <ComplianceTestItem
                        key={i}
                        label={label}
                        status="pending"
                        isRunning={false}
                      />
                    ))
                  )}
                </div>

                {/* Run compliance tests button */}
                {!allCompliancePassed && (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleCompliance} disabled={complianceRunning}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-black text-sm disabled:opacity-50 shadow-lg shadow-emerald-500/20 mt-4"
                  >
                    {complianceRunning ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {complianceRunning ? "جاري تنفيذ الاختبارات..." : "تشغيل اختبارات المطابقة"}
                  </motion.button>
                )}

                {/* Production CSID request */}
                {allCompliancePassed && (
                  <div className="bg-cyan-50/10 rounded-2xl border border-cyan-500/20 p-6 mt-4">
                    <div className="flex items-center gap-4">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleProduction} disabled={stepLoading === "production"}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-sm disabled:opacity-50 shadow-lg flex items-center gap-2"
                      >
                        {stepLoading === "production" ? <Loader2 size={16} className="animate-spin" /> : <Info size={16} />}
                        طلب معرف الإنتاج
                      </motion.button>
                      <div className="flex-1 text-right">
                        <h5 className="text-white font-black text-sm">طلب معرف الإنتاج (CSID)</h5>
                        <p className="text-white/40 text-xs mt-1">
                          جاهز للانطلاق؟ سنقوم بتقديم طلبك الآن للحصول على معرف الإنتاج بكل سهولة وسرعة!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ Step 3: All Done - Production Ready ═══ */}
            {statusStep >= 4 && (
              <div className="space-y-4">
                {/* Certificate display */}
                {credentials?.certificate && (
                  <X509CertificateCard certBase64={credentials.certificate} />
                )}

                <div className="bg-emerald-500/10 rounded-2xl border border-emerald-500/20 p-8 text-center">
                  <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
                  <h4 className="text-emerald-300 font-black text-xl">جاهز للعمل!</h4>
                  <p className="text-emerald-400/60 text-sm mt-2">
                    تم التسجيل بنجاح وحصلت على شهادة الإنتاج (PCSID).<br/>
                    نظامك جاهز لإرسال الفواتير إلى هيئة الزكاة والضريبة والجمارك.
                  </p>
                  <p className="text-emerald-400/40 text-xs mt-3">
                    الشهادة صالحة لمدة 5 سنوات
                  </p>
                </div>
              </div>
            )}

            {/* Current status indicator */}
            {credentials && (
              <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs font-bold">الحالة الحالية</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-black ${
                    credentials.status === "production" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    credentials.status === "compliance" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                    "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {credentials.status === "production" ? "إنتاج - جاهز" :
                     credentials.status === "compliance" ? "مطابقة - في الاختبار" : "في الانتظار"}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-white/40 text-xs font-bold">البيئة</span>
                  <span className="text-white/60 text-xs font-bold">{credentials.environment}</span>
                </div>
                {credentials.ccsid && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white/40 text-xs font-bold">شهادة المطابقة (CCSID)</span>
                    <span className="text-emerald-400 text-xs font-bold">موجودة</span>
                  </div>
                )}
                {credentials.pcsid && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white/40 text-xs font-bold">شهادة الإنتاج (PCSID)</span>
                    <span className="text-emerald-400 text-xs font-bold">موجودة</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Recent Submissions ─── */}
      {submissions.length > 0 && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
          <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">
            <FileText size={18} className="text-blue-400" />
            آخر الإرسالات
          </h3>
          <div className="space-y-2">
            {submissions.map((sub: any) => (
              <div key={sub.id} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black border ${statusColors[sub.submission_status] || statusColors.pending}`}>
                    {sub.submission_status === "success" ? "ناجح" :
                     sub.submission_status === "failed" ? "فشل" :
                     sub.submission_status === "warning" ? "تحذير" : "معلق"}
                  </span>
                  <div>
                    <p className="text-white/70 text-xs font-bold">{sub.document_type === "invoice" ? "فاتورة" : sub.document_type === "debit_note" ? "إشعار مدين" : "إشعار دائن"} - {sub.document_id}</p>
                    <p className="text-white/30 text-[10px]">{sub.submission_type === "clearance" ? "اعتماد" : "إبلاغ"}</p>
                  </div>
                </div>
                <span className="text-white/30 text-[10px] font-mono">
                  {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString("ar-SA") : "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
