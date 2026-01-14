"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, X, Tags, Settings, RefreshCw,
  LayoutGrid, ChevronRight, CheckCircle2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Subtype {
  id: number;
  main_type: string;
  subtype_name: string;
  is_custom: boolean;
}

interface DeductionSubtypeManagerProps {
  companyId: number;
  userId: number;
  onClose: () => void;
  onRefresh: () => void;
}

const mainTypes = {
  advances: 'السلفيات',
  deductions: 'الخصومات الشهرية',
  other: 'استقطاعات أخرى'
};

export default function DeductionSubtypeManager({ companyId, userId, onClose, onRefresh }: DeductionSubtypeManagerProps) {
  const [subtypes, setSubtypes] = useState<Subtype[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubtype, setNewSubtype] = useState({ main_type: "advances", subtype_name: "", sort_order: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchSubtypes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses/deductions/subtypes?company_id=${companyId}&user_id=${userId}`);
      const data = await res.json();
      if (data.success) {
        setSubtypes(data.subtypes);
      }
    } catch (error) {
      console.error("Failed to fetch subtypes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubtypes();
  }, [companyId, userId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtype.main_type || !newSubtype.subtype_name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses/deductions/subtypes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newSubtype, company_id: companyId, user_id: userId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'تم إضافة النوع بنجاح' });
        setNewSubtype(prev => ({ ...prev, subtype_name: "", sort_order: 0 }));
        await fetchSubtypes();
        onRefresh();
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل إضافة النوع' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ غير متوقع' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا النوع المخصص؟")) return;

    try {
      const res = await fetch(`/api/expenses/deductions/subtypes?id=${id}&user_id=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'تم حذف النوع بنجاح' });
        await fetchSubtypes();
        onRefresh();
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل حذف النوع' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحذف' });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 rtl" dir="rtl">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20"
      >
        {/* Header - Rose Theme */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-rose-900 p-6 text-white relative">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                <Settings className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">إدارة أنواع الاستقطاعات المخصصة</h2>
                <p className="text-rose-100/70 text-sm mt-0.5">تخصيص وتعديل أنواع الاستقطاعات الفرعية للنظام</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-2xl flex items-center space-x-3 space-x-reverse font-bold text-sm ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                }`}
              >
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>{message.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Row - Clean Design */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-1.5 h-6 bg-rose-600 rounded-full"></div>
              <h3 className="text-base font-bold text-slate-900">إضافة نوع جديد</h3>
            </div>
            
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 mr-1">النوع الرئيسي</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none transition-all"
                  value={newSubtype.main_type}
                  onChange={(e) => setNewSubtype(prev => ({ ...prev, main_type: e.target.value }))}
                  required
                >
                  {Object.entries(mainTypes).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 mr-1">اسم النوع الفرعي</label>
                <input 
                  type="text"
                  placeholder="مثال: خصم وجبات، سلفة عارضة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none transition-all"
                  value={newSubtype.subtype_name}
                  onChange={(e) => setNewSubtype(prev => ({ ...prev, subtype_name: e.target.value }))}
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-6 py-2.5 font-bold text-sm transition-all flex items-center justify-center space-x-2 space-x-reverse shadow-lg shadow-rose-100 disabled:opacity-50 h-[45px]"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>إضافة النوع</span>
              </button>
            </form>
          </div>

          {/* Table View */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <LayoutGrid className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-700">قائمة الأنواع المسجلة</h3>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse text-[10px] font-bold">
                <div className="flex items-center space-x-1 space-x-reverse">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span className="text-slate-500">مخصص</span>
                </div>
                <div className="flex items-center space-x-1 space-x-reverse">
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  <span className="text-slate-500">عام 🌟</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4 border-b border-slate-100">النوع الرئيسي</th>
                    <th className="px-6 py-4 border-b border-slate-100">اسم النوع الفرعي</th>
                    <th className="px-6 py-4 border-b border-slate-100 text-center">الحالة</th>
                    <th className="px-6 py-4 border-b border-slate-100 text-center">خيارات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
                          <p className="text-sm text-slate-500">جاري تحميل البيانات...</p>
                        </div>
                      </td>
                    </tr>
                  ) : (subtypes || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <p className="text-sm text-slate-400">لا توجد أنواع مخصصة حالياً</p>
                      </td>
                    </tr>
                  ) : (
                    (subtypes || []).map((item) => (
                      <tr 
                        key={item.id} 
                        className={`group hover:bg-slate-50/80 transition-colors ${!item.is_custom ? 'opacity-70' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <ChevronRight className={`w-3 h-3 ${item.is_custom ? 'text-rose-400' : 'text-slate-300'}`} />
                            <span className="text-sm font-medium text-slate-900">
                              {mainTypes[item.main_type as keyof typeof mainTypes] || item.main_type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm ${item.is_custom ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                            {item.subtype_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.is_custom ? (
                            <span className="inline-flex items-center px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg border border-rose-100">
                              مخصص ✏️
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg">
                              عام 🌟
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.is_custom ? (
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="حذف النوع"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-300 font-bold select-none">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center px-8">
          <p className="text-[10px] text-slate-400 font-medium">
            * الأنواع العامة 🌟 لا يمكن حذفها، يمكنك فقط حذف الأنواع المخصصة ✏️ التي قمت بإضافتها.
          </p>
          <button 
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-200"
          >
            إغلاق النافذة
          </button>
        </div>
      </motion.div>
    </div>
  );
}
