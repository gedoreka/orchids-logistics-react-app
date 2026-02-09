"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  BarChart3,
  Building,
  AlertCircle,
  Hash,
  FileText,
  RefreshCw,
  ChevronRight,
  Layers,
  MapPin,
  ClipboardList
} from "lucide-react";
import { toast } from "sonner";
import { CostCenter } from "@/lib/types";
import { createCostCenter, updateCostCenter, deleteCostCenter } from "@/lib/actions/accounting";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "@/lib/locale-context";

interface CostCentersClientProps {
  initialCostCenters: CostCenter[];
  companyId: number;
}

export function CostCentersClient({ initialCostCenters, companyId }: CostCentersClientProps) {
  const t = useTranslations("costCenters");
  const { isRTL: isRtl } = useLocale();
  const router = useRouter();
  
  const [costCenters, setCostCenters] = useState(initialCostCenters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<CostCenter | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setCostCenters(initialCostCenters);
  }, [initialCostCenters]);

  const [formData, setFormData] = useState({
    center_code: "",
    center_name: "",
    center_type: "sub" as "main" | "sub",
    parent_id: null as number | null,
    description: ""
  });

  // Build tree structure
  const centerTree = useMemo(() => {
    const map: Record<number, any> = {};
    const roots: any[] = [];

    const sorted = [...costCenters].sort((a, b) => a.center_code.localeCompare(b.center_code));

    sorted.forEach(center => {
      map[center.id] = { ...center, children: [] };
    });

    sorted.forEach(center => {
      if (center.parent_id && map[center.parent_id]) {
        map[center.parent_id].children.push(map[center.id]);
      } else {
        roots.push(map[center.id]);
      }
    });

    return roots;
  }, [costCenters]);

  const flattenTree = (nodes: any[], level = 0): any[] => {
    const result: any[] = [];
    nodes.forEach(node => {
      if (searchTerm && !node.center_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !node.center_code.toLowerCase().includes(searchTerm.toLowerCase())) {
        const childrenMatches = flattenTree(node.children, level + 1);
        if (childrenMatches.length > 0) {
          result.push({ ...node, level, hasMatches: true });
          result.push(...childrenMatches);
        }
      } else {
        result.push({ ...node, level });
        if (expandedRows[node.id] || searchTerm) {
          result.push(...flattenTree(node.children, level + 1));
        }
      }
    });
    return result;
  };

  const displayCenters = useMemo(() => flattenTree(centerTree), [centerTree, expandedRows, searchTerm]);

  const stats = {
    total: costCenters.length,
    main: costCenters.filter(c => c.center_type === 'main').length,
    sub: costCenters.filter(c => c.center_type === 'sub').length,
  };

  const handleOpenModal = (center?: CostCenter) => {
    if (center) {
      setEditingCenter(center);
      setFormData({
        center_code: center.center_code,
        center_name: center.center_name,
        center_type: center.center_type || "sub",
        parent_id: center.parent_id || null,
        description: center.description || ""
      });
    } else {
      setEditingCenter(null);
      setFormData({
        center_code: "",
        center_name: "",
        center_type: "sub",
        parent_id: null,
        description: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const previousCenters = [...costCenters];

    try {
      if (editingCenter) {
        // Optimistic update
        const updatedCenter = { ...editingCenter, ...formData };
        setCostCenters(prev => prev.map(c => c.id === editingCenter.id ? updatedCenter : c));
        
        const result = await updateCostCenter(editingCenter.id, formData);
        if (result.success) {
          toast.success(t("updateSuccess"));
          setIsModalOpen(false);
          router.refresh();
        } else {
          // Rollback
          setCostCenters(previousCenters);
          toast.error(result.error || t("updateError"));
        }
      } else {
        const result = await createCostCenter({ ...formData, company_id: companyId });
        if (result.success) {
          toast.success(t("addSuccess"));
          setIsModalOpen(false);
          // For create, we wait for the result to get the ID, but we update state immediately after success
          // instead of just waiting for router.refresh()
          router.refresh();
        } else {
          toast.error(result.error || t("addError"));
        }
      }
    } catch {
      setCostCenters(previousCenters);
      toast.error(t("unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const previousCenters = [...costCenters];
    
    // Optimistic update
    setCostCenters(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);

    try {
      const result = await deleteCostCenter(id);
      if (result.success) {
        toast.success(t("deleteSuccess"));
        router.refresh();
      } else {
        // Rollback
        setCostCenters(previousCenters);
        toast.error(result.error || t("deleteError"));
      }
    } catch {
      // Rollback
      setCostCenters(previousCenters);
      toast.error(t("unexpectedError"));
    }
  };

  const handleSeed = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    try {
      const response = await fetch("/api/cost-centers/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(t("seedSuccess"));
        // Re-fetch or refresh to show new data immediately
        router.refresh();
      } else {
        toast.error(data.error || t("seedError"));
      }
    } catch {
      toast.error(t("unexpectedError"));
    } finally {
      setIsSeeding(false);
    }
  };

  const toggleRow = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full max-w-[98%] mx-auto px-6 py-6" dir={isRtl ? "rtl" : "ltr"}>
        <div className="bg-gradient-to-b from-[#0f172a] to-[#1a2234] rounded-[30px] p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)] border border-white/[0.07] space-y-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-10 text-white shadow-[0_20px_60px_-15px_rgba(245,158,11,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/[0.08]"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500"></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
              <div className="p-5 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-[2rem] backdrop-blur-md border border-amber-400/20 shadow-[0_8px_32px_rgba(245,158,11,0.2)]">
                <BarChart3 className="w-10 h-10 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent drop-shadow-sm">
                  {t("title")}
                </h1>
                <p className="text-slate-400 max-w-2xl font-medium text-sm">
                  {t("subtitle")}
                </p>
              </div>
            </div>

            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-600/8 rounded-full blur-[80px]" />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-600/8 rounded-full blur-[80px]" />
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
              <div className={cn("bg-[#0f172a]/80 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/[0.06] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] flex items-center space-x-4 group hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1", isRtl ? "space-x-reverse" : "space-x")}>
                <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-white" style={{ boxShadow: '0 8px 24px -4px rgba(245,158,11,0.3)' }}>
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-bold mb-1 uppercase tracking-wider">{t("totalCenters")}</p>
                  <p className="text-3xl font-black text-white tracking-tight">{stats.total}</p>
                </div>
              </div>
              <div className={cn("bg-[#0f172a]/80 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/[0.06] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] flex items-center space-x-4 group hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1", isRtl ? "space-x-reverse" : "space-x")}>
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-white" style={{ boxShadow: '0 8px 24px -4px rgba(16,185,129,0.3)' }}>
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-bold mb-1 uppercase tracking-wider">{t("activeCenters")}</p>
                  <p className="text-3xl font-black text-white tracking-tight">{stats.main}</p>
                </div>
              </div>
              <div className={cn("bg-[#0f172a]/80 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/[0.06] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] flex items-center space-x-4 group hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1", isRtl ? "space-x-reverse" : "space-x")}>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white" style={{ boxShadow: '0 8px 24px -4px rgba(59,130,246,0.3)' }}>
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-bold mb-1 uppercase tracking-wider">{t("branches")}</p>
                  <p className="text-3xl font-black text-white tracking-tight">{stats.sub}</p>
                </div>
              </div>
          </motion.div>

          {/* Search and Action Bar */}
            <motion.div 
              className="bg-[#0f172a]/80 backdrop-blur-xl p-5 rounded-[1.5rem] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] border border-white/[0.06] flex flex-col md:flex-row gap-4 items-center justify-between"
            >
            <div className="flex-1 relative w-full md:w-auto">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5", isRtl ? "right-5" : "left-5")} />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm font-bold shadow-sm text-white",
                  isRtl ? "pr-14 pl-6" : "pl-14 pr-6"
                )}
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={handleSeed}
                disabled={isSeeding}
                className={cn(
                  "bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-black transition-all flex items-center shadow-xl shadow-emerald-500/20 text-sm whitespace-nowrap active:scale-95 disabled:opacity-50",
                  isRtl ? "space-x-2 space-x-reverse" : "space-x-2"
                )}
              >
                <RefreshCw className={cn("w-5 h-5", isSeeding && "animate-spin")} />
                <span>{isSeeding ? t("seeding") : t("seed")}</span>
              </button>
              <button
                onClick={() => handleOpenModal()}
                className={cn("bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-2xl font-black transition-all flex items-center shadow-xl shadow-amber-500/20 text-sm whitespace-nowrap active:scale-95", isRtl ? "space-x-2 space-x-reverse" : "space-x-2")}
              >
                <Plus className="w-5 h-5" />
                <span>{t("addNewCenter")}</span>
              </button>
            </div>
          </motion.div>

          {/* Cost Centers Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              className="bg-[#0f172a]/80 backdrop-blur-xl rounded-[2rem] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5)] border border-white/[0.06] overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className={cn("w-full border-collapse min-w-[800px]", isRtl ? "text-right" : "text-left")}>
                  <thead>
                    <tr className="bg-gradient-to-r from-[#0c1222] via-[#111827] to-[#0c1222] border-b border-white/[0.06]">
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{t("centerCode")}</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{t("centerName")}</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{t("mainLevel")}</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] text-center">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {displayCenters.length > 0 ? (
                      displayCenters.map((center, index) => {
                        const hasChildren = center.children && center.children.length > 0;
                        return (
                          <motion.tr
                            key={center.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                              className={cn(
                                "border-b border-white/[0.04] hover:bg-white/[0.03] transition-all duration-200 group",
                                center.center_type === 'main' ? "bg-white/[0.02] font-bold" : ""
                              )}
                          >
                            <td className="px-8 py-5">
                              <div className={cn("flex items-center space-x-2", isRtl && "space-x-reverse")}>
                                <div style={{ width: `${center.level * 24}px` }} />
                                {hasChildren ? (
                                  <button 
                                    onClick={() => toggleRow(center.id)}
                                    className="p-1 hover:bg-white/10 rounded-md transition-colors"
                                  >
                                    <ChevronRight className={cn(
                                      "w-4 h-4 text-slate-400 transition-transform",
                                      expandedRows[center.id] ? "rotate-90" : ""
                                    )} />
                                  </button>
                                ) : (
                                  <div className="w-6" />
                                )}
                                <Hash className="w-4 h-4 text-slate-500" />
                                <span className="font-mono font-black text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-xl text-xs border border-amber-500/20">
                                  {center.center_code}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className={cn("flex items-center space-x-4", isRtl && "space-x-reverse")}>
                                <div className={cn("p-2.5 rounded-xl shadow-sm border bg-amber-500/10 border-amber-500/20")}>
                                  <Building className="w-5 h-5 text-amber-500" />
                                </div>
                                <div className="flex flex-col">
                                  <span className={cn(
                                    "font-black text-white",
                                    center.center_type === 'main' ? "text-lg" : "text-sm"
                                  )}>
                                    {center.center_name}
                                  </span>
                                  {center.description && (
                                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-xs">
                                      {center.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <span className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                center.center_type === 'main' 
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                                  : "bg-slate-700/50 text-slate-300 border border-slate-600"
                              )}>
                                {center.center_type === 'main' ? t("main") : t("sub")}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  onClick={() => handleOpenModal(center)}
                                  className="p-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                  title={t("edit")}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(center.id)}
                                  className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                  title={t("delete")}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-32 text-center">
                          <div className="flex flex-col items-center space-y-6 text-slate-500">
                            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center">
                              <FileText className="w-12 h-12 opacity-20" />
                            </div>
                            <div className="space-y-2">
                              <p className="font-black text-2xl text-white">{t("noMatchingCenters")}</p>
                              <p className="text-sm font-medium">{t("noMatchingCentersDesc")}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            
            {/* Table Footer */}
              <div className="bg-[#0c1222]/80 px-8 py-5 border-t border-white/[0.06] flex items-center justify-between">
              <p className="text-sm text-slate-400 font-bold">
                {t("view")} <span className="text-white font-black px-1">{displayCenters.length}</span> {t("outOf")} <span className="text-white font-black px-1">{costCenters.length}</span> {t("centersCount")}
              </p>
            </div>
          </motion.div>
      </div>

      {/* Modal */}
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
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white flex items-center justify-between">
                <div className={cn("flex items-center space-x-4", isRtl && "space-x-reverse")}>
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    {editingCenter ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{editingCenter ? t("editCenter") : t("addNewCenterTitle")}</h3>
                    <p className="text-slate-300 text-xs">{t("fillRequiredData")}</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t("mainLevel")}</label>
                    <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, center_type: "main" })}
                        className={cn(
                          "flex-1 py-2 px-4 rounded-lg text-xs font-black transition-all",
                          formData.center_type === "main" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        {t("main")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, center_type: "sub" })}
                        className={cn(
                          "flex-1 py-2 px-4 rounded-lg text-xs font-black transition-all",
                          formData.center_type === "sub" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        {t("sub")}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t("parentCenter")}</label>
                    <div className="relative">
                      <Layers className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4", isRtl ? "right-4" : "left-4")} />
                          <select
                            value={formData.parent_id || ""}
                            onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })}
                            className={cn(
                              "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm font-bold appearance-none text-slate-900",
                              isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                            )}
                          >
                          <option value="">{t("noParent")}</option>
                          {costCenters
                            .filter(c => c.center_type === 'main' && c.id !== editingCenter?.id)
                            .map(c => (
                              <option key={c.id} value={c.id}>{c.center_code} - {c.center_name}</option>
                            ))
                          }
                        </select>

                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t("centerCode")}</label>
                    <div className="relative">
                      <Hash className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4", isRtl ? "right-4" : "left-4")} />
                        <input
                          type="text"
                          required
                          value={formData.center_code}
                          onChange={(e) => setFormData({ ...formData, center_code: e.target.value })}
                            placeholder={t("codePlaceholder")}
                            className={cn(
                              "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm font-bold text-slate-900",
                              isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                            )}
                          />
                        </div>
                      </div>
    
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t("centerName")}</label>
                        <div className="relative">
                          <Building className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4", isRtl ? "right-4" : "left-4")} />
                          <input
                            type="text"
                            required
                            value={formData.center_name}
                            onChange={(e) => setFormData({ ...formData, center_name: e.target.value })}
                            placeholder={t("namePlaceholder")}
                            className={cn(
                              "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm font-bold text-slate-900",
                              isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                            )}
                          />

                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t("description")}</label>
                  <div className="relative">
                    <FileText className={cn("absolute top-4 text-slate-400 w-4 h-4", isRtl ? "right-4" : "left-4")} />
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder={t("descriptionPlaceholder")}
                        rows={3}
                        className={cn(
                          "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm font-bold resize-none text-slate-900",
                          isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                        )}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center disabled:opacity-50 shadow-xl shadow-slate-200"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className={cn("w-5 h-5", isRtl ? "ml-2" : "mr-2")} />
                        <span>{editingCenter ? t("saveChanges") : t("addCenter")}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all"
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
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">{t("confirmDelete")}</h3>
              <p className="text-slate-500 mb-8 font-medium">{t("confirmDeleteDesc")}</p>
              <div className="flex gap-4">
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-red-100">
                  {t("yesDelete")}
                </button>
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all">
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
