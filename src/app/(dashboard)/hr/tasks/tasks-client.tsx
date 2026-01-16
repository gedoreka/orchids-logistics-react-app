"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ListTodo, Plus, Search, Trash2, CheckCircle2, Clock, AlertTriangle, 
  X, Save, User, Calendar, LayoutDashboard, ArrowRight, Eye, Edit2,
  Send, AtSign, Loader2, Printer, Bell, Target, Users, Filter,
  ChevronDown, Star, Sparkles, Zap, Timer, Flag, Mail, Building2
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { createTask, updateTaskStatus, deleteTask } from "@/lib/actions/hr";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Task {
  id: number;
  title: string;
  description: string;
  assigned_to: number | null;
  employee_name: string | null;
  iqama_number: string | null;
  due_date: string;
  priority: string;
  status: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
}

interface Employee {
  id: number;
  name: string;
  user_code: string;
  iqama_number: string;
  email?: string;
  job_title?: string;
  personal_photo?: string;
}

interface TasksClientProps {
  initialTasks: Task[];
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  employees: Employee[];
  companyId: number;
  userId: number;
  activeFilter: string;
  searchQuery: string;
}

const priorityConfig = {
  high: { label: "عالية", color: "from-red-500 to-rose-600", bg: "bg-red-500/10", text: "text-red-500", icon: Zap },
  medium: { label: "متوسطة", color: "from-amber-500 to-orange-600", bg: "bg-amber-500/10", text: "text-amber-500", icon: Target },
  low: { label: "منخفضة", color: "from-emerald-500 to-green-600", bg: "bg-emerald-500/10", text: "text-emerald-500", icon: Flag }
};

const statusConfig = {
  pending: { label: "قيد الانتظار", color: "from-orange-500 to-amber-600", bg: "bg-orange-500/10", text: "text-orange-500", icon: Clock },
  in_progress: { label: "قيد التنفيذ", color: "from-blue-500 to-indigo-600", bg: "bg-blue-500/10", text: "text-blue-500", icon: Timer },
  completed: { label: "مكتملة", color: "from-emerald-500 to-green-600", bg: "bg-emerald-500/10", text: "text-emerald-500", icon: CheckCircle2 },
  cancelled: { label: "ملغاة", color: "from-slate-500 to-gray-600", bg: "bg-slate-500/10", text: "text-slate-500", icon: X }
};

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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTask, setEmailTask] = useState<Task | null>(null);
  const [customEmail, setCustomEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    due_date: format(new Date(), 'yyyy-MM-dd'),
    priority: "medium",
    status: "pending"
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      assigned_to: "",
      due_date: format(new Date(), 'yyyy-MM-dd'),
      priority: "medium",
      status: "pending"
    });
    setIsEditMode(false);
    setSelectedTask(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await createTask({ ...formData, company_id: companyId, created_by: userId });
      if (result.success) {
        toast.success("تم إضافة المهمة بنجاح");
        setIsModalOpen(false);
        resetForm();
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
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
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

  const openEmailModal = (task: Task) => {
    setEmailTask(task);
    setCustomEmail("");
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!emailTask || !customEmail) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customEmail)) {
      toast.error("البريد الإلكتروني غير صحيح");
      return;
    }

    setIsSendingEmail(true);
    
    try {
      const res = await fetch("/api/tasks/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: customEmail,
          task: emailTask
        })
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(`تم إرسال المهمة بنجاح إلى ${customEmail}`);
        setShowEmailModal(false);
        setEmailTask(null);
        setCustomEmail("");
      } else {
        toast.error(data.error || "فشل إرسال البريد");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("حدث خطأ أثناء إرسال البريد");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handlePrint = (task: Task) => {
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>مهمة - ${task.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Tajawal', sans-serif; direction: rtl; background: #f8fafc; padding: 40px; }
          .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 40px; text-align: center; color: white; }
          .header h1 { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
          .header p { opacity: 0.9; }
          .content { padding: 40px; }
          .task-title { font-size: 24px; font-weight: 800; color: #1e293b; margin-bottom: 16px; text-align: center; }
          .task-desc { color: #64748b; line-height: 1.8; margin-bottom: 32px; text-align: center; padding: 20px; background: #f8fafc; border-radius: 16px; }
          .details { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .detail-item { padding: 16px 20px; background: #f8fafc; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
          .detail-label { color: #64748b; font-weight: 600; }
          .detail-value { color: #1e293b; font-weight: 700; }
          .priority-high { color: #ef4444; }
          .priority-medium { color: #f59e0b; }
          .priority-low { color: #22c55e; }
          .footer { padding: 24px 40px; background: #0f172a; text-align: center; color: #64748b; font-size: 12px; }
          @media print { body { padding: 0; } .container { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 تفاصيل المهمة</h1>
            <p>نظام إدارة المهام</p>
          </div>
          <div class="content">
            <h2 class="task-title">${task.title}</h2>
            ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
            <div class="details">
              <div class="detail-item">
                <span class="detail-label">🎯 الأولوية</span>
                <span class="detail-value priority-${task.priority}">${priorityConfig[task.priority as keyof typeof priorityConfig]?.label || task.priority}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">📊 الحالة</span>
                <span class="detail-value">${statusConfig[task.status as keyof typeof statusConfig]?.label || task.status}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">📅 تاريخ الاستحقاق</span>
                <span class="detail-value">${task.due_date}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">👤 الموظف المعني</span>
                <span class="detail-value">${task.employee_name || 'غير معين'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">✍️ أنشئت بواسطة</span>
                <span class="detail-value">${task.created_by_name || 'غير معروف'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">📆 تاريخ الإنشاء</span>
                <span class="detail-value">${task.created_at ? format(new Date(task.created_at), 'yyyy-MM-dd', { locale: ar }) : '-'}</span>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>تم الطباعة من نظام إدارة اللوجستيات © ${new Date().getFullYear()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.iqama_number?.includes(employeeSearch) ||
    emp.user_code?.includes(employeeSearch)
  );

  const selectedEmployee = employees.find(e => e.id === Number(formData.assigned_to));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-2">
              <Link href="/hr" className="hover:text-violet-400 transition-colors flex items-center gap-1">
                <LayoutDashboard size={14} />
                شؤون الموظفين
              </Link>
              <ArrowRight size={14} />
              <span className="text-violet-400">إدارة المهام</span>
            </div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl shadow-lg shadow-violet-500/30">
                <ListTodo className="w-8 h-8 text-white" />
              </div>
              إدارة المهام
            </h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-8 py-4 rounded-2xl text-sm font-black shadow-lg shadow-violet-500/30 transition-all hover:shadow-xl hover:shadow-violet-500/40"
          >
            <Plus size={20} />
            <span>إنشاء مهمة جديدة</span>
            <Sparkles size={16} className="opacity-70" />
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard 
            label="إجمالي المهام" 
            value={stats.total} 
            icon={ListTodo}
            gradient="from-slate-500 to-slate-600"
            onClick={() => handleFilterChange('all')} 
            active={activeFilter === 'all'} 
          />
          <StatCard 
            label="قيد الانتظار" 
            value={stats.pending} 
            icon={Clock}
            gradient="from-orange-500 to-amber-600"
            onClick={() => handleFilterChange('pending')} 
            active={activeFilter === 'pending'} 
          />
          <StatCard 
            label="قيد التنفيذ" 
            value={stats.inProgress} 
            icon={Timer}
            gradient="from-blue-500 to-indigo-600"
            onClick={() => handleFilterChange('in_progress')} 
            active={activeFilter === 'in_progress'} 
          />
          <StatCard 
            label="مكتملة" 
            value={stats.completed} 
            icon={CheckCircle2}
            gradient="from-emerald-500 to-green-600"
            onClick={() => handleFilterChange('completed')} 
            active={activeFilter === 'completed'} 
          />
          <StatCard 
            label="متأخرة" 
            value={stats.overdue} 
            icon={AlertTriangle}
            gradient="from-red-500 to-rose-600"
            onClick={() => handleFilterChange('overdue')} 
            active={activeFilter === 'overdue'} 
          />
        </div>

        {/* Search Bar */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث في عنوان المهمة، الوصف، أو اسم الموظف..."
                className="w-full h-14 pr-12 pl-4 rounded-2xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 text-sm font-bold focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all"
              />
            </div>
            <button type="submit" className="h-14 px-8 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-black hover:shadow-lg hover:shadow-violet-500/30 transition-all flex items-center gap-2">
              <Filter size={18} />
              <span>بحث</span>
            </button>
          </form>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard 
                key={task.id}
                task={task}
                onStatusChange={handleStatusUpdate}
                onDelete={handleDelete}
                onEmail={openEmailModal}
                onPrint={handlePrint}
                onPreview={() => { setSelectedTask(task); setShowPreview(true); }}
              />
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full py-20 flex flex-col items-center gap-6"
            >
              <div className="p-6 bg-slate-800/50 rounded-3xl">
                <ListTodo size={80} className="text-slate-600" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-400">لا توجد مهام</p>
                <p className="text-slate-500 mt-2">قم بإنشاء مهمة جديدة للبدء</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Add/Edit Task Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-white/10"
              >
                <div className="bg-gradient-to-r from-violet-500 to-indigo-600 p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-2xl">
                        <ListTodo size={28} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black">{isEditMode ? 'تعديل المهمة' : 'إنشاء مهمة جديدة'}</h3>
                        <p className="text-white/70 font-bold text-sm mt-1">توزيع المهام ومتابعة التنفيذ</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setIsModalOpen(false); resetForm(); }}
                      className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1">عنوان المهمة</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-2xl py-4 px-5 font-bold text-white placeholder-slate-400 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all"
                      placeholder="أدخل عنوان المهمة..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1">الوصف</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-2xl py-4 px-5 font-bold text-white placeholder-slate-400 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all resize-none"
                      placeholder="أدخل وصف المهمة..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1">الموظف المعني</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmployeeSelector(true)}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-2xl py-4 px-5 font-bold text-right flex items-center justify-between hover:border-violet-500/50 transition-all"
                      >
                        {selectedEmployee ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                              {selectedEmployee.name.charAt(0)}
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold">{selectedEmployee.name}</p>
                              <p className="text-slate-400 text-xs">{selectedEmployee.iqama_number || selectedEmployee.user_code}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">اختر الموظف...</span>
                        )}
                        <ChevronDown className="text-slate-400" size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1">تاريخ الاستحقاق</label>
                      <input
                        type="date"
                        required
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-2xl py-4 px-5 font-bold text-white focus:border-violet-500/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1">الأولوية</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-2xl py-4 px-5 font-bold text-white focus:border-violet-500/50 outline-none appearance-none cursor-pointer"
                      >
                        <option value="low">منخفضة</option>
                        <option value="medium">متوسطة</option>
                        <option value="high">عالية</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-violet-500/30 disabled:opacity-50 transition-all"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
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
                      onClick={() => { setIsModalOpen(false); resetForm(); }}
                      className="px-8 bg-slate-700 text-slate-300 py-4 rounded-2xl font-black hover:bg-slate-600 transition-all"
                    >
                      إلغاء
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Employee Selector Modal */}
        <AnimatePresence>
          {showEmployeeSelector && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setShowEmployeeSelector(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-xl bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-white/10 max-h-[80vh] flex flex-col"
              >
                <div className="bg-gradient-to-r from-violet-500 to-indigo-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Users size={24} />
                      </div>
                      <h3 className="text-xl font-black">اختيار الموظف</h3>
                    </div>
                    <button
                      onClick={() => setShowEmployeeSelector(false)}
                      className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="mt-4 relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                    <input
                      type="text"
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      placeholder="ابحث بالاسم أو رقم الإقامة..."
                      className="w-full h-12 pr-12 pl-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm font-bold focus:border-white/40 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-2">
                  <button
                    onClick={() => {
                      setFormData({ ...formData, assigned_to: "" });
                      setShowEmployeeSelector(false);
                    }}
                    className="w-full p-4 rounded-2xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-violet-500/50 transition-all flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-600 flex items-center justify-center">
                      <X className="text-slate-400" size={20} />
                    </div>
                    <span className="text-slate-300 font-bold">غير معين</span>
                  </button>

                  {filteredEmployees.map((emp) => (
                    <motion.button
                      key={emp.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        setFormData({ ...formData, assigned_to: String(emp.id) });
                        setShowEmployeeSelector(false);
                      }}
                      className={`w-full p-4 rounded-2xl transition-all flex items-center gap-4 ${
                        formData.assigned_to === String(emp.id)
                          ? "bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border-2 border-violet-500/50"
                          : "bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-violet-500/50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {emp.personal_photo ? (
                          <img src={emp.personal_photo} alt={emp.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          emp.name.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-white font-bold">{emp.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {emp.iqama_number && (
                            <span className="text-slate-400 text-xs">{emp.iqama_number}</span>
                          )}
                          {emp.job_title && (
                            <span className="text-violet-400 text-xs bg-violet-500/10 px-2 py-0.5 rounded-lg">{emp.job_title}</span>
                          )}
                        </div>
                      </div>
                      {formData.assigned_to === String(emp.id) && (
                        <div className="p-2 bg-violet-500 rounded-lg">
                          <CheckCircle2 className="text-white" size={16} />
                        </div>
                      )}
                    </motion.button>
                  ))}

                  {filteredEmployees.length === 0 && (
                    <div className="py-12 text-center">
                      <Users className="mx-auto text-slate-600 mb-4" size={48} />
                      <p className="text-slate-400 font-bold">لا يوجد موظفين مطابقين</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task Preview Modal */}
        <AnimatePresence>
          {showPreview && selectedTask && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setShowPreview(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-white/10"
              >
                <div className={`bg-gradient-to-r ${priorityConfig[selectedTask.priority as keyof typeof priorityConfig]?.color || 'from-violet-500 to-indigo-600'} p-8 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-2xl">
                        <Eye size={28} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black">تفاصيل المهمة</h3>
                        <p className="text-white/70 font-bold text-sm mt-1">معاينة كاملة للمهمة</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-black text-white mb-2">{selectedTask.title}</h2>
                    {selectedTask.description && (
                      <p className="text-slate-400 leading-relaxed">{selectedTask.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem 
                      icon={Target} 
                      label="الأولوية" 
                      value={priorityConfig[selectedTask.priority as keyof typeof priorityConfig]?.label || selectedTask.priority}
                      color={priorityConfig[selectedTask.priority as keyof typeof priorityConfig]?.text}
                    />
                    <DetailItem 
                      icon={statusConfig[selectedTask.status as keyof typeof statusConfig]?.icon || Clock} 
                      label="الحالة" 
                      value={statusConfig[selectedTask.status as keyof typeof statusConfig]?.label || selectedTask.status}
                      color={statusConfig[selectedTask.status as keyof typeof statusConfig]?.text}
                    />
                    <DetailItem icon={Calendar} label="تاريخ الاستحقاق" value={selectedTask.due_date} />
                    <DetailItem icon={User} label="الموظف المعني" value={selectedTask.employee_name || 'غير معين'} />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handlePrint(selectedTask)}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-700 text-white py-3 rounded-xl font-bold hover:bg-slate-600 transition-all"
                    >
                      <Printer size={18} />
                      <span>طباعة</span>
                    </button>
                    <button
                      onClick={() => { setShowPreview(false); openEmailModal(selectedTask); }}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      <Send size={18} />
                      <span>إرسال بالبريد</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Modal */}
        <AnimatePresence>
          {showEmailModal && emailTask && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
              onClick={(e) => e.target === e.currentTarget && !isSendingEmail && setShowEmailModal(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }} 
                className="bg-slate-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-white/10"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                      <Send className="w-6 h-6 text-emerald-400" />
                    </div>
                    إرسال المهمة بالبريد
                  </h2>
                  <button 
                    onClick={() => !isSendingEmail && setShowEmailModal(false)} 
                    className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
                    disabled={isSendingEmail}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="bg-slate-700/30 rounded-2xl p-4 mb-6 border border-slate-600/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-500/20 rounded-lg">
                      <ListTodo className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold">{emailTask.title}</p>
                      <p className="text-slate-400 text-sm">{priorityConfig[emailTask.priority as keyof typeof priorityConfig]?.label} - {emailTask.due_date}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-2xl p-5 border border-slate-600/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <AtSign className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-white font-bold">إدخال البريد الإلكتروني</p>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      placeholder="أدخل البريد الإلكتروني..."
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      disabled={isSendingEmail}
                      className="flex-1 bg-slate-800 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      dir="ltr"
                    />
                    <button
                      onClick={handleSendEmail}
                      disabled={isSendingEmail || !customEmail}
                      className={`px-6 rounded-xl font-bold flex items-center gap-2 transition-all ${
                        customEmail && !isSendingEmail
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg text-white"
                          : "bg-slate-700 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {isSendingEmail ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {isSendingEmail && (
                  <div className="mt-6 bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                    <p className="text-violet-400 text-sm">جاري إرسال المهمة...</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, gradient, onClick, active }: {
  label: string;
  value: number;
  icon: any;
  gradient: string;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <motion.button 
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-5 rounded-2xl border transition-all overflow-hidden ${
        active 
          ? "bg-slate-700/80 border-violet-500/50 shadow-lg shadow-violet-500/20" 
          : "bg-slate-800/50 border-white/10 hover:border-white/20"
      }`}
    >
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`} />
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {active && <Star className="w-4 h-4 text-violet-400 fill-violet-400" />}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </motion.button>
  );
}

function TaskCard({ task, onStatusChange, onDelete, onEmail, onPrint, onPreview }: {
  task: Task;
  onStatusChange: (id: number, status: string) => void;
  onDelete: (id: number) => void;
  onEmail: (task: Task) => void;
  onPrint: (task: Task) => void;
  onPreview: () => void;
}) {
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const status = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.pending;
  const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completed' && task.status !== 'cancelled';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`group bg-slate-800/50 backdrop-blur-xl rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 ${
        isOverdue ? 'border-red-500/30' : 'border-white/10 hover:border-violet-500/30'
      }`}
    >
      {/* Priority Bar */}
      <div className={`h-1.5 bg-gradient-to-r ${priority.color}`} />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${priority.bg}`}>
            <priority.icon className={`w-4 h-4 ${priority.text}`} />
            <span className={`text-xs font-black ${priority.text}`}>{priority.label}</span>
          </div>
          
          {isOverdue && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-black text-red-500">متأخرة</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-black text-white mb-2 line-clamp-1">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{task.description}</p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-4 text-xs font-bold text-slate-500">
          <div className="flex items-center gap-1.5">
            <User size={14} />
            <span>{task.employee_name || 'غير معين'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span className={isOverdue ? 'text-red-400' : ''}>{task.due_date}</span>
          </div>
        </div>

        {/* Status Select */}
        <div className="mb-4">
          <select 
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className={`w-full h-11 px-4 rounded-xl text-xs font-black uppercase tracking-wider outline-none border transition-all cursor-pointer ${status.bg} ${status.text} border-transparent hover:border-current`}
          >
            <option value="pending">قيد الانتظار</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="completed">مكتملة</option>
            <option value="cancelled">ملغاة</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-white/5">
          <button 
            onClick={onPreview}
            className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-violet-500/20 hover:text-violet-400 transition-all"
            title="معاينة"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => onEmail(task)}
            className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-emerald-500/20 hover:text-emerald-400 transition-all"
            title="إرسال بالبريد"
          >
            <Send size={16} />
          </button>
          <button 
            onClick={() => onPrint(task)}
            className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-blue-500/20 hover:text-blue-400 transition-all"
            title="طباعة"
          >
            <Printer size={16} />
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all"
            title="حذف"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function DetailItem({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`font-bold ${color || 'text-white'}`}>{value}</p>
    </div>
  );
}
