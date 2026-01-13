"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Users, 
  Trash2, 
  X, 
  Save, 
  ChevronRight,
  Package,
  Target,
  Trophy,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { createEmployeePackage, deleteEmployeePackage } from "@/lib/actions/hr";
import Link from "next/link";

interface HRClientProps {
  initialPackages: any[];
  companyId: number;
}

export function HRClient({ initialPackages, companyId }: HRClientProps) {
  const [packages, setPackages] = useState(initialPackages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    group_name: "",
    work_type: "target",
    monthly_target: 0,
    bonus_after_target: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createEmployeePackage({ ...formData, company_id: companyId });
      if (result.success) {
        toast.success("تم إنشاء الباقة بنجاح");
        window.location.reload();
      } else {
        toast.error(result.error || "حدث خطأ أثناء الإضافة");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الباقة؟")) return;

    try {
      const result = await deleteEmployeePackage(id);
      if (result.success) {
        toast.success("تم حذف الباقة بنجاح");
        setPackages(prev => prev.filter(p => p.id !== id));
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
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#9b59b6] to-[#8e44ad] flex items-center justify-center text-white shadow-lg shadow-[#9b59b6]/20">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">الموارد البشرية</h1>
            <p className="text-gray-500 font-bold mt-1">إدارة الموظفين، الباقات، والعمولات</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#9b59b6] to-[#3498db] text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-[#9b59b6]/20 transition-all"
        >
          <Plus size={20} />
          <span>إنشاء باقة موظفين</span>
        </motion.button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white rounded-[2rem] border-2 border-gray-100 p-8 shadow-sm hover:shadow-xl hover:border-[#9b59b6]/30 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDelete(pkg.id)}
                className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                <Trash2 size={18} />
              </motion.button>
            </div>

            <div className="space-y-6">
              <div className="h-16 w-16 rounded-[1.25rem] bg-[#9b59b6]/10 flex items-center justify-center text-[#9b59b6]">
                <Package size={32} />
              </div>

              <div>
                <h3 className="text-xl font-black text-gray-900 mb-1">{pkg.group_name}</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                  {pkg.work_type === 'target' ? 'نظام التارجت' : 'نظام الشرائح'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Target size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">التارجت</span>
                  </div>
                  <div className="text-lg font-black text-gray-900">{pkg.monthly_target}</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Trophy size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">البونص</span>
                  </div>
                  <div className="text-lg font-black text-gray-900">{pkg.bonus_after_target}</div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Link 
                  href={`/hr/packages/${pkg.id}/add-employees`}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#9b59b6] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#9b59b6]/20 hover:bg-[#8e44ad] transition-all"
                >
                  <UserPlus size={18} />
                  <span>إضافة موظفين</span>
                </Link>
                <Link 
                  href={`/hr/packages/${pkg.id}`}
                  className="h-[56px] w-[56px] rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all"
                >
                  <ChevronRight size={24} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}

        {packages.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center gap-4 opacity-30">
            <Users size={80} />
            <span className="text-2xl font-black text-center">لا توجد باقات منشأة بعد</span>
          </div>
        )}
      </div>

      {/* Add Package Modal */}
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
              <div className="bg-gradient-to-r from-[#9b59b6] to-[#8e44ad] p-8 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black">إنشاء باقة جديدة</h3>
                  <p className="text-white/70 font-bold text-sm mt-1">تحديد نظام العمل والعمولات للموظفين</p>
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
                  <label className="text-sm font-black text-gray-500 mr-2 uppercase tracking-wider">اسم الباقة (المجموعة)</label>
                  <input
                    type="text"
                    required
                    value={formData.group_name}
                    onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                    placeholder="مثال: مناديب الرياض - نظام التارجت"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-700 focus:border-[#9b59b6]/30 focus:ring-4 focus:ring-[#9b59b6]/5 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-500 mr-2 uppercase tracking-wider">نوع العمل</label>
                  <select
                    value={formData.work_type}
                    onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-700 focus:border-[#9b59b6]/30 focus:ring-4 focus:ring-[#9b59b6]/5 outline-none transition-all appearance-none"
                  >
                    <option value="target">نظام التارجت (Target)</option>
                    <option value="tiered">نظام الشرائح (Tiered)</option>
                    <option value="commission">نظام العمولة (Commission)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-500 mr-2 uppercase tracking-wider">التارجت الشهري</label>
                    <input
                      type="number"
                      required
                      value={formData.monthly_target}
                      onChange={(e) => setFormData({ ...formData, monthly_target: parseInt(e.target.value) })}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-700 focus:border-[#9b59b6]/30 focus:ring-4 focus:ring-[#9b59b6]/5 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-500 mr-2 uppercase tracking-wider">البونص الإضافي</label>
                    <input
                      type="number"
                      required
                      value={formData.bonus_after_target}
                      onChange={(e) => setFormData({ ...formData, bonus_after_target: parseFloat(e.target.value) })}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-700 focus:border-[#9b59b6]/30 focus:ring-4 focus:ring-[#9b59b6]/5 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#9b59b6] to-[#8e44ad] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#9b59b6]/20 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={20} />
                        <span>إنشاء الباقة</span>
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
