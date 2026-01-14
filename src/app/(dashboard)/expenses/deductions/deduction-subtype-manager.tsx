"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Plus, Trash2, Tags, Save, AlertCircle, Info, 
  Settings, CheckCircle2, ChevronRight
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
  const [newSubtype, setNewSubtype] = useState({ main_type: "advances", subtype_name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchSubtypes = async () => {
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
    if (!newSubtype.subtype_name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses/deductions/subtypes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSubtype,
          company_id: companyId,
          user_id: userId
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: "تم إضافة النوع بنجاح" });
        setNewSubtype({ ...newSubtype, subtype_name: "" });
        fetchSubtypes();
        onRefresh();
      } else {
        setMessage({ type: 'error', text: data.error || "فشل إضافة النوع" });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "حدث خطأ غير متوقع" });
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
        setMessage({ type: 'success', text: "تم حذف النوع بنجاح" });
        fetchSubtypes();
        onRefresh();
      } else {
        setMessage({ type: 'error', text: data.error || "فشل حذف النوع" });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "حدث خطأ أثناء الحذف" });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 rtl"
      dir="rtl"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8 text-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Tags className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">إدارة أنواع الاستقطاعات</h2>
                <p className="text-indigo-100 text-sm font-medium opacity-90">تخصيص القوائم المنسدلة لعمليات الاستقطاع</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          {/* Add Form */}
          <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 relative group">
            <div className="absolute -top-3 right-8 px-4 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">
              إضافة نوع جديد
            </div>
            <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 mt-2">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 mr-2">التصنيف الرئيسي</label>
                <select 
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                  value={newSubtype.main_type}
                  onChange={(e) => setNewSubtype({ ...newSubtype, main_type: e.target.value })}
                >
                  {Object.entries(mainTypes).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-[2] space-y-2">
                <label className="text-xs font-bold text-slate-500 mr-2">اسم النوع الفرعي</label>
                <div className="relative">
                  <input 
                    type="text" 
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 pr-10"
                    placeholder="مثال: خصم وجبات، سلفة عارضة..."
                    value={newSubtype.subtype_name}
                    onChange={(e) => setNewSubtype({ ...newSubtype, subtype_name: e.target.value })}
                  />
                  <Settings className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                </div>
              </div>
              <div className="flex items-end">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>إضافة</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

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

          {/* List Sections */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 space-x-reverse mb-2">
              <div className="w-1 h-6 bg-indigo-600 rounded-full" />
              <h3 className="text-xl font-black text-slate-800 tracking-tight">الأنواع المسجلة حالياً</h3>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-b-indigo-600" />
                <p className="text-slate-400 font-bold">جاري تحميل القائمة...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(mainTypes).map(([typeKey, typeLabel]) => {
                  const items = subtypes.filter(s => s.main_type === typeKey);
                  return (
                    <div key={typeKey} className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-sm font-black text-slate-400 uppercase tracking-wider">{typeLabel}</span>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[10px] font-bold">{items.length}</span>
                      </div>
                      <div className="space-y-2">
                        {items.length > 0 ? (
                          items.map((item) => (
                            <motion.div 
                              layout
                              key={item.id}
                              className={`group p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                                item.is_custom 
                                ? 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md' 
                                : 'bg-slate-50/50 border-transparent italic'
                              }`}
                            >
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <ChevronRight className={`w-3 h-3 ${item.is_custom ? 'text-indigo-400' : 'text-slate-300'}`} />
                                <span className={`text-sm font-bold ${item.is_custom ? 'text-slate-700' : 'text-slate-400'}`}>
                                  {item.subtype_name}
                                </span>
                                {!item.is_custom && (
                                  <span className="text-[9px] bg-slate-200/50 text-slate-500 px-1.5 py-0.5 rounded-md font-bold not-italic">عام 🌟</span>
                                )}
                              </div>
                              {item.is_custom && (
                                <button 
                                  onClick={() => handleDelete(item.id)}
                                  className="text-slate-300 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-6 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-xs text-slate-400 font-medium italic">لا توجد أنواع مضافة</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-6 border-t border-slate-100">
          <div className="flex items-start space-x-3 space-x-reverse bg-white p-4 rounded-2xl border border-slate-100">
            <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700">حول أنواع الاستقطاعات المخصصة</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                الأنواع <span className="text-indigo-600 font-bold">المخصصة</span> التي تضيفها تظهر لك فقط في قوائم الإدخال. 
                أما الأنواع <span className="italic text-slate-400">العامة</span> فهي ثابتة للنظام ولا يمكن حذفها لضمان استقرار التقارير.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
