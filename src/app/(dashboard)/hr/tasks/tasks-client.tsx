"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ListTodo, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X, 
  Save, 
  User,
  Calendar,
  LayoutDashboard,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { createTask, updateTaskStatus, deleteTask } from "@/lib/actions/hr";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TasksClientProps {
  initialTasks: any[];
  stats: any;
  employees: any[];
  companyId: number;
  userId: number;
  activeFilter: string;
  searchQuery: string;
}

export function TasksClient({ 
  initialTasks, 
  stats, 
  employees, 
  companyId, 
  userId,
  activeFilter,
  searchQuery
}: TasksClientProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState(searchQuery);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    due_date: format(new Date(), 'yyyy-MM-dd'),
    priority: "medium",
    status: "pending"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await createTask({ ...formData, company_id: companyId, created_by: userId });
      if (result.success) {
        toast.success("تم إضافة المهمة بنجاح");
        setIsModalOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    const result = await updateTaskStatus(id, status);
    if (result.success) {
      toast.success("تم تحديث حالة المهمة");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;
    const result = await deleteTask(id);
    if (result.success) {
      toast.success("تم حذف المهمة");
      setTasks(prev => prev.filter(t => t.id !== id));
    } else {
      toast.error(result.error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/hr/tasks?search=${search}&filter=${activeFilter}`);
  };

  const handleFilterChange = (filter: string) => {
    router.push(`/hr/tasks?search=${search}&filter=${filter}`);
  };

  return (
    <div className="flex flex-col h-full space-y-6 overflow-hidden max-w-[1800px] mx-auto px-4">
      
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
          <Link href="/hr" className="hover:text-[#9b59b6] transition-colors flex items-center gap-1">
            <LayoutDashboard size={14} />
            شؤون الموظفين
          </Link>
          <ArrowRight size={14} />
          <span className="text-[#9b59b6]">إدارة المهام</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#9b59b6] to-[#3498db] text-white px-6 py-3 rounded-xl text-sm font-black shadow-lg shadow-[#9b59b6]/20 transition-all"
        >
          <Plus size={18} />
          <span>إنشاء مهمة جديدة</span>
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <TaskStat label="الكل" value={stats.total} color="gray" onClick={() => handleFilterChange('all')} active={activeFilter === 'all'} />
        <TaskStat label="معلقة" value={stats.pending} color="orange" onClick={() => handleFilterChange('pending')} active={activeFilter === 'pending'} />
        <TaskStat label="قيد التنفيذ" value={stats.inProgress} color="blue" onClick={() => handleFilterChange('in_progress')} active={activeFilter === 'in_progress'} />
        <TaskStat label="مكتملة" value={stats.completed} color="green" onClick={() => handleFilterChange('completed')} active={activeFilter === 'completed'} />
        <TaskStat label="متأخرة" value={stats.overdue} color="red" onClick={() => handleFilterChange('overdue')} active={activeFilter === 'overdue'} />
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في عنوان المهمة، الوصف، أو اسم الموظف..."
              className="w-full h-12 pr-12 pl-4 rounded-xl bg-gray-50 border-2 border-gray-50 text-sm font-bold focus:border-[#9b59b6]/30 focus:bg-white outline-none transition-all"
            />
          </div>
          <button type="submit" className="h-12 px-8 rounded-xl bg-gray-900 text-white text-sm font-black hover:bg-gray-800 transition-all">
            تطبيق البحث
          </button>
        </form>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-auto scrollbar-hide py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-500 relative flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                task.priority === 'high' ? 'bg-red-50 text-red-600' :
                task.priority === 'medium' ? 'bg-orange-50 text-orange-600' :
                'bg-green-50 text-green-600'
              }`}>
                {task.priority === 'high' ? 'أولوية عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
              </span>
                <button 
                  onClick={() => handleDelete(task.id)}
                  className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center transition-opacity"
                >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex-1 space-y-3">
              <h3 className="text-lg font-black text-gray-900 leading-tight">{task.title}</h3>
              <p className="text-xs font-bold text-gray-500 leading-relaxed line-clamp-3">{task.description}</p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <User size={12} />
                  <span>{task.employee_name || 'غير معين'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span className={new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-red-500' : ''}>
                    {task.due_date}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select 
                  value={task.status}
                  onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                  className={`flex-1 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider outline-none border-2 transition-all ${
                    task.status === 'completed' ? 'bg-green-50 border-green-100 text-green-600' :
                    task.status === 'in_progress' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                    task.status === 'cancelled' ? 'bg-gray-50 border-gray-100 text-gray-400' :
                    'bg-orange-50 border-orange-100 text-orange-600'
                  }`}
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="in_progress">قيد التنفيذ</option>
                  <option value="completed">مكتملة</option>
                  <option value="cancelled">ملغاة</option>
                </select>
              </div>
            </div>
          </motion.div>
        ))}

          {tasks.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center gap-4 opacity-30">
              <ListTodo size={80} />
              <span className="text-2xl font-black text-center">لا توجد مهام حالياً</span>
            </div>
          )}
          </div>
        </div>

        {/* Add Task Modal */}
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
                  <h3 className="text-2xl font-black">إضافة مهمة جديدة</h3>
                  <p className="text-white/70 font-bold text-sm mt-1">توزيع المهام ومتابعة التنفيذ</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5 text-right">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider mr-1">عنوان المهمة</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-5 font-bold text-gray-700 focus:border-[#9b59b6]/30 focus:ring-4 focus:ring-[#9b59b6]/5 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider mr-1">الوصف</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-5 font-bold text-gray-700 focus:border-[#9b59b6]/30 focus:ring-4 focus:ring-[#9b59b6]/5 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider mr-1">الموظف المعني</label>
                    <select
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-5 font-bold text-gray-700 focus:border-[#9b59b6]/30 outline-none appearance-none"
                    >
                      <option value="">غير معين</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider mr-1">تاريخ الاستحقاق</label>
                    <input
                      type="date"
                      required
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-5 font-bold text-gray-700 focus:border-[#9b59b6]/30 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider mr-1">الأولوية</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-5 font-bold text-gray-700 focus:border-[#9b59b6]/30 outline-none appearance-none"
                    >
                      <option value="low">منخفضة</option>
                      <option value="medium">متوسطة</option>
                      <option value="high">عالية</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider mr-1">الحالة الأولية</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-5 font-bold text-gray-700 focus:border-[#9b59b6]/30 outline-none appearance-none"
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="in_progress">قيد التنفيذ</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#9b59b6] to-[#3498db] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#9b59b6]/20 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={20} />
                        <span>حفظ المهمة</span>
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

function TaskStat({ label, value, color, onClick, active }: any) {
  const colors: any = {
    gray: "text-gray-400 border-gray-100 bg-white",
    orange: "text-orange-500 border-orange-50 bg-orange-50/10",
    blue: "text-blue-500 border-blue-50 bg-blue-50/10",
    green: "text-green-500 border-green-50 bg-green-50/10",
    red: "text-red-500 border-red-50 bg-red-50/10"
  };

  const activeColors: any = {
    gray: "bg-gray-100 border-gray-200",
    orange: "bg-orange-100 border-orange-200",
    blue: "bg-blue-100 border-blue-200",
    green: "bg-green-100 border-green-200",
    red: "bg-red-100 border-red-200"
  };

  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-2xl border-2 transition-all text-center ${active ? activeColors[color] : colors[color]}`}
    >
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <div className="text-xl font-black">{value}</div>
    </button>
  );
}
