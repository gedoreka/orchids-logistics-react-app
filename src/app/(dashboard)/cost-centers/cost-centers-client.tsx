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

interface CostCentersClientProps {
  initialCostCenters: CostCenter[];
  companyId: number;
}

export function CostCentersClient({ initialCostCenters, companyId }: CostCentersClientProps) {
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
          toast.success("تم تحديث مركز التكلفة بنجاح");
          setCostCenters(prev => prev.map(c => c.id === editingCenter.id ? { ...c, ...formData } : c));
          setIsModalOpen(false);
        } else {
          toast.error(result.error || "حدث خطأ أثناء التحديث");
        }
      } else {
        const result = await createCostCenter({ ...formData, company_id: companyId });
        if (result.success) {
          toast.success("تم إضافة مركز التكلفة بنجاح");
          window.location.reload(); 
        } else {
          toast.error(result.error || "حدث خطأ أثناء الإضافة");
        }
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteCostCenter(id);
      if (result.success) {
        toast.success("تم حذف مركز التكلفة بنجاح");
        setCostCenters(prev => prev.filter(c => c.id !== id));
        setDeleteConfirm(null);
      } else {
        toast.error(result.error || "حدث خطأ أثناء الحذف");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    }
  };

  return (
    <div className="w-full max-w-[98%] mx-auto px-6 py-6 rtl" dir="rtl">
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
            <h1 className="text-2xl font-bold tracking-tight">مراكز التكلفة</h1>
            <p className="text-amber-100 max-w-2xl">
              توزيع وتحليل المصروفات والإيرادات حسب الأقسام والفروع
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
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg flex items-center space-x-4 space-x-reverse group hover:border-amber-200 transition-colors">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold">إجمالي المراكز</p>
              <p className="text-2xl font-black text-slate-900">{costCenters.length}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg flex items-center space-x-4 space-x-reverse group hover:border-emerald-200 transition-colors">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold">المراكز النشطة</p>
              <p className="text-2xl font-black text-slate-900">{costCenters.length}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg flex items-center space-x-4 space-x-reverse group hover:border-blue-200 transition-colors">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold">الفروع</p>
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
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث عن مركز تكلفة بالاسم أو الرمز..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 space-x-reverse shadow-lg shadow-amber-200 text-sm whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة مركز جديد</span>
          </button>
        </motion.div>

        {/* Cost Centers Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">رمز المركز</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">اسم المركز</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">الإجراءات</th>
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
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Hash className="w-4 h-4 text-slate-300" />
                            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm">
                              {center.center_code}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3 space-x-reverse">
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
                              title="تعديل"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(center.id)}
                              className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                              title="حذف"
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
                          <p className="font-bold text-lg">لا توجد مراكز تكلفة مطابقة</p>
                          <p className="text-sm">جرب تغيير معايير البحث</p>
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
              عرض <span className="text-slate-900">{filteredCenters.length}</span> من أصل <span className="text-slate-900">{costCenters.length}</span> مركز
            </p>
          </div>
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" dir="rtl">
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
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    {editingCenter ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{editingCenter ? "تعديل مركز تكلفة" : "إضافة مركز تكلفة جديد"}</h3>
                    <p className="text-amber-100 text-xs">يرجى ملء جميع البيانات المطلوبة</p>
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
                  <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">رمز المركز</label>
                  <div className="relative">
                    <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={formData.center_code}
                      onChange={(e) => setFormData({ ...formData, center_code: e.target.value })}
                      placeholder="مثال: CC-001"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-11 pl-4 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">اسم المركز</label>
                  <div className="relative">
                    <Building className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={formData.center_name}
                      onChange={(e) => setFormData({ ...formData, center_name: e.target.value })}
                      placeholder="مثال: فرع الرياض"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-11 pl-4 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50 shadow-lg shadow-amber-200"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{editingCenter ? "حفظ التعديلات" : "إضافة المركز"}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    إلغاء
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
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" dir="rtl">
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
              <h3 className="text-xl font-black text-slate-900 mb-2">تأكيد الحذف</h3>
              <p className="text-slate-500 mb-8">هل أنت متأكد من حذف مركز التكلفة هذا؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-all"
                >
                  نعم، احذف
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
