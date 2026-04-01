"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, Users, CheckCircle, AlertCircle, Clock, RefreshCw,
  Wallet, Bell, Check, X, AlertTriangle, BadgeDollarSign,
  BarChart3, UserCheck, UserX, Eye, Printer, Send,
  ImageIcon, MessageSquare, Download, ChevronLeft, Zap, ClipboardList,
  Settings2, Filter, Phone, BellRing, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────── Types ────────────────────────────────────────

interface Driver {
  id: number; name: string; iqama_number: string; nationality: string;
  user_code: string; vehicle_plate: string; personal_photo: string;
  is_active: boolean; package_id: number; package_name: string;
  monthly_target: number; bonus_after_target: number; work_type: string;
  per_order_value?: number; phone?: string;
  today_entry_count: number; today_orders: number; today_wallet: number;
  pending_requests: number; pending_settlements: number;
}
interface FieldSettings {
  selectedPackages: string[]; // [] = all packages
  fieldCount: number; // 0 = no limit
  showInactiveFirst: boolean;
}
interface Stats { totalDrivers: number; activeDrivers: number; submittedToday: number; pendingRequests: number; pendingSettlements: number; }
interface DailyEntry { id: number; date: string; completed_orders: number; wallet_amount: number; payment_status: string; cancelled_orders: number; notes: string; screenshot_path: string; created_at: string; }
interface DailyIssue { id: number; date: string; issue_type: string; notes: string; attachment: string; created_at: string; status?: string; admin_notes?: string; }
interface DriverRequest { id: number; request_type: string; from_date: string; to_date: string; reason: string; status: string; attachment: string; created_at: string; admin_notes?: string; }
interface Settlement { id: number; settlement_date: string; total_amount: number; paid_amount: number; remaining_amount: number; receipt_path: string; notes: string; settlement_status: string; created_at: string; }
interface MonthlySummary { date: string; total_orders: number; total_cancelled: number; total_wallet: number; entry_count: number; }
interface DriverData { entries: DailyEntry[]; issues: DailyIssue[]; requests: DriverRequest[]; settlements: Settlement[]; monthlySummary: MonthlySummary[]; wallet_balance?: number; }
interface AppNotif { id: string; type: "submission"|"missing"|"message"|"system"; driverName: string; message: string; timestamp: string; read: boolean; }
type DetailTab = "today"|"monthly"|"issues"|"requests"|"settlements";

// ─────────────────────────────── Helpers ──────────────────────────────────────

const fmt = (n: number|string) => Number(n || 0).toLocaleString("en-US");
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" }) : "";
const todayStr = () => new Date().toISOString().slice(0, 10);
const curMonth = () => new Date().toISOString().slice(0, 7);

function getMissingDays(monthlySummary: MonthlySummary[], month: string): string[] {
  const [yr, mo] = month.split("-").map(Number);
  const daysInMonth = new Date(yr, mo, 0).getDate();
  const todayD = todayStr();
  const submitted = new Set((monthlySummary || []).map(e => e.date.slice(0, 10)));
  const missing: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${month}-${String(d).padStart(2, "0")}`;
    if (ds <= todayD && !submitted.has(ds)) missing.push(ds);
  }
  return missing;
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label:"قيد التأكيد", cls:"bg-orange-500/15 text-orange-400 border-orange-500/30" },
    approved: { label:"موافق", cls:"bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    rejected: { label:"مرفوض", cls:"bg-red-500/15 text-red-400 border-red-500/30" },
    paid: { label:"مؤكد - مدفوع", cls:"bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    partial: { label:"مسدد جزئياً", cls:"bg-purple-500/15 text-purple-400 border-purple-500/30" },
  };
  const s = map[status] ?? { label: status, cls:"bg-slate-500/15 text-slate-400 border-slate-500/30" };
  return <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black border", s.cls)}>{s.label}</span>;
}

// ─────────────────────────────── InlineImage ──────────────────────────────────

function InlineImage({ src, alt = "صورة" }: { src: string; alt?: string }) {
  const [open, setOpen] = useState(false);
  if (!src) return null;
  return (
    <>
      <div className="relative group cursor-pointer rounded-xl overflow-hidden border border-white/10 w-28 h-20 flex-shrink-0" onClick={() => setOpen(true)}>
        <img src={src} alt={alt} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
          <Eye size={14} className="text-white" />
          <span className="text-white text-[10px] font-bold">عرض</span>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div initial={{ scale:0.9 }} animate={{ scale:1 }} exit={{ scale:0.9 }}
              onClick={e => e.stopPropagation()} className="relative max-w-3xl"
            >
              <img src={src} alt={alt} className="rounded-2xl max-w-full max-h-[85vh] object-contain" />
              <div className="absolute top-3 right-3 flex gap-2">
                <a href={src} download onClick={e => e.stopPropagation()}
                  className="p-2 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition">
                  <Download size={16} className="text-white" />
                </a>
                <button onClick={() => setOpen(false)} className="p-2 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition">
                  <X size={16} className="text-white" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────── DriverCard ───────────────────────────────────

function DriverCard({ driver, onSelect, onToggle, onAlert }: {
  driver: Driver;
  onSelect: (d: Driver) => void;
  onToggle: (d: Driver, v: boolean) => void;
  onAlert: (d: Driver) => void;
}) {
  const isActive = Number(driver.is_active) === 1;
  const submitted = Number(driver.today_entry_count) > 0;
  const pending = Number(driver.pending_requests) + Number(driver.pending_settlements);
  const needsAlert = isActive && !submitted;
  const [imgError, setImgError] = useState(false);

  const photoUrl = driver.personal_photo
    ? (driver.personal_photo.startsWith("http") ? driver.personal_photo : `${process.env.NEXT_PUBLIC_APP_URL || ""}/${driver.personal_photo}`)
    : null;

  return (
    <motion.div layout initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
      className={cn("group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300",
        "hover:shadow-xl hover:shadow-cyan-500/10",
        needsAlert ? "bg-[#0d1a2e] border-amber-500/30 hover:border-amber-400/50 shadow-amber-500/5 shadow-lg"
          : isActive ? "bg-[#0d1a2e] border-white/[0.09] hover:border-cyan-500/30"
          : "bg-[#080e1a] border-white/[0.04] opacity-55 hover:opacity-75"
      )}
      onClick={() => onSelect(driver)}
    >
      <div className={cn("h-0.5", needsAlert ? "bg-gradient-to-r from-amber-400 to-orange-500" : isActive ? "bg-gradient-to-r from-cyan-500 to-blue-500" : "bg-slate-800")} />

      {/* Alert badge */}
      {needsAlert && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-full">
          <AlertTriangle size={9} className="text-amber-400 animate-pulse" />
          <span className="text-[9px] text-amber-400 font-black">لم يرسل</span>
        </div>
      )}

      <div className="p-4">
        {/* Top: Photo + Name */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative flex-shrink-0">
            {photoUrl && !imgError
              ? <img src={photoUrl} className="w-14 h-14 rounded-xl object-cover border border-white/10" alt={driver.name} onError={() => setImgError(true)} />
              : <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl text-white", isActive ? "bg-gradient-to-br from-cyan-500 to-blue-600" : "bg-slate-700")}>{driver.name.charAt(0).toUpperCase()}</div>
            }
            <div className={cn("absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0d1a2e]", submitted ? "bg-emerald-400" : isActive ? "bg-amber-400 animate-pulse" : "bg-slate-600")} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("font-black text-sm truncate leading-tight", needsAlert ? "text-amber-100" : "text-white")}>{driver.name}</p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{driver.package_name || "—"}</p>
            {driver.user_code && <p className="text-[10px] text-slate-700 mt-0.5">#{driver.user_code}</p>}
            {(driver.nationality || driver.vehicle_plate) && (
              <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                {driver.nationality}{driver.nationality && driver.vehicle_plate && " • "}{driver.vehicle_plate}
              </p>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {[
            { label:"طلبات اليوم", v: String(Number(driver.today_orders)), color:"text-cyan-400" },
            { label:"الحالة", v: submitted ? "✓ أرسل" : "لم يرسل", color: submitted ? "text-emerald-400" : "text-amber-400" },
            { label:"معلقة", v: String(pending), color: pending > 0 ? "text-orange-400" : "text-slate-600" },
          ].map(k => (
            <div key={k.label} className="bg-white/[0.03] rounded-lg p-2 text-center">
              <p className={cn("text-sm font-black leading-tight", k.color)}>{k.v}</p>
              <p className="text-[9px] text-slate-700 mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Bottom action buttons */}
        <div className="grid grid-cols-3 gap-1.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={e => { e.stopPropagation(); onToggle(driver, !isActive); }}
            className={cn("flex flex-col items-center gap-1.5 px-1 py-2.5 rounded-xl text-[10px] font-black transition-all border",
              isActive
                ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/25 text-red-400"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/25 text-emerald-400"
            )}
          >
            <div className={cn("w-8 h-4 rounded-full relative transition-colors flex-shrink-0", isActive ? "bg-emerald-500" : "bg-slate-600")}>
              <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-300", isActive ? "right-0.5" : "left-0.5")} />
            </div>
            <span className="leading-tight text-center">{isActive ? "إيقاف السائق" : "تنشيط السائق"}</span>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onAlert(driver); }}
            className="flex flex-col items-center gap-1.5 px-1 py-2.5 rounded-xl text-[10px] font-black transition-all border bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/25 text-amber-400"
          >
            <BellRing size={15} className="flex-shrink-0" />
            <span className="leading-tight text-center">اشعار تنبيهي</span>
          </button>
          {driver.phone ? (
            <a
              href={`https://wa.me/${driver.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex flex-col items-center gap-1.5 px-1 py-2.5 rounded-xl text-[10px] font-black transition-all border bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/25 text-emerald-400"
            >
              <Phone size={15} className="flex-shrink-0" />
              <span className="leading-tight text-center">التنبيه واتس اب</span>
            </a>
          ) : (
            <div className="flex flex-col items-center gap-1.5 px-1 py-2.5 rounded-xl text-[10px] font-black border bg-white/[0.02] border-white/[0.05] text-slate-700 cursor-not-allowed">
              <Phone size={15} className="flex-shrink-0" />
              <span className="leading-tight text-center">لا يوجد رقم</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────── FieldSettingsModal ───────────────────────────

// Package type for the modal
interface PkgWithEmployees {
  id: number;
  name: string;
  employees: { id: number; name: string; vehicle_plate: string; is_active: number }[];
}

function FieldSettingsModal({ onSave, onClose, onActivateDrivers }: {
  onSave: (s: FieldSettings) => void;
  onClose: () => void;
  onActivateDrivers: (activeIds: number[], packageName: string, allPkgIds: number[]) => Promise<void>;
}) {
  const [packages, setPackages] = useState<PkgWithEmployees[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<PkgWithEmployees | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  // Fetch packages with their employees on mount — one clean request
  useEffect(() => {
    setLoading(true);
    fetch("/api/hr/driver-tracking?action=packages_with_employees")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data.packages)) setPackages(data.packages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePkgSelect = (pkg: PkgWithEmployees) => {
    setSelectedPkg(pkg);
    // Pre-check all currently active employees in this package
    setCheckedIds(new Set(pkg.employees.filter(e => Number(e.is_active) === 1).map(e => e.id)));
  };

  const toggleEmployee = (id: number) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!selectedPkg) return;
    if (checkedIds.size === selectedPkg.employees.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(selectedPkg.employees.map(e => e.id)));
    }
  };

  const handleSave = async () => {
    if (!selectedPkg) return;
    setSaving(true);
    try {
      onSave({ selectedPackages: [], fieldCount: 0, showInactiveFirst: false });
      const allPkgIds = selectedPkg.employees.map(e => e.id);
      await onActivateDrivers(Array.from(checkedIds), selectedPkg.name, allPkgIds);
    } finally {
      setSaving(false);
      onClose();
    }
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0a1628] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl"><Settings2 size={18} className="text-white" /></div>
            <div>
              <h3 className="font-black text-white text-lg">إعداد الميدان</h3>
              <p className="text-slate-500 text-xs">اختر الباقة ثم حدد الموظفين النشطين</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition"><X size={18} className="text-slate-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Step 1: Package selection */}
          <div className="mb-5">
            <p className="text-[11px] text-slate-500 font-black mb-2.5 flex items-center gap-1.5">
              <Package size={12} className="text-indigo-400" />
              الخطوة 1: اختر الباقة
            </p>
            {loading ? (
              <div className="flex items-center justify-center py-6 gap-2">
                <div className="w-4 h-4 border-2 border-indigo-500/50 border-t-indigo-400 rounded-full animate-spin" />
                <p className="text-slate-500 text-xs">جاري التحميل...</p>
              </div>
            ) : packages.length === 0 ? (
              <p className="text-slate-600 text-xs text-center py-4">لا توجد باقات مسجلة</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {packages.map(pkg => {
                  const activeCount = pkg.employees.filter(e => Number(e.is_active) === 1).length;
                  return (
                    <button key={pkg.id} onClick={() => handlePkgSelect(pkg)}
                      className={cn(
                        "flex flex-col items-start px-3.5 py-3 rounded-xl border text-right transition",
                        selectedPkg?.id === pkg.id
                          ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200"
                          : "bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]"
                      )}
                    >
                      <span className="text-xs font-black leading-tight truncate w-full">{pkg.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500">{pkg.employees.length} موظف</span>
                        {activeCount > 0 && <span className="text-[10px] text-emerald-500">{activeCount} نشط</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Employee selection */}
          {selectedPkg && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] text-slate-500 font-black flex items-center gap-1.5">
                  <Users size={12} className="text-cyan-400" />
                  الخطوة 2: حدد الموظفين ({selectedPkg.employees.length})
                </p>
                <button onClick={toggleAll}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-black transition px-2 py-0.5 rounded-lg bg-indigo-500/10">
                  {checkedIds.size === selectedPkg.employees.length ? "إلغاء الكل" : "تحديد الكل"}
                </button>
              </div>
              <div className="space-y-1 bg-white/[0.02] rounded-xl p-2 border border-white/[0.06] max-h-52 overflow-y-auto">
                {selectedPkg.employees.length === 0 && (
                  <p className="text-slate-600 text-xs text-center py-4">لا يوجد موظفون في هذه الباقة</p>
                )}
                {selectedPkg.employees.map(e => (
                  <label key={e.id}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition">
                    <input type="checkbox" checked={checkedIds.has(e.id)} onChange={() => toggleEmployee(e.id)}
                      className="accent-cyan-500 w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-white truncate">{e.name}</p>
                      {e.vehicle_plate && <p className="text-[10px] text-slate-600">{e.vehicle_plate}</p>}
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold border px-1.5 py-0.5 rounded-full flex-shrink-0",
                      Number(e.is_active) === 1
                        ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                        : "text-slate-600 border-slate-700 bg-white/[0.02]"
                    )}>
                      {Number(e.is_active) === 1 ? "نشط" : "موقوف"}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between px-1">
                <p className="text-[10px] text-slate-600">
                  {checkedIds.size} محدد من أصل {selectedPkg.employees.length}
                </p>
                <p className="text-[10px] text-cyan-600">سيتم تفعيل المحددين وإيقاف الباقين</p>
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="flex-shrink-0 mt-4">
          <button onClick={handleSave} disabled={saving || !selectedPkg}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? "جاري الحفظ..." : "حفظ وتفعيل الموظفين المحددين"}
          </button>
          {!selectedPkg && (
            <p className="text-[10px] text-slate-600 text-center mt-2">يرجى اختيار باقة أولاً</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────── NotificationCenter ───────────────────────────

function NotifCenter({ notifs, onMarkRead, onClear, onClose, pos }: { notifs: AppNotif[]; onMarkRead: (id: string) => void; onClear: () => void; onClose: () => void; pos?: { top: number; right: number } }) {
  const typeIcon: Record<string, React.ReactNode> = {
    submission: <CheckCircle size={13} className="text-emerald-400" />,
    missing: <AlertTriangle size={13} className="text-amber-400" />,
    message: <MessageSquare size={13} className="text-cyan-400" />,
    system: <Bell size={13} className="text-purple-400" />,
  };
  return (
    <motion.div initial={{ opacity:0, y:-8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-8, scale:0.97 }}
      className="fixed w-80 bg-[#0a1628] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 z-[9999] overflow-hidden"
      style={pos ? { top: pos.top, right: pos.right } : { top: 80, right: 24 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <h3 className="font-black text-white text-sm flex items-center gap-2"><Bell size={14} className="text-cyan-400" /> الإشعارات</h3>
        <div className="flex items-center gap-3">
          <button onClick={onClear} className="text-[10px] text-slate-600 hover:text-red-400 transition">مسح الكل</button>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition"><X size={13} className="text-slate-500" /></button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifs.length === 0
          ? <p className="text-slate-600 text-xs text-center py-8">لا توجد إشعارات</p>
          : notifs.map(n => (
            <div key={n.id} onClick={() => onMarkRead(n.id)}
              className={cn("px-4 py-3 border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.03] transition", !n.read && "bg-cyan-500/[0.03]")}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex-shrink-0">{typeIcon[n.type] || typeIcon.system}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{n.driverName}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-slate-700 mt-1">{n.timestamp}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />}
              </div>
            </div>
          ))
        }
      </div>
    </motion.div>
  );
}

// ─────────────────────────────── SendMessageModal ─────────────────────────────

function SendMessageModal({ drivers, onClose, onSend }: { drivers: Driver[]; onClose: () => void; onSend: (ids: number[], title: string, message: string, img: string) => Promise<void>; }) {
  const [title, setTitle] = useState("تنبيه من الإدارة");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mode, setMode] = useState<"all"|"selected">("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sending, setSending] = useState(false);
  const active = drivers.filter(d => Number(d.is_active) === 1);
  // Show all drivers in "selected" mode so manager can pick any driver
  const allForSelection = drivers;
  const TEMPLATES = [
    "🔔 يرجى إدخال بيانات طلباتكم لليوم",
    "⚠️ تذكير: لم يتم إدخال بيانات اليوم. يرجى الإدخال فوراً",
    "✅ شكراً لإدخال بياناتكم في الوقت المحدد",
    "📋 اجتماع غداً الساعة 9 صباحاً. حضور إلزامي",
    "💰 تم معالجة التسويات. يرجى مراجعة محفظتكم",
  ];
  const handleSend = async () => {
    if (!message.trim()) return;
    const ids = mode === "all" ? active.map(d => d.id) : Array.from(selectedIds);
    if (!ids.length) return;
    setSending(true);
    await onSend(ids, title, message, imageUrl);
    setSending(false);
    onClose();
  };
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0a1628] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl"><MessageSquare size={18} className="text-white" /></div>
            <div><h3 className="font-black text-white text-lg">إرسال رسالة</h3><p className="text-slate-500 text-xs">للسائقين النشطين فقط</p></div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition"><X size={18} className="text-slate-400" /></button>
        </div>

        <div className="flex gap-2 mb-4">
          {["all", "selected"].map(m => (
            <button key={m} onClick={() => setMode(m as "all"|"selected")}
              className={cn("flex-1 py-2 rounded-xl text-xs font-black transition", mode === m ? "bg-cyan-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10")}
            >{m === "all" ? `الكل (${active.length})` : "اختيار سائقين"}</button>
          ))}
        </div>

        {mode === "selected" && (
          <div className="mb-4 max-h-36 overflow-y-auto space-y-1 bg-white/[0.03] rounded-xl p-2 border border-white/[0.06]">
            {allForSelection.length === 0 && <p className="text-slate-600 text-xs text-center py-3">لا يوجد سائقون</p>}
            {allForSelection.map(d => (
              <label key={d.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
                <input type="checkbox" checked={selectedIds.has(d.id)} className="accent-cyan-500"
                  onChange={e => { const s = new Set(selectedIds); e.target.checked ? s.add(d.id) : s.delete(d.id); setSelectedIds(s); }} />
                <span className="text-xs text-white font-bold truncate">{d.name}</span>
                {Number(d.is_active) !== 1 && <span className="text-[9px] text-slate-600 font-bold">(غير نشط)</span>}
              </label>
            ))}
          </div>
        )}

        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان الرسالة"
          className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white text-sm mb-3 focus:outline-none focus:border-cyan-500/50 placeholder-slate-600" />
        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="نص الرسالة..." rows={4}
          className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white text-sm mb-3 focus:outline-none focus:border-cyan-500/50 placeholder-slate-600 resize-none" />

        <div className="mb-3">
          <p className="text-[11px] text-slate-600 mb-1.5 font-bold">نصوص جاهزة:</p>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map((t, i) => (
              <button key={i} onClick={() => setMessage(t)}
                className="text-[10px] px-2 py-1 bg-white/[0.05] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 rounded-lg border border-white/[0.06] transition max-w-[180px] truncate">{t}</button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <ImageIcon size={16} className="text-slate-500 flex-shrink-0" />
          <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="رابط صورة (اختياري)"
            className="flex-1 px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500/50 placeholder-slate-600" />
        </div>

        <button onClick={handleSend} disabled={sending || !message.trim() || (mode === "selected" && selectedIds.size === 0)}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black rounded-xl hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {sending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
          {sending ? "جاري الإرسال..." : `إرسال (${mode === "all" ? active.length : selectedIds.size} سائق)`}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────── DriverDetailPanel ────────────────────────────

function DriverDetailPanel({ driver, onClose, onToggle }: { driver: Driver; onClose: () => void; onToggle: (v: boolean) => void; }) {
  const [tab, setTab] = useState<DetailTab>("today");
  const [data, setData] = useState<DriverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(curMonth());
  const [updatingReq, setUpdatingReq] = useState<number | null>(null);
  const [updatingSettl, setUpdatingSettl] = useState<number | null>(null);
  const [updatingIssue, setUpdatingIssue] = useState<number | null>(null);
  const [reqNotes, setReqNotes] = useState<Record<number, string>>({});
  const [settlNotes, setSettlNotes] = useState<Record<number, string>>({});
  const [settlPaid, setSettlPaid] = useState<Record<number, string>>({});
  const [issueNotes, setIssueNotes] = useState<Record<number, string>>({});
  const [headerImgError, setHeaderImgError] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const isActive = Number(driver.is_active) === 1;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hr/driver-tracking?action=driver_data&driver_id=${driver.id}&month=${month}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [driver.id, month]);

  useEffect(() => { loadData(); }, [loadData]);

  const entries: DailyEntry[] = data?.entries ?? [];
  const issues: DailyIssue[] = data?.issues ?? [];
  const requests: DriverRequest[] = data?.requests ?? [];
  const settlements: Settlement[] = data?.settlements ?? [];
  const monthlySummary: MonthlySummary[] = data?.monthlySummary ?? [];

  const missingDays = getMissingDays(monthlySummary, month);
  const todayEntries = entries.filter(e => e.date.slice(0, 10) === todayStr());
  const monthlyTotals = monthlySummary.reduce((a, e) => ({ o: a.o + Number(e.total_orders), w: a.w + Number(e.total_wallet), c: a.c + Number(e.total_cancelled) }), { o: 0, w: 0, c: 0 });

  const handleUpdateReq = async (id: number, status: "approved"|"rejected", adminNotes?: string) => {
    setUpdatingReq(id);
    await fetch("/api/hr/driver-tracking", { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action:"update_request", request_id:id, status, admin_notes: adminNotes || "" }) });
    await loadData();
    setReqNotes(prev => { const n = {...prev}; delete n[id]; return n; });
    setUpdatingReq(null);
  };

  const handleUpdateSettl = async (id: number, status: string, paid: number, notes?: string) => {
    setUpdatingSettl(id);
    await fetch("/api/hr/driver-tracking", { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action:"update_settlement", settlement_id:id, settlement_status:status, paid_amount:paid, notes: notes || "" }) });
    await loadData();
    setSettlNotes(prev => { const n = {...prev}; delete n[id]; return n; });
    setSettlPaid(prev => { const n = {...prev}; delete n[id]; return n; });
    setUpdatingSettl(null);
  };

  const handleUpdateIssue = async (id: number, status: "resolved"|"rejected", adminNotes?: string) => {
    setUpdatingIssue(id);
    await fetch("/api/hr/driver-tracking", { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action:"update_issue", issue_id:id, status, admin_notes: adminNotes || "" }) });
    await loadData();
    setIssueNotes(prev => { const n = {...prev}; delete n[id]; return n; });
    setUpdatingIssue(null);
  };

  const sendMissingNotif = async (day: string) => {
    await fetch("/api/hr/driver-tracking", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"send_message", driver_ids:[driver.id], title:"تذكير: إدخال البيانات", message:`⚠️ لم تقم بإدخال بيانات طلباتك ليوم ${fmtDate(day)}. يرجى الإدخال فوراً.` }) });
    alert(`تم إرسال التنبيه لـ ${driver.name}`);
  };

  const handlePrint = () => {
    const c = printRef.current?.innerHTML ?? "";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html dir="rtl"><head><meta charset="utf-8"><title>تقرير ${driver.name}</title><style>body{font-family:sans-serif;padding:20px;direction:rtl}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f0f4f8}h1,h2{color:#1e3a5f}</style></head><body>${c}</body></html>`);
    win.document.close(); win.print();
  };

  const TABS: { key: DetailTab; label: string; icon: React.ReactNode }[] = [
    { key:"today", label:"اليوم", icon:<Zap size={12} /> },
    { key:"monthly", label:"الشهري", icon:<BarChart3 size={12} /> },
    { key:"issues", label:"المشاكل", icon:<AlertCircle size={12} /> },
    { key:"requests", label:"الطلبات", icon:<ClipboardList size={12} /> },
    { key:"settlements", label:"التسويات", icon:<Wallet size={12} /> },
  ];

  return (
    <motion.div initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }}
      transition={{ type:"spring", damping:28, stiffness:300 }}
      className="fixed top-0 left-0 h-full w-full max-w-2xl bg-[#07111e] border-r border-white/[0.06] shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/[0.06] flex-shrink-0">
        <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition flex-shrink-0">
          <ChevronLeft size={18} className="text-slate-400" />
        </button>
        {driver.personal_photo && !headerImgError
          ? <img src={driver.personal_photo} className="w-11 h-11 rounded-xl object-cover border border-white/10 flex-shrink-0" alt="" onError={() => setHeaderImgError(true)} />
          : <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-lg flex-shrink-0">{driver.name.charAt(0).toUpperCase()}</div>
        }
        <div className="flex-1 min-w-0">
          <h2 className="font-black text-white truncate">{driver.name}</h2>
          <p className="text-[11px] text-slate-500 truncate">{driver.package_name} {driver.nationality ? `• ${driver.nationality}` : ""}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handlePrint} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition" title="طباعة">
            <Printer size={15} className="text-slate-400" />
          </button>
          <button onClick={() => onToggle(!isActive)} className={cn("relative w-11 h-6 rounded-full transition-all duration-300", isActive ? "bg-emerald-500" : "bg-slate-700")}>
            <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300", isActive ? "right-1" : "left-1")} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-2 p-4 flex-shrink-0">
        {[
          { label:"اليوم", v: fmt(Number(driver.today_orders)), c:"text-cyan-400" },
          { label:"محفظة اليوم", v: `${fmt(Number(driver.today_wallet))}ر`, c:"text-emerald-400" },
          { label:"الهدف", v: fmt(Number(driver.monthly_target)), c:"text-amber-400" },
          { label:"الشهر", v: fmt(monthlyTotals.o), c:"text-purple-400" },
          { label:"الرصيد المتبقي", v: `${fmt(data?.wallet_balance ?? 0)}ر`, c: (data?.wallet_balance ?? 0) > 0 ? "text-orange-400" : "text-slate-600" },
        ].map(k => (
          <div key={k.label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5 text-center">
            <p className={cn("text-base font-black", k.c)}>{k.v}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Missing days alert */}
      {missingDays.length > 0 && (
        <div className="mx-4 mb-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex-shrink-0">
          <p className="text-amber-400 text-xs font-black mb-2 flex items-center gap-1.5"><AlertTriangle size={13} /> {missingDays.length} يوم بدون إدخال</p>
          <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
            {missingDays.map(d => (
              <div key={d} className="flex items-center gap-1">
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-lg font-bold">{fmtDate(d)}</span>
                <button onClick={() => sendMissingNotif(d)} className="p-0.5 bg-amber-500/20 hover:bg-amber-500/40 rounded-lg transition" title="إرسال تنبيه"><Bell size={10} className="text-amber-400" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month + tabs */}
      <div className="px-4 pb-2 flex-shrink-0 space-y-2">
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-xl text-white text-xs focus:outline-none" />
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition", tab === t.key ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "bg-white/[0.04] text-slate-500 hover:bg-white/[0.08] border border-white/[0.05]")}
            >{t.icon}{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4" ref={printRef}>
        <div className="hidden print:block mb-4">
          <h1>تقرير: {driver.name}</h1><p>الباقة: {driver.package_name} | الجنسية: {driver.nationality} | الشهر: {month}</p>
        </div>

        {loading && <div className="flex items-center justify-center py-16"><RefreshCw size={24} className="animate-spin text-cyan-500" /></div>}

        {/* TODAY */}
        {!loading && tab === "today" && (
          <div className="space-y-3 pt-1">
            {todayEntries.length === 0
              ? <div className="text-center py-12"><Clock size={32} className="mx-auto text-slate-700 mb-3" /><p className="text-slate-500 font-bold">لم يتم الإدخال اليوم</p></div>
              : todayEntries.map(e => (
                <div key={e.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                  <div className="flex gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div><p className="text-[10px] text-slate-600">الطلبات المنجزة</p><p className="text-xl font-black text-emerald-400">{fmt(e.completed_orders)}</p></div>
                      <div><p className="text-[10px] text-slate-600">المحفظة</p><p className="text-xl font-black text-cyan-400">{fmt(e.wallet_amount)} ر</p></div>
                      <div><p className="text-[10px] text-slate-600">الملغي</p><p className="text-lg font-black text-red-400">{fmt(e.cancelled_orders)}</p></div>
                      <div><p className="text-[10px] text-slate-600">الحالة</p><div className="mt-0.5">{statusBadge(e.payment_status)}</div></div>
                    </div>
                    {e.screenshot_path && <InlineImage src={e.screenshot_path} alt="لقطة" />}
                  </div>
                  {e.notes && <p className="mt-2 text-xs text-slate-500 bg-white/[0.03] rounded-xl p-2">{e.notes}</p>}
                  <p className="text-[10px] text-slate-700 mt-2">{fmtDate(e.created_at)}</p>
                </div>
              ))
            }
          </div>
        )}

        {/* MONTHLY */}
        {!loading && tab === "monthly" && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label:"إجمالي الطلبات", v: fmt(monthlyTotals.o), c:"emerald" },
                { label:"إجمالي المحفظة", v: `${fmt(monthlyTotals.w)} ر`, c:"cyan" },
                { label:"إجمالي الملغي", v: fmt(monthlyTotals.c), c:"red" },
              ].map(k => (
                <div key={k.label} className={`bg-${k.c}-500/10 border border-${k.c}-500/20 rounded-2xl p-3 text-center`}>
                  <p className={`text-xl font-black text-${k.c}-400`}>{k.v}</p>
                  <p className={`text-[11px] text-${k.c}-600 mt-1`}>{k.label}</p>
                </div>
              ))}
            </div>
            {monthlySummary.length === 0
              ? <p className="text-center text-slate-600 py-8 text-sm">لا توجد بيانات</p>
              : <table className="w-full text-xs">
                  <thead><tr className="text-slate-500 border-b border-white/[0.06]">
                    <th className="text-right py-2 px-2 font-black">التاريخ</th>
                    <th className="text-center py-2 px-2 font-black">الطلبات</th>
                    <th className="text-center py-2 px-2 font-black">الملغي</th>
                    <th className="text-center py-2 px-2 font-black">المحفظة</th>
                    <th className="text-center py-2 px-2 font-black">إدخالات</th>
                  </tr></thead>
                  <tbody>
                    {monthlySummary.map(s => (
                      <tr key={s.date} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="py-2 px-2 text-white font-bold">{fmtDate(s.date)}</td>
                        <td className="py-2 px-2 text-center text-emerald-400 font-black">{fmt(s.total_orders)}</td>
                        <td className="py-2 px-2 text-center text-red-400">{fmt(s.total_cancelled)}</td>
                        <td className="py-2 px-2 text-center text-cyan-400 font-bold">{fmt(s.total_wallet)} ر</td>
                        <td className="py-2 px-2 text-center text-slate-500">{s.entry_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        )}

        {/* ISSUES */}
        {!loading && tab === "issues" && (
          <div className="space-y-3 pt-1">
            {issues.length === 0
              ? <p className="text-center text-slate-600 py-8 text-sm">لا توجد مشاكل</p>
              : issues.map(issue => (
                <div key={issue.id} className="bg-white/[0.03] border border-red-500/10 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 bg-red-500/15 text-red-400 rounded-full text-[10px] font-black border border-red-500/20">{issue.issue_type}</span>
                        <span className="text-[11px] text-slate-600">{fmtDate(issue.date)}</span>
                        {issue.status && statusBadge(issue.status)}
                      </div>
                      {issue.notes && <p className="text-xs text-slate-400">{issue.notes}</p>}
                      {issue.admin_notes && (
                        <p className="text-xs text-cyan-400 mt-1.5 bg-cyan-500/10 rounded-lg px-2 py-1.5">💬 رد الإدارة: {issue.admin_notes}</p>
                      )}
                    </div>
                    {issue.attachment && <InlineImage src={issue.attachment} alt="مرفق" />}
                  </div>
                  {(!issue.status || issue.status === "pending") && (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={issueNotes[issue.id] || ""}
                        onChange={e => setIssueNotes(prev => ({...prev, [issue.id]: e.target.value}))}
                        placeholder="رد على المشكلة أو ملاحظة للسائق..."
                        rows={2}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-red-500/50 placeholder-slate-600 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateIssue(issue.id, "resolved", issueNotes[issue.id])} disabled={updatingIssue === issue.id}
                          className="flex-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl text-xs font-black border border-emerald-500/20 transition flex items-center justify-center gap-1">
                          {updatingIssue === issue.id ? <RefreshCw size={11} className="animate-spin" /> : <Check size={11} />} تم الحل
                        </button>
                        <button onClick={() => handleUpdateIssue(issue.id, "rejected", issueNotes[issue.id])} disabled={updatingIssue === issue.id}
                          className="flex-1 py-1.5 bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 rounded-xl text-xs font-black border border-slate-500/20 transition flex items-center justify-center gap-1">
                          <X size={11} /> إغلاق
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        )}

        {/* REQUESTS */}
        {!loading && tab === "requests" && (
          <div className="space-y-3 pt-1">
            {requests.length === 0
              ? <p className="text-center text-slate-600 py-8 text-sm">لا توجد طلبات</p>
              : requests.map(req => (
                <div key={req.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="px-2 py-0.5 bg-blue-500/15 text-blue-400 rounded-full text-[10px] font-black border border-blue-500/20">{req.request_type}</span>
                        {statusBadge(req.status)}
                      </div>
                      <p className="text-[11px] text-slate-500">{fmtDate(req.from_date)}{req.to_date ? ` → ${fmtDate(req.to_date)}` : ""}</p>
                      {req.reason && <p className="text-xs text-slate-400 mt-1">{req.reason}</p>}
                      {req.admin_notes && (
                        <p className="text-xs text-cyan-400 mt-1.5 bg-cyan-500/10 rounded-lg px-2 py-1.5">💬 رد الإدارة: {req.admin_notes}</p>
                      )}
                    </div>
                    {req.attachment && <InlineImage src={req.attachment} alt="مرفق" />}
                  </div>
                  {req.status === "pending" && (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={reqNotes[req.id] || ""}
                        onChange={e => setReqNotes(prev => ({...prev, [req.id]: e.target.value}))}
                        placeholder="رد أو ملاحظة للسائق (اختياري)..."
                        rows={2}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500/50 placeholder-slate-600 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateReq(req.id, "approved", reqNotes[req.id])} disabled={updatingReq === req.id}
                          className="flex-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl text-xs font-black border border-emerald-500/20 transition flex items-center justify-center gap-1">
                          {updatingReq === req.id ? <RefreshCw size={11} className="animate-spin" /> : <Check size={11} />} موافقة
                        </button>
                        <button onClick={() => handleUpdateReq(req.id, "rejected", reqNotes[req.id])} disabled={updatingReq === req.id}
                          className="flex-1 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-black border border-red-500/20 transition flex items-center justify-center gap-1">
                          <X size={11} /> رفض
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        )}

        {/* SETTLEMENTS */}
        {!loading && tab === "settlements" && (
          <div className="space-y-3 pt-1">
            {settlements.length === 0
              ? <p className="text-center text-slate-600 py-8 text-sm">لا توجد تسويات</p>
              : settlements.map(s => (
                <div key={s.id} className="bg-white/[0.03] border border-violet-500/10 rounded-2xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">{statusBadge(s.settlement_status)}<span className="text-[11px] text-slate-500">{fmtDate(s.settlement_date)}</span></div>
                      <div className="grid grid-cols-3 gap-2">
                        <div><p className="text-[10px] text-slate-600">الإجمالي</p><p className="text-sm font-black text-white">{fmt(s.total_amount)} ر</p></div>
                        <div><p className="text-[10px] text-slate-600">المدفوع</p><p className="text-sm font-black text-emerald-400">{fmt(s.paid_amount)} ر</p></div>
                        <div><p className="text-[10px] text-slate-600">المتبقي</p><p className="text-sm font-black text-amber-400">{fmt(s.remaining_amount)} ر</p></div>
                      </div>
                      {s.notes && <p className="text-[11px] text-cyan-400 mt-1 bg-cyan-500/10 rounded-lg px-2 py-1">💬 {s.notes}</p>}
                    </div>
                    {s.receipt_path && <InlineImage src={s.receipt_path} alt="إيصال" />}
                  </div>
                  {s.settlement_status === "pending" && (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-2 items-center">
                        <label className="text-[10px] text-slate-500 whitespace-nowrap">المبلغ المدفوع:</label>
                        <input
                          type="number"
                          value={settlPaid[s.id] ?? ""}
                          onChange={e => setSettlPaid(prev => ({...prev, [s.id]: e.target.value}))}
                          placeholder={`الإجمالي: ${s.total_amount}`}
                          className="flex-1 px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500/50 placeholder-slate-600"
                        />
                      </div>
                      <textarea
                        value={settlNotes[s.id] || ""}
                        onChange={e => setSettlNotes(prev => ({...prev, [s.id]: e.target.value}))}
                        placeholder="ملاحظة أو سبب للسائق (اختياري)..."
                        rows={2}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500/50 placeholder-slate-600 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateSettl(s.id, "paid", s.total_amount, settlNotes[s.id])} disabled={updatingSettl === s.id}
                          className="flex-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl text-xs font-black border border-emerald-500/20 transition flex items-center justify-center gap-1">
                          {updatingSettl === s.id ? <RefreshCw size={11} className="animate-spin" /> : <Check size={11} />} موافقة كاملة
                        </button>
                        <button onClick={() => handleUpdateSettl(s.id, "partial", settlPaid[s.id] ? parseFloat(settlPaid[s.id]) : s.paid_amount, settlNotes[s.id])} disabled={updatingSettl === s.id}
                          className="flex-1 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl text-xs font-black border border-amber-500/20 transition flex items-center justify-center gap-1">
                          <BadgeDollarSign size={11} /> جزئي
                        </button>
                        <button onClick={() => handleUpdateSettl(s.id, "rejected", 0, settlNotes[s.id])} disabled={updatingSettl === s.id}
                          className="flex-1 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-black border border-red-500/20 transition flex items-center justify-center gap-1">
                          <X size={11} /> رفض
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────── PrintModal ───────────────────────────────────

function PrintModal({ drivers, onClose }: { drivers: Driver[]; onClose: () => void; }) {
  const [type, setType] = useState<"daily"|"monthly">("daily");
  const [month, setMonth] = useState(curMonth());
  const active = drivers.filter(d => Number(d.is_active) === 1);
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<Record<number, DriverData>>({});

  useEffect(() => {
    if (active.length === 0) return;
    setLoading(true);
    Promise.all(active.map(async d => {
      const res = await fetch(`/api/hr/driver-tracking?action=driver_data&driver_id=${d.id}&month=${month}`);
      return { id: d.id, data: res.ok ? await res.json() : null };
    })).then(results => {
      const m: Record<number, DriverData> = {};
      results.forEach(r => { if (r.data) m[r.id] = r.data; });
      setAllData(m); setLoading(false);
    });
  }, [month]); // eslint-disable-line

  const doPrint = () => {
    let html = `<html dir="rtl"><head><meta charset="utf-8"><title>تقرير ${month}</title><style>body{font-family:sans-serif;padding:20px;direction:rtl;font-size:12px}h1{color:#1e3a5f;font-size:18px}h2{color:#1e3a5f;font-size:14px;margin-top:20px;border-bottom:2px solid #ddd;padding-bottom:4px}table{width:100%;border-collapse:collapse;margin-bottom:12px}th,td{border:1px solid #ddd;padding:6px;text-align:right}th{background:#f0f4f8;font-weight:bold}.pb{page-break-after:always}</style></head><body><h1>تقرير السائقين ${type === "daily" ? "اليومي" : "الشهري"} — ${month}</h1>`;
    active.forEach(d => {
      const dd = allData[d.id];
      if (!dd) return;
      html += `<div class="pb"><h2>${d.name} — ${d.package_name ?? ""}</h2>`;
      if (type === "monthly") {
        html += `<table><thead><tr><th>التاريخ</th><th>الطلبات</th><th>الملغي</th><th>المحفظة</th></tr></thead><tbody>`;
        (dd.monthlySummary ?? []).forEach(s => { html += `<tr><td>${s.date}</td><td>${s.total_orders}</td><td>${s.total_cancelled}</td><td>${s.total_wallet} ر</td></tr>`; });
        html += `</tbody></table>`;
      } else {
        const te = (dd.entries ?? []).filter(e => e.date.slice(0, 10) === todayStr());
        html += `<table><thead><tr><th>الطلبات</th><th>المحفظة</th><th>الملغي</th><th>الحالة</th></tr></thead><tbody>`;
        if (!te.length) html += `<tr><td colspan="4" style="color:red;text-align:center">لم يتم الإدخال</td></tr>`;
        else te.forEach(e => { html += `<tr><td>${e.completed_orders}</td><td>${e.wallet_amount} ر</td><td>${e.cancelled_orders}</td><td>${e.payment_status}</td></tr>`; });
        html += `</tbody></table>`;
      }
      html += `</div>`;
    });
    html += `</body></html>`;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html); win.document.close(); win.print();
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}
    >
      <motion.div initial={{ scale:0.95 }} animate={{ scale:1 }} exit={{ scale:0.95 }}
        onClick={e => e.stopPropagation()} className="bg-[#0a1628] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-white text-lg flex items-center gap-2"><Printer size={18} className="text-cyan-400" /> تقرير شامل</h3>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition"><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["daily","monthly"] as const).map(t => (
              <button key={t} onClick={() => setType(t)} className={cn("flex-1 py-2.5 rounded-xl text-xs font-black transition", type === t ? "bg-cyan-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10")}>
                {t === "daily" ? "يومي" : "شهري"}
              </button>
            ))}
          </div>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white text-sm focus:outline-none" />
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
            {loading ? <p className="text-slate-500 text-sm flex items-center justify-center gap-2"><RefreshCw size={13} className="animate-spin" /> جاري التحميل...</p>
              : <p className="text-white text-sm font-bold">{active.length} سائق نشط في التقرير</p>}
          </div>
          <button onClick={doPrint} disabled={loading} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black rounded-xl hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2">
            <Printer size={16} /> طباعة التقرير
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────── Toast Notification ───────────────────────────

function ToastNotif({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 4500); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div initial={{ opacity:0, y:30, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:30, scale:0.95 }}
      className="fixed bottom-6 right-6 z-[200] bg-[#0a1628] border border-cyan-500/30 rounded-2xl p-4 shadow-2xl shadow-black/60 flex items-center gap-3 max-w-xs"
    >
      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
        <CheckCircle size={16} className="text-white" />
      </div>
      <p className="text-white text-sm font-bold leading-snug">{message}</p>
      <button onClick={onDone} className="p-1 hover:bg-white/10 rounded-lg transition flex-shrink-0"><X size={13} className="text-slate-500" /></button>
    </motion.div>
  );
}

// ─────────────────────────────── Main Component ───────────────────────────────

const DEFAULT_FIELD_SETTINGS: FieldSettings = { selectedPackages: [], fieldCount: 0, showInactiveFirst: false };

export function DriverTrackingClient({ companyId }: { companyId: number }) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stats, setStats] = useState<Stats>({ totalDrivers:0, activeDrivers:0, submittedToday:0, pendingRequests:0, pendingSettlements:0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  const [notifPos, setNotifPos] = useState<{ top: number; right: number } | null>(null);
  const [showSendMsg, setShowSendMsg] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [showFieldSettings, setShowFieldSettings] = useState(false);
  const [fieldSettings, setFieldSettings] = useState<FieldSettings>(DEFAULT_FIELD_SETTINGS);
  const [notifications, setNotifications] = useState<AppNotif[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const notifBtnRef = useRef<HTMLDivElement>(null);

  // Load notifications + field settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`dtnotifs_${companyId}`);
      if (stored) setNotifications(JSON.parse(stored));
    } catch { /* ignore */ }
    try {
      const fs = localStorage.getItem(`dtfieldsettings_${companyId}`);
      if (fs) setFieldSettings({ ...DEFAULT_FIELD_SETTINGS, ...JSON.parse(fs) });
    } catch { /* ignore */ }
  }, [companyId]);

  const saveNotifs = useCallback((n: AppNotif[]) => {
    setNotifications(n);
    try { localStorage.setItem(`dtnotifs_${companyId}`, JSON.stringify(n.slice(0, 50))); } catch { /* ignore */ }
  }, [companyId]);

  const addNotif = useCallback((n: Omit<AppNotif, "id"|"timestamp"|"read">) => {
    const newN: AppNotif = { ...n, id: Date.now().toString(), timestamp: new Date().toLocaleString("ar-SA"), read: false };
    setNotifications(prev => {
      const updated = [newN, ...prev].slice(0, 50);
      try { localStorage.setItem(`dtnotifs_${companyId}`, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
    setToast(n.message);
  }, [companyId]);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hr/driver-tracking?action=drivers");
      if (res.ok) {
        const d = await res.json();
        setDrivers(d.drivers ?? []);
        setStats(d.stats ?? {});
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDrivers(); }, [loadDrivers]);

  const handleToggle = async (driver: Driver, val: boolean) => {
    await fetch("/api/hr/driver-tracking", { method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"toggle_active", driver_id:driver.id, is_active:val }) });
    addNotif({ type:"system", driverName:driver.name, message: val ? `تم تفعيل ${driver.name} في الميدان` : `تم إيقاف ${driver.name} مؤقتاً` });
    await loadDrivers();
    if (selectedDriver?.id === driver.id) setSelectedDriver(prev => prev ? { ...prev, is_active: val } : null);
  };

  const handleSendMsg = async (ids: number[], title: string, message: string, img: string) => {
    await fetch("/api/hr/driver-tracking", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"send_message", driver_ids:ids, title, message, image_url: img }) });
    addNotif({ type:"message", driverName:`${ids.length} سائق`, message:`تم إرسال: "${message.slice(0, 50)}..."` });
  };

  const handleAlert = async (driver: Driver) => {
    await fetch("/api/hr/driver-tracking", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action:"send_message", driver_ids:[driver.id], title:"تنبيه: إدخال البيانات", message:`⚠️ ${driver.name}، لم تقم بإدخال بيانات طلباتك اليوم. يرجى الإدخال فوراً.` }) });
    addNotif({ type:"missing", driverName:driver.name, message:`تم إرسال تنبيه لـ ${driver.name} بإدخال بيانات اليوم` });
  };

  const handleBulkActivate = async (packageNames: string[]) => {
    const targets = drivers.filter(d => {
      if (packageNames.length === 0) return true;
      return packageNames.includes(d.package_name || "بدون باقة");
    });
    for (const d of targets) {
      if (Number(d.is_active) !== 1) {
        await fetch("/api/hr/driver-tracking", { method:"PUT", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ action:"toggle_active", driver_id:d.id, is_active:true }) });
      }
    }
    await loadDrivers();
    addNotif({ type:"system", driverName:"النظام", message:`تم تفعيل ${targets.length} سائق في الميدان` });
  };

  const handleBulkAlert = async () => {
    const targets = activeDrivers.filter(d => Number(d.today_entry_count) === 0);
    if (targets.length === 0) return;
    await fetch("/api/hr/driver-tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send_message",
        driver_ids: targets.map(d => d.id),
        title: "تنبيه: إدخال البيانات",
        message: "⚠️ لم تقم بإدخال بيانات طلباتك اليوم. يرجى الإدخال فوراً.",
      }),
    });
    addNotif({ type: "system", driverName: "النظام", message: `تم إرسال تنبيه جماعي لـ ${targets.length} سائق بإدخال بيانات اليوم` });
  };

  const handleActivateDrivers = async (activeIds: number[], packageName: string, allPkgIds?: number[]) => {
    const allIds = allPkgIds && allPkgIds.length > 0
      ? allPkgIds
      : drivers.filter(d => (d.package_name || "بدون باقة") === packageName).map(d => d.id);
    const res = await fetch("/api/hr/driver-tracking", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "bulk_activate", active_ids: activeIds, all_ids: allIds }),
    });
    const data = await res.json();
    await loadDrivers();
    addNotif({ type:"system", driverName:"النظام", message:`تم تفعيل ${data.activated ?? activeIds.length} وإيقاف ${data.deactivated ?? (allIds.length - activeIds.length)} في ${packageName}` });
  };

  const saveFieldSettings = (s: FieldSettings) => {
    setFieldSettings(s);
    try { localStorage.setItem(`dtfieldsettings_${companyId}`, JSON.stringify(s)); } catch { /* ignore */ }
  };

  // Apply package filter + field count from settings
  const filtered = drivers.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || (d.user_code ?? "").toLowerCase().includes(search.toLowerCase());
    const matchPackage = fieldSettings.selectedPackages.length === 0 || fieldSettings.selectedPackages.includes(d.package_name || "بدون باقة");
    return matchSearch && matchPackage;
  });
  const activeDrivers = (() => {
    const all = filtered
      .filter(d => Number(d.is_active) === 1)
      .sort((a, b) => Number(b.today_entry_count) - Number(a.today_entry_count));
    return fieldSettings.fieldCount > 0 ? all.slice(0, fieldSettings.fieldCount) : all;
  })();
  const inactiveDrivers = filtered.filter(d => Number(d.is_active) !== 1);
  const missingTodayCount = activeDrivers.filter(d => Number(d.today_entry_count) === 0).length;
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#060d18] p-4 md:p-6 space-y-5" dir="rtl">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0a1525] via-[#0d1e36] to-[#0a1525] border border-cyan-500/[0.12] shadow-2xl p-6 md:p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-72 h-72 bg-cyan-500/[0.06] rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-blue-600/[0.06] rounded-full blur-3xl" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-xl shadow-cyan-500/25">
                <Truck size={28} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0a1525] animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                متابعة السائقين
              </h1>
              <p className="text-white/40 text-sm mt-1">
                {fieldSettings.selectedPackages.length > 0
                  ? `${fieldSettings.selectedPackages.join("، ")} • `
                  : "جميع الباقات • "}
                {stats.totalDrivers} سائق
                {fieldSettings.fieldCount > 0 && ` • حد الميدان: ${fieldSettings.fieldCount}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..."
              className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 placeholder-slate-600 w-40" />

            <button onClick={() => setShowFieldSettings(true)}
              className={cn("flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-sm font-black transition",
                fieldSettings.selectedPackages.length > 0 || fieldSettings.fieldCount > 0
                  ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                  : "bg-white/[0.05] hover:bg-white/10 border-white/[0.08] text-white"
              )}>
              <Settings2 size={15} /> إعداد الميدان
              {(fieldSettings.selectedPackages.length > 0 || fieldSettings.fieldCount > 0) && (
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
              )}
            </button>

            {/* Notification bell */}
            <div className="relative" ref={notifBtnRef}>
              <button
                onClick={() => {
                  if (!showNotifCenter && notifBtnRef.current) {
                    const rect = notifBtnRef.current.getBoundingClientRect();
                    setNotifPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
                  }
                  setShowNotifCenter(v => !v);
                }}
                className="relative flex items-center gap-1.5 px-4 py-2.5 bg-white/[0.05] hover:bg-white/10 border border-white/[0.08] rounded-xl transition">
                <Bell size={17} className="text-white" />
                <span className="text-sm font-black text-white">اشعارات المتابعة</span>
                {unread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] px-0.5 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center leading-none h-[18px]">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
            </div>

            <button onClick={() => setShowSendMsg(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/25 rounded-xl text-cyan-300 text-sm font-black transition">
              <MessageSquare size={15} /> التواصل مع السائقين
            </button>
            <button onClick={() => setShowPrint(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/[0.05] hover:bg-white/10 border border-white/[0.08] rounded-xl text-white text-sm font-black transition">
              <Printer size={15} /> طباعة
            </button>
            {missingTodayCount > 0 && (
              <button onClick={handleBulkAlert}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl text-amber-300 text-sm font-black transition">
                <BellRing size={15} /> تنبيه جماعي ({missingTodayCount})
              </button>
            )}
            <button onClick={loadDrivers}
              className="p-2.5 bg-white/[0.05] hover:bg-white/10 border border-white/[0.08] rounded-xl transition">
              <RefreshCw size={17} className={cn("text-white", loading && "animate-spin")} />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Center — rendered outside overflow-hidden header */}
      <AnimatePresence>
        {showNotifCenter && (
          <NotifCenter notifs={notifications}
            onMarkRead={id => saveNotifs(notifications.map(n => n.id === id ? { ...n, read:true } : n))}
            onClear={() => saveNotifs([])}
            onClose={() => setShowNotifCenter(false)}
            pos={notifPos ?? undefined}
          />
        )}
      </AnimatePresence>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:"إجمالي", v: stats.totalDrivers, Icon: Users, from:"from-blue-500", to:"to-indigo-500" },
          { label:"في الميدان", v: stats.activeDrivers, Icon: UserCheck, from:"from-emerald-500", to:"to-teal-600" },
          { label:"أرسلوا اليوم", v: stats.submittedToday, Icon: CheckCircle, from:"from-sky-500", to:"to-cyan-500" },
          { label:"طلبات معلقة", v: stats.pendingRequests, Icon: AlertCircle, from:"from-amber-500", to:"to-orange-500" },
          { label:"تسويات معلقة", v: stats.pendingSettlements, Icon: Wallet, from:"from-violet-500", to:"to-purple-600" },
        ].map(({ label, v, Icon, from, to }) => (
          <div key={label} className="bg-[#0d1a2e] border border-white/[0.07] rounded-2xl p-4 shadow-lg hover:border-white/[0.12] transition-all">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${from} ${to} flex items-center justify-center mb-3`}><Icon size={16} className="text-white" /></div>
            <div className="text-2xl font-black text-white">{v}</div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* ── MISSING TODAY ALERT BANNER ─────────────────────────────────────── */}
      {!loading && missingTodayCount > 0 && (
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl">
              <AlertTriangle size={18} className="text-amber-400 animate-pulse" />
            </div>
            <div>
              <p className="font-black text-amber-300 text-sm">{missingTodayCount} سائق نشط لم يرسل تقريره اليوم</p>
              <p className="text-amber-600 text-xs mt-0.5">اضغط على "تنبيه جماعي" في الأعلى لإرسال تنبيه لجميع السائقين دفعةً واحدة</p>
            </div>
          </div>
          <button
            onClick={handleBulkAlert}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-black transition whitespace-nowrap"
          >
            <BellRing size={13} /> تنبيه الجميع ({missingTodayCount})
          </button>
        </motion.div>
      )}

      {/* ── ACTIVE DRIVERS ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
          <h2 className="font-black text-white text-xl">السائقون النشطون</h2>
          <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-black">{activeDrivers.length}</span>
        </div>
        {loading
          ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">{Array.from({length:4}).map((_,i)=><div key={i} className="bg-[#0d1a2e] border border-white/[0.05] rounded-2xl h-44 animate-pulse"/>)}</div>
          : activeDrivers.length === 0
            ? <div className="bg-[#0d1a2e] border border-white/[0.06] rounded-2xl p-10 text-center"><UserX size={36} className="mx-auto text-slate-700 mb-3"/><p className="text-slate-500 font-bold">لا يوجد سائقون نشطون</p><p className="text-slate-700 text-xs mt-1">فعّل السائقين من القسم أدناه</p></div>
            : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {activeDrivers.map(d => <DriverCard key={d.id} driver={d} onSelect={setSelectedDriver} onToggle={handleToggle} onAlert={handleAlert} />)}
              </div>
        }
      </div>

      {/* ── INACTIVE DRIVERS ───────────────────────────────────────────────── */}
      {inactiveDrivers.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-slate-600 to-slate-800" />
            <h2 className="font-black text-slate-500 text-xl">غير النشطين</h2>
            <span className="px-2.5 py-0.5 bg-slate-500/10 text-slate-500 border border-slate-500/15 rounded-full text-xs font-black">{inactiveDrivers.length}</span>
            <span className="text-[11px] text-slate-700">— فعّلهم للظهور في التقارير</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {inactiveDrivers.map(d => <DriverCard key={d.id} driver={d} onSelect={setSelectedDriver} onToggle={handleToggle} onAlert={handleAlert} />)}
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showFieldSettings && (
          <FieldSettingsModal
            onSave={saveFieldSettings}
            onClose={() => setShowFieldSettings(false)}
            onActivateDrivers={handleActivateDrivers}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSendMsg && <SendMessageModal drivers={drivers} onClose={() => setShowSendMsg(false)} onSend={handleSendMsg} />}
      </AnimatePresence>
      <AnimatePresence>
        {showPrint && <PrintModal drivers={drivers} onClose={() => setShowPrint(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedDriver && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 bg-black/60 z-40" onClick={() => setSelectedDriver(null)} />
            <DriverDetailPanel driver={selectedDriver} onClose={() => setSelectedDriver(null)} onToggle={val => handleToggle(selectedDriver, val)} />
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && <ToastNotif message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
