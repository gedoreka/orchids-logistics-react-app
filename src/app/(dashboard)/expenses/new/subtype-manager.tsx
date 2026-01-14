"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, X, Tags, Info, CheckCircle, 
  ChevronDown, Settings, Save, AlertCircle, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Subtype {
  id: number;
  main_type: string;
  subtype_name: string;
  is_custom: boolean;
  sort_order: number;
}

interface SubtypeManagerProps {
  companyId: number;
  userId: number;
  onClose: () => void;
  onRefresh: () => void;
}

const mainTypes = {
  iqama: 'منصرفات إقامة',
  fuel: 'منصرفات وقود',
  housing: 'إيجار سكن',
  maintenance: 'صيانة / شراء',
  general: 'مصاريف عامة',
  traffic: 'مخالفات مرورية',
  advances: 'السلفيات'
};

export default function SubtypeManager({ companyId, userId, onClose, onRefresh }: SubtypeManagerProps) {
  const [subtypes, setSubtypes] = useState<Subtype[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubtype, setNewSubtype] = useState({ main_type: "", subtype_name: "", sort_order: 0 });
  const [submitting, setSubmitting] = useState(false);

  const fetchSubtypes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses/subtypes?company_id=${companyId}&user_id=${userId}`);
      const data = await res.json();
      setSubtypes(data);
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
    if (!newSubtype.main_type || !newSubtype.subtype_name) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses/subtypes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newSubtype, company_id: companyId, user_id: userId }),
      });
      if (res.ok) {
        setNewSubtype({ main_type: "", subtype_name: "", sort_order: 0 });
        fetchSubtypes();
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to add subtype", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا النوع المخصص؟")) return;

    try {
      const res = await fetch(`/api/expenses/subtypes?id=${id}&company_id=${companyId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchSubtypes();
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to delete subtype", error);
    }
  };

  const groupedSubtypes = subtypes.reduce((acc, curr) => {
    if (!acc[curr.main_type]) acc[curr.main_type] = [];
    acc[curr.main_type].push(curr);
    return acc;
  }, {} as Record<string, Subtype[]>);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 rtl" dir="rtl">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Settings className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold tracking-tight">إدارة أنواع المصروفات المخصصة</h2>
                <p className="text-blue-100 text-xs opacity-90">أضف وتعديل الأنواع الفرعية الخاصة بك فقط</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-100">
                <p className="text-xl font-bold text-blue-600">{subtypes.length}</p>
                <p className="text-xs text-blue-700 font-medium">إجمالي الأنواع</p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl text-center border border-green-100">
                <p className="text-xl font-bold text-green-600">{subtypes.filter(s => s.is_custom).length}</p>
                <p className="text-xs text-green-700 font-medium">أنواع مخصصة</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl text-center border border-amber-100">
                <p className="text-xl font-bold text-amber-600">{subtypes.filter(s => !s.is_custom).length}</p>
                <p className="text-xs text-amber-700 font-medium">أنواع عامة</p>
              </div>
            </div>

            {/* Add Form */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 space-x-reverse mb-3 text-slate-800">
                <Plus className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold">إضافة نوع مخصص جديد</h3>
              </div>
              <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select 
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newSubtype.main_type}
                  onChange={(e) => setNewSubtype(prev => ({ ...prev, main_type: e.target.value }))}
                  required
                >
                  <option value="">-- النوع الرئيسي --</option>
                  {Object.entries(mainTypes).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <input 
                  type="text"
                  placeholder="اسم النوع المخصص"
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newSubtype.subtype_name}
                  onChange={(e) => setNewSubtype(prev => ({ ...prev, subtype_name: e.target.value }))}
                  required
                />
                <input 
                  type="number"
                  placeholder="ترتيب"
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newSubtype.sort_order}
                  onChange={(e) => setNewSubtype(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                />
                <button 
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center space-x-2 space-x-reverse"
                >
                  {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>إضافة</span>
                </button>
              </form>
            </div>

            {/* List grouped by main type */}
            <div className="space-y-4">
              {Object.entries(groupedSubtypes).map(([mainType, items]) => (
                <div key={mainType} className="space-y-2">
                  <div className="flex items-center space-x-2 space-x-reverse px-2 border-r-4 border-blue-500">
                    <h4 className="text-sm font-bold text-slate-900">{mainTypes[mainType as keyof typeof mainTypes] || mainType}</h4>
                    <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded-full">{items.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        className={`group relative p-3 rounded-lg border transition-all flex items-center justify-between ${item.is_custom ? 'bg-white border-slate-200 hover:border-blue-300' : 'bg-slate-50 border-slate-100 opacity-80'}`}
                      >
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.is_custom ? 'bg-blue-400' : 'bg-slate-400'}`} />
                          <span className={`text-xs font-medium ${item.is_custom ? 'text-slate-900' : 'text-slate-600'}`}>{item.subtype_name}</span>
                        </div>
                        
                        {item.is_custom && (
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-red-500 rounded transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-3 border-t border-slate-100 flex justify-end">
            <button 
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-1.5 rounded-lg font-bold text-sm transition-colors"
            >
              إغلاق
            </button>
          </div>
        </motion.div>
    </div>
  );
}
