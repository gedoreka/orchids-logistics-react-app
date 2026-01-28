"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, X, Tags, Settings, Save, RefreshCw,
  LayoutGrid, ArrowUpDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/lib/locale-context";

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
  iqama: 'iqama',
  fuel: 'fuel',
  housing: 'housing',
  maintenance: 'maintenance',
  general: 'general',
  traffic: 'traffic',
  advances: 'advances'
};

export default function SubtypeManager({ companyId, userId, onClose, onRefresh }: SubtypeManagerProps) {
  const t = useTranslations("expenses");
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
        await fetchSubtypes();
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to add subtype", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("subtypeManager.confirmDelete"))) return;

    try {
      const res = await fetch(`/api/expenses/subtypes?id=${id}&company_id=${companyId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchSubtypes();
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to delete subtype", error);
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
        {/* Header - Modern Gradient */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-6 text-white relative">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                <Settings className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">{t("subtypeManager.title")}</h2>
                <p className="text-blue-100/70 text-sm mt-0.5">{t("subtypeManager.subtitle")}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
          {/* Form Row - Clean Design */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              <h3 className="text-base font-bold text-slate-900">{t("subtypeManager.addNew")}</h3>
            </div>
            
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 mr-1">{t("subtypeManager.mainType")}</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  value={newSubtype.main_type}
                  onChange={(e) => setNewSubtype(prev => ({ ...prev, main_type: e.target.value }))}
                  required
                >
                  <option value="">-- {t("form.selectType")} --</option>
                  {Object.entries(mainTypes).map(([key]) => (
                    <option key={key} value={key}>{t(`types.${key}`)}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-bold text-slate-500 mr-1">{t("subtypeManager.subtypeName")}</label>
                <input 
                  type="text"
                  placeholder={t("subtypeManager.subtypePlaceholder")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  value={newSubtype.subtype_name}
                  onChange={(e) => setNewSubtype(prev => ({ ...prev, subtype_name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 mr-1">{t("subtypeManager.sortOrder")}</label>
                <input 
                  type="number"
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  value={newSubtype.sort_order}
                  onChange={(e) => setNewSubtype(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 font-bold text-sm transition-all flex items-center justify-center space-x-2 space-x-reverse shadow-lg shadow-blue-100 disabled:opacity-50 h-[45px]"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>{t("subtypeManager.addBtn")}</span>
              </button>
            </form>
          </div>

          {/* Table View - Matching the image reference style */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <LayoutGrid className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-700">{t("subtypeManager.listTitle")}</h3>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse text-[10px] font-bold">
                <div className="flex items-center space-x-1 space-x-reverse">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-slate-500">{t("subtypeManager.custom")}</span>
                </div>
                <div className="flex items-center space-x-1 space-x-reverse">
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  <span className="text-slate-500">{t("subtypeManager.general")}</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4 border-b border-slate-100">{t("subtypeManager.mainTypeCol")}</th>
                    <th className="px-6 py-4 border-b border-slate-100">{t("subtypeManager.subtypeNameCol")}</th>
                    <th className="px-6 py-4 border-b border-slate-100 text-center">{t("subtypeManager.sortOrder")}</th>
                    <th className="px-6 py-4 border-b border-slate-100 text-center">{t("subtypeManager.options")}</th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center space-y-2">
                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                            <p className="text-sm text-slate-500">{t("subtypeManager.loading")}</p>
                          </div>
                        </td>
                      </tr>
                    ) : (subtypes || []).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <p className="text-sm text-slate-400">{t("subtypeManager.noCustom")}</p>
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
                            <div className={`w-1 h-4 rounded-full ${item.is_custom ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                            <span className="text-sm font-medium text-slate-900">
                              {t(`types.${item.main_type}`)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm ${item.is_custom ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                            {item.subtype_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center bg-slate-100 text-slate-600 text-[10px] font-bold w-6 h-6 rounded-lg">
                            {item.sort_order}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.is_custom ? (
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title={t("common.delete")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-300 font-bold select-none">{t("subtypeManager.default")}</span>
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
            {t("subtypeManager.footerNote")}
          </p>
          <button 
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-200"
          >
            {t("subtypeManager.close")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
