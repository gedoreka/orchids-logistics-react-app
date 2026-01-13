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
  LayoutGrid
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

  // Form State
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
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف مركز التكلفة هذا؟")) return;

    try {
      const result = await deleteCostCenter(id);
      if (result.success) {
        toast.success("تم حذف مركز التكلفة بنجاح");
        setCostCenters(prev => prev.filter(c => c.id !== id));
      } else {
        toast.error(result.error || "حدث خطأ أثناء الحذف");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#e67e22] to-[#d35400] flex items-center justify-center text-white shadow-lg shadow-[#e67e22]/20">
            <LayoutGrid size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">مراكز التكلفة</h1>
            <p className="text-gray-500 font-bold mt-1">توزيع وتحليل المصروفات والإيرادات</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#e67e22] to-[#f39c12] text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-[#e67e22]/20 transition-all"
        >
          <Plus size={20} />
          <span>إضافة مركز جديد</span>
        </motion.button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 relative group">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#e67e22] transition-colors" size={20} />
          <input
            type="text"
            placeholder="البحث عن مركز تكلفة بالاسم أو الرمز..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pr-14 pl-6 font-bold text-gray-700 focus:border-[#e67e22]/30 focus:ring-4 focus:ring-[#e67e22]/5 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Filter size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">الإجمالي</span>
              <span className="text-sm font-black text-gray-900">{costCenters.length} مركز</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <BarChart3 size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">النشطة</span>
              <span className="text-sm font-black text-gray-900">{costCenters.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Centers Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border-2 border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">العدد</th>
                <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">رمز المركز</th>
                <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">اسم المركز</th>
                <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredCenters.map((center, index) => (
                  <motion.tr
                    key={center.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-[#e67e22]/5 transition-all duration-300"
                  >
                    <td className="p-6 border-b border-gray-50">
                      <span className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 group-hover:bg-[#e67e22] group-hover:text-white transition-colors">
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-6 border-b border-gray-50">
                      <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 font-black text-xs group-hover:bg-[#e67e22]/10 group-hover:text-[#e67e22] transition-colors">
                        {center.center_code}
                      </div>
                    </td>
                    <td className="p-6 border-b border-gray-50">
                      <span className="text-gray-900 font-black">{center.center_name}</span>
                    </td>
                    <td className="p-6 border-b border-gray-50">
                      <div className="flex items-center justify-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: -10 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleOpenModal(center)}
                          className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Edit2 size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(center.id)}
                          className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredCenters.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <LayoutGrid size={60} />
                      <span className="text-xl font-black">لا توجد مراكز مطابقة</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#e67e22] to-[#d35400] p-8 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black">{editingCenter ? "تعديل مركز" : "إضافة مركز تكلفة جديد"}</h3>
                  <p className="text-white/70 font-bold text-sm mt-1">يرجى ملء جميع البيانات المطلوبة</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 text-right">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-500 mr-2 uppercase tracking-wider">رمز المركز</label>
                  <input
                    type="text"
                    required
                    value={formData.center_code}
                    onChange={(e) => setFormData({ ...formData, center_code: e.target.value })}
                    placeholder="مثال: CC-001"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-700 focus:border-[#e67e22]/30 focus:ring-4 focus:ring-[#e67e22]/5 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-500 mr-2 uppercase tracking-wider">اسم المركز</label>
                  <input
                    type="text"
                    required
                    value={formData.center_name}
                    onChange={(e) => setFormData({ ...formData, center_name: e.target.value })}
                    placeholder="مثال: فرع الرياض"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-700 focus:border-[#e67e22]/30 focus:ring-4 focus:ring-[#e67e22]/5 outline-none transition-all"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#e67e22] to-[#d35400] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#e67e22]/20 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={20} />
                        <span>{editingCenter ? "حفظ التعديلات" : "إضافة المركز"}</span>
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all"
                  >
                    إلغاء
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
