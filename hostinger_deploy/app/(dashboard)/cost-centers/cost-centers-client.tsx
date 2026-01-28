"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Filter,
  BarChart3,
  LayoutGrid,
  Hash,
  Building,
  AlertCircle,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { CostCenter } from "@/lib/types";
import { createCostCenter, updateCostCenter, deleteCostCenter } from "@/lib/actions/accounting";
import { useTranslations, useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";

interface CostCentersClientProps {
  initialCostCenters: CostCenter[];
  companyId: number;
}

export function CostCentersClient({ initialCostCenters, companyId }: CostCentersClientProps) {
  const t = useTranslations("costCenters");
  const { isRTL: isRtl } = useLocale();
  
  const [costCenters, setCostCenters] = useState(initialCostCenters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<CostCenter | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    center_code: "",
    center_name: "",
  });

  const filteredCenters = costCenters.filter(center => 
    center.center_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.center_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (center?: CostCenter) => {
    if (center) {
      setEditingCenter(center);
      setFormData({
        center_code: center.center_code,
        center_name: center.center_name,
      });
    } else {
      setEditingCenter(null);
      setFormData({
        center_code: "",
        center_name: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingCenter) {
        const result = await updateCostCenter(editingCenter.id, formData);
        if (result.success) {
          toast.success(t("updateSuccess"));
          setCostCenters(prev => prev.map(c => c.id === editingCenter.id ? { ...c, ...formData } : c));
          setIsModalOpen(false);
        } else {
          toast.error(result.error || t("updateError"));
        }
      } else {
        const result = await createCostCenter({ ...formData, company_id: companyId });
        if (result.success) {
          toast.success(t("addSuccess"));
          window.location.reload(); 
        } else {
          toast.error(result.error || t("addError"));
        }
      }
    } catch {
      toast.error(t("unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteCostCenter(id);
      if (result.success) {
        toast.success(t("deleteSuccess"));
        setCostCenters(prev => prev.filter(c => c.id !== id));
        setDeleteConfirm(null);
      } else {
        toast.error(result.error || t("deleteError"));
      }
    } catch {
      toast.error(t("unexpectedError"));
    }
  };

  return (
    <div className="w-full max-w-[98%] mx-auto px-6 py-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="bg-[#1a2234] rounded-3xl p-8 space-y-8 shadow-2xl border border-white/5">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-700 to-orange-600 p-8 text-white shadow-xl border border-white/10"
        >
          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
              <LayoutGrid className="w-8 h-8 text-amber-200" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-amber-100 max-w-2xl">
              {t("subtitle")}
            </p>
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className={cn("bg-white p-5 rounded-2xl border border-slate-100 shadow-lg flex items-center group hover:border-amber-200 transition-colors", isRtl ? "space-x-4 space-x-reverse" : "space-x-4")}>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold">{t("totalCenters")}</p>
              <p className="text-2xl font-black text-slate-900">{costCenters.length}</p>
            </div>
          </div>
          <div className={cn("bg-white p-5 rounded-2xl border border-slate-100 shadow-lg flex items-center group hover:border-emerald-200 transition-colors", isRtl ? "space-x-4 space-x-reverse" : "space-x-4")}>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold">{t("activeCenters")}</p>
              <p className="text-2xl font-black text-slate-900">{costCenters.length}</p>
            </div>
          </div>
          <div className={cn("bg-white p-5 rounded-2xl border border-slate-100 shadow-lg flex items-center group hover:border-blue-200 transition-colors", isRtl ? "space-x-4 space-x-reverse" : "space-x-4")}>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold">{t("branches")}</p>
              <p className="text-2xl font-black text-slate-900">{costCenters.length}</p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div 
          className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between"
          whileHover={{ y: -2 }}
        >
          <div className="flex-1 relative w-full md:w-auto">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5", isRtl ? "right-4" : "left-4")} />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm",
                isRtl ? "pr-12 pl-4" : "pl-12 pr-4"
              )}
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className={cn("bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center shadow-lg shadow-amber-200 text-sm whitespace-nowrap", isRtl ? "space-x-2 space-x-reverse" : "space-x-2")}
          >
            <Plus className="w-5 h-5" />
            <span>{t("addNewCenter")}</span>
          </button>
        </motion.div>

        {/* Cost Centers Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className={cn("w-full border-collapse min-w-[600px]", isRtl ? "text-right" : "text-left")}>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">{t("centerCode")}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">{t("centerName")}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredCenters.length > 0 ? (
                    filteredCenters.map((center, index) => (
                      <motion.tr
                        key={center.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={cn("flex items-center", isRtl ? "space-x-2 space-x-reverse" : "space-x-2")}>
                            <Hash className="w-4 h-4 text-slate-300" />
                            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm">
                              {center.center_code}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={cn("flex items-center", isRtl ? "space-x-3 space-x-reverse" : "space-x-3")}>
                            <div className="p-2 rounded-lg bg-amber-50">
                              <Building className="w-4 h-4 text-amber-600" />
                            </div>
                            <span className="font-bold text-slate-900">{center.center_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenModal(center)}
                              className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                              title={t("edit")}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(center.id)}
                              className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                              title={t("delete")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center space-y-4 text-slate-400">
                          <FileText className="w-16 h-16 opacity-30" />
                          <p className="font-bold text-lg">{t("noMatchingCenters")}</p>
                          <p className="text-sm">{t("noMatchingCentersDesc")}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500 font-bold">
              {t("view")} <span className="text-slate-900">{filteredCenters.length}</span> {t("outOf")} <span className="text-slate-900">{costCenters.length}</span> {t("centersCount")}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-700 to-orange-600 p-6 text-white flex items-center justify-between">
                <div className={cn("flex items-center", isRtl ? "space-x-4 space-x-reverse" : "space-x-4")}>
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    {editingCenter ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{editingCenter ? t("editCenter") : t("addNewCenterTitle")}</h3>
                    <p className="text-amber-100 text-xs">{t("fillRequiredData")}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className={cn("text-xs font-black text-slate-500 uppercase tracking-wider", isRtl ? "mr-1" : "ml-1")}>{t("centerCode")}</label>
                  <div className="relative">
                    <Hash className={cn("absolute top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4", isRtl ? "right-4" : "left-4")} />
                    <input
                      type="text"
                      required
                      value={formData.center_code}
                      onChange={(e) => setFormData({ ...formData, center_code: e.target.value })}
                      placeholder={t("codeExample")}
                      className={cn(
                        "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm font-bold",
                        isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={cn("text-xs font-black text-slate-500 uppercase tracking-wider", isRtl ? "mr-1" : "ml-1")}>{t("centerName")}</label>
                  <div className="relative">
                    <Building className={cn("absolute top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4", isRtl ? "right-4" : "left-4")} />
                    <input
                      type="text"
                      required
                      value={formData.center_name}
                      onChange={(e) => setFormData({ ...formData, center_name: e.target.value })}
                      placeholder={t("nameExample")}
                      className={cn(
                        "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm font-bold",
                        isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                      )}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn("flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center disabled:opacity-50 shadow-lg shadow-amber-200", isRtl ? "space-x-2 space-x-reverse" : "space-x-2")}
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{editingCenter ? t("saveChanges") : t("addCenter")}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{t("confirmDelete")}</h3>
              <p className="text-slate-500 mb-8">{t("confirmDeleteDesc")}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-all"
                >
                  {t("yesDelete")}
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  {t("cancel")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
