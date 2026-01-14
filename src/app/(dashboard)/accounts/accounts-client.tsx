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
  BookOpen,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Building2,
  Wallet,
  PiggyBank,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Hash,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { Account } from "@/lib/types";
import { createAccount, updateAccount, deleteAccount } from "@/lib/actions/accounting";
import { cn } from "@/lib/utils";

interface AccountsClientProps {
  initialAccounts: Account[];
  companyId: number;
}

const accountTypeConfig: Record<string, { color: string; bgColor: string; borderColor: string; icon: any; label: string }> = {
  "مصروف": { color: "text-rose-700", bgColor: "bg-rose-50", borderColor: "border-rose-200", icon: TrendingDown, label: "مصروف" },
  "دخل": { color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", icon: TrendingUp, label: "دخل" },
  "اصل": { color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", icon: Building2, label: "أصل" },
  "التزام": { color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", icon: Receipt, label: "التزام" },
  "حقوق ملكية": { color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200", icon: PiggyBank, label: "حقوق ملكية" },
};

export function AccountsClient({ initialAccounts, companyId }: AccountsClientProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    account_code: "",
    account_name: "",
    type: "مصروف",
  });

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.account_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || acc.type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: accounts.length,
    expenses: accounts.filter(a => a.type === "مصروف").length,
    income: accounts.filter(a => a.type === "دخل").length,
  };

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
      const result = await deleteAccount(id);
      if (result.success) {
        toast.success("تم حذف الحساب بنجاح");
        setAccounts(prev => prev.filter(a => a.id !== id));
        setDeleteConfirm(null);
      } else {
        toast.error(result.error || "حدث خطأ أثناء الحذف");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    }
  };

  return (
    <div className="w-full max-w-[98%] mx-auto px-6 py-6 space-y-6 rtl" dir="rtl">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-xl border border-white/10"
      >
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
            <BookOpen className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">مركز الحسابات</h1>
          <p className="text-slate-300 max-w-2xl">
            إدارة شجرة الحسابات والتصنيفات المالية لتنظيم العمليات المحاسبية
          </p>
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg flex items-center space-x-4 space-x-reverse group hover:border-blue-200 transition-colors">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold">إجمالي الحسابات</p>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg flex items-center space-x-4 space-x-reverse group hover:border-rose-200 transition-colors">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600 group-hover:scale-110 transition-transform">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold">حسابات المصروفات</p>
            <p className="text-2xl font-black text-slate-900">{stats.expenses}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg flex items-center space-x-4 space-x-reverse group hover:border-emerald-200 transition-colors">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold">حسابات الدخل</p>
            <p className="text-2xl font-black text-slate-900">{stats.income}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg flex items-center space-x-4 space-x-reverse group hover:border-purple-200 transition-colors">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold">أخرى</p>
            <p className="text-2xl font-black text-slate-900">{stats.total - stats.expenses - stats.income}</p>
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
            placeholder="البحث عن حساب بالاسم أو الرمز..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl py-3 pr-10 pl-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none text-sm font-bold"
            >
              <option value="all">جميع الأنواع</option>
              <option value="مصروف">المصروفات</option>
              <option value="دخل">الدخل</option>
              <option value="اصل">الأصول</option>
              <option value="التزام">الالتزامات</option>
              <option value="حقوق ملكية">حقوق الملكية</option>
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 space-x-reverse shadow-lg shadow-blue-200 text-sm whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة حساب</span>
          </button>
        </div>
      </motion.div>

      {/* Accounts Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">رمز الحساب</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">اسم الحساب</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">النوع</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account, index) => {
                    const typeConfig = accountTypeConfig[account.type] || accountTypeConfig["مصروف"];
                    const TypeIcon = typeConfig.icon;
                    return (
                      <motion.tr
                        key={account.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Hash className="w-4 h-4 text-slate-300" />
                            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm">
                              {account.account_code}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className={cn("p-2 rounded-lg", typeConfig.bgColor)}>
                              <TypeIcon className={cn("w-4 h-4", typeConfig.color)} />
                            </div>
                            <span className="font-bold text-slate-900">{account.account_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black border",
                            typeConfig.bgColor,
                            typeConfig.color,
                            typeConfig.borderColor
                          )}>
                            {typeConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenModal(account)}
                              className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                              title="تعديل"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(account.id)}
                              className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                              title="حذف"
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
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center space-y-4 text-slate-400">
                        <FileText className="w-16 h-16 opacity-30" />
                        <p className="font-bold text-lg">لا توجد حسابات مطابقة</p>
                        <p className="text-sm">جرب تغيير معايير البحث أو الفلتر</p>
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
            عرض <span className="text-slate-900">{filteredAccounts.length}</span> من أصل <span className="text-slate-900">{accounts.length}</span> حساب
          </p>
        </div>
      </motion.div>

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
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white flex items-center justify-between">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    {editingAccount ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{editingAccount ? "تعديل حساب" : "إضافة حساب جديد"}</h3>
                    <p className="text-slate-300 text-xs">يرجى ملء جميع البيانات المطلوبة</p>
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
                  <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">رمز الحساب</label>
                  <div className="relative">
                    <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={formData.account_code}
                      onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
                      placeholder="مثال: 4001"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-11 pl-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">اسم الحساب</label>
                  <div className="relative">
                    <FileText className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={formData.account_name}
                      onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                      placeholder="مثال: مبيعات الخدمات"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-11 pl-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">نوع الحساب</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(accountTypeConfig).map(([type, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, type })}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                            formData.type === type
                              ? cn(config.bgColor, config.borderColor, config.color)
                              : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-bold">{config.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50 shadow-lg shadow-blue-200"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{editingAccount ? "حفظ التعديلات" : "إضافة الحساب"}</span>
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
              <p className="text-slate-500 mb-8">هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء.</p>
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
