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
  ChevronRight,
  Filter,
  BarChart3,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { Account } from "@/lib/types";
import { createAccount, updateAccount, deleteAccount } from "@/lib/actions/accounting";
import { cn } from "@/lib/utils";

interface AccountsClientProps {
  initialAccounts: Account[];
  companyId: number;
}

export function AccountsClient({ initialAccounts, companyId }: AccountsClientProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    account_code: "",
    account_name: "",
    type: "مصروف",
  });

  const filteredAccounts = accounts.filter(acc => 
    acc.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.account_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        account_code: account.account_code,
        account_name: account.account_name,
        type: account.type,
      });
    } else {
      setEditingAccount(null);
      setFormData({
        account_code: "",
        account_name: "",
        type: "مصروف",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingAccount) {
        const result = await updateAccount(editingAccount.id, formData);
        if (result.success) {
          toast.success("تم تحديث الحساب بنجاح");
          setAccounts(prev => prev.map(a => a.id === editingAccount.id ? { ...a, ...formData } : a));
          setIsModalOpen(false);
        } else {
          toast.error(result.error || "حدث خطأ أثناء التحديث");
        }
      } else {
        const result = await createAccount({ ...formData, company_id: companyId });
        if (result.success) {
          toast.success("تم إضافة الحساب بنجاح");
          // Refresh list (in a real app you might want to re-fetch or use the returned ID)
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
    if (!confirm("هل أنت متأكد من حذف هذا الحساب؟")) return;

    try {
      const result = await deleteAccount(id);
      if (result.success) {
        toast.success("تم حذف الحساب بنجاح");
        setAccounts(prev => prev.filter(a => a.id !== id));
      } else {
        toast.error(result.error || "حدث خطأ أثناء الحذف");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#3498db] to-[#764ba2] flex items-center justify-center text-white shadow-lg shadow-[#3498db]/20">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">مركز الحسابات</h1>
            <p className="text-gray-500 font-bold mt-1">إدارة شجرة الحسابات والتدفقات المالية</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#3498db] to-[#2ecc71] text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-[#3498db]/20 transition-all"
        >
          <Plus size={20} />
          <span>إضافة حساب جديد</span>
        </motion.button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 relative group">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3498db] transition-colors" size={20} />
          <input
            type="text"
            placeholder="البحث عن حساب بالاسم أو الرمز..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pr-14 pl-6 font-bold text-gray-700 focus:border-[#3498db]/30 focus:ring-4 focus:ring-[#3498db]/5 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Filter size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">الإجمالي</span>
              <span className="text-sm font-black text-gray-900">{accounts.length} حساب</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <BarChart3 size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">النشطة</span>
              <span className="text-sm font-black text-gray-900">{accounts.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="flex-1 bg-white/80 backdrop-blur-md rounded-[2.5rem] border-2 border-gray-100 shadow-xl overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-right border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur-sm">
              <tr className="bg-gray-50/50">
                <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">العدد</th>
                <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">رمز الحساب</th>
                <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">اسم الحساب</th>
                <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">النوع</th>
                <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredAccounts.map((account, index) => (
                  <motion.tr
                    key={account.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-[#3498db]/5 transition-all duration-300"
                  >
                    <td className="p-6 border-b border-gray-50">
                      <span className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 group-hover:bg-[#3498db] group-hover:text-white transition-colors">
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-6 border-b border-gray-50">
                      <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 font-black text-xs group-hover:bg-[#3498db]/10 group-hover:text-[#3498db] transition-colors">
                        {account.account_code}
                      </div>
                    </td>
                    <td className="p-6 border-b border-gray-50">
                      <span className="text-gray-900 font-black">{account.account_name}</span>
                    </td>
                    <td className="p-6 border-b border-gray-50">
                      <span className={cn(
                        "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black shadow-sm",
                        account.type === "دخل" 
                          ? "bg-green-100 text-green-700 border border-green-200" 
                          : "bg-red-100 text-red-700 border border-red-200"
                      )}>
                        {account.type}
                      </span>
                    </td>
                    <td className="p-6 border-b border-gray-50">
                      <div className="flex items-center justify-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: -10 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleOpenModal(account)}
                          className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Edit2 size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(account.id)}
                          className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <BookOpen size={60} />
                      <span className="text-xl font-black">لا توجد حسابات مطابقة</span>
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
              <div className="bg-gradient-to-r from-[#3498db] to-[#764ba2] p-8 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black">{editingAccount ? "تعديل حساب" : "إضافة حساب جديد"}</h3>
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
                  <label className="text-sm font-black text-gray-500 mr-2 uppercase tracking-wider">رمز الحساب</label>
                  <input
                    type="text"
                    required
                    value={formData.account_code}
                    onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
                    placeholder="مثال: 4001"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-700 focus:border-[#3498db]/30 focus:ring-4 focus:ring-[#3498db]/5 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-500 mr-2 uppercase tracking-wider">اسم الحساب</label>
                  <input
                    type="text"
                    required
                    value={formData.account_name}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                    placeholder="مثال: مبيعات الخدمات"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-700 focus:border-[#3498db]/30 focus:ring-4 focus:ring-[#3498db]/5 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-500 mr-2 uppercase tracking-wider">نوع الحساب</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-700 focus:border-[#3498db]/30 focus:ring-4 focus:ring-[#3498db]/5 outline-none transition-all appearance-none"
                  >
                    <option value="مصروف">مصروف</option>
                    <option value="دخل">دخل</option>
                    <option value="اصل">اصل</option>
                    <option value="التزام">التزام</option>
                    <option value="حقوق ملكية">حقوق ملكية</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#3498db] to-[#764ba2] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#3498db]/20 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={20} />
                        <span>{editingAccount ? "حفظ التعديلات" : "إضافة الحساب"}</span>
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
