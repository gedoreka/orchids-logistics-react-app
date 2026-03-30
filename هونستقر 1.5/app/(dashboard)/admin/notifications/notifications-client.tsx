"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Send, 
  Trash2, 
  Users, 
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Plus,
  X,
  History,
  Megaphone,
  Star,
  Zap,
  LayoutGrid,
  Search,
  CalendarDays,
  Edit3,
  Snowflake,
  MoreVertical,
  Play,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { sendAdminNotification } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

interface AdminNotificationsClientProps {
  initialNotifications: any[];
}

export function AdminNotificationsClient({ initialNotifications }: AdminNotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [editingNotification, setEditingNotification] = useState<any>(null);
  
  // Confirmation modals state
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; notification: any | null }>({ isOpen: false, notification: null });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; type: 'delete' | 'update' | null; title: string }>({ isOpen: false, type: null, title: '' });

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    sent_to_all: true,
    image_path: "",
  });

  const stats = useMemo(() => {
    return {
      total: notifications.length,
      global: notifications.filter(n => n.sent_to_all).length,
      frozen: notifications.filter(n => n.is_frozen).length,
      lastDate: notifications.length > 0 ? new Date(notifications[0].created_at).toLocaleDateString('en-GB') : '---'
    };
  }, [notifications]);

  const filteredNotifications = notifications.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await sendAdminNotification(formData);
      if (result.success) {
        toast.success("تم إرسال الإشعار بنجاح");
        setIsModalOpen(false);
        setFormData({ title: "", message: "", sent_to_all: true, image_path: "" });
        window.location.reload();
      } else {
        toast.error(result.error || "حدث خطأ أثناء الإرسال");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Edit
  const handleEdit = (notif: any) => {
    setEditingNotification(notif);
    setFormData({
      title: notif.title,
      message: notif.message,
      sent_to_all: notif.sent_to_all,
      image_path: notif.image_path || "",
    });
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: editingNotification.id,
          title: formData.title,
          message: formData.message,
          image_path: formData.image_path,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(notifications.map(n => 
          n.id === editingNotification.id 
            ? { ...n, title: formData.title, message: formData.message, image_path: formData.image_path }
            : n
        ));
        setIsEditModalOpen(false);
        setEditingNotification(null);
        const updatedTitle = formData.title;
        setFormData({ title: "", message: "", sent_to_all: true, image_path: "" });
        // Show success modal
        setSuccessModal({ isOpen: true, type: 'update', title: updatedTitle });
      } else {
        toast.error(data.error || "حدث خطأ أثناء التحديث");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Freeze/Unfreeze
  const handleToggleFreeze = async (notif: any) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: notif.id,
          is_frozen: !notif.is_frozen,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(notif.is_frozen ? "تم إلغاء تجميد الإشعار" : "تم تجميد الإشعار");
        setNotifications(notifications.map(n => 
          n.id === notif.id ? { ...n, is_frozen: !notif.is_frozen } : n
        ));
      } else {
        toast.error(data.error || "حدث خطأ");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    }
    setActiveMenu(null);
  };

  // Handle Delete - Open confirmation modal
  const handleDelete = (notif: any) => {
    setDeleteConfirmModal({ isOpen: true, notification: notif });
    setActiveMenu(null);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    const notif = deleteConfirmModal.notification;
    if (!notif) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/notifications?id=${notif.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        const deletedTitle = notif.title;
        setNotifications(notifications.filter(n => n.id !== notif.id));
        setDeleteConfirmModal({ isOpen: false, notification: null });
        // Show success modal
        setSuccessModal({ isOpen: true, type: 'delete', title: deletedTitle });
      } else {
        toast.error(data.error || "حدث خطأ أثناء الحذف");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 p-4 md:p-6 bg-slate-900 min-h-screen">
      {/* Compact Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] rounded-[2rem] p-5 md:p-6 text-white shadow-2xl overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none rotate-12">
            <Megaphone size={150} />
          </div>
          <div className="absolute bottom-0 left-0 p-6 opacity-5 pointer-events-none -rotate-12">
            <Bell size={120} />
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-2xl px-5 py-2 rounded-full border border-white/20 font-black text-xs uppercase tracking-[0.15em]"
            >
              <Zap size={14} className="text-amber-400 fill-amber-400" />
              <span>مركز البث الإداري</span>
            </motion.div>
            
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                إشعارات الإدارة
              </h1>
              <p className="text-white/50 font-bold text-sm max-w-2xl mx-auto leading-relaxed">
                تحكم في التواصل المباشر مع جميع المستخدمين
              </p>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 15px 30px rgba(52, 152, 219, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#3498db] via-[#2980b9] to-[#3498db] text-white px-6 py-3 rounded-xl font-black text-base shadow-xl shadow-[#3498db]/30 transition-all border-b-2 border-blue-700/50"
              >
                <Plus size={20} />
                <span>إنشاء إشعار</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "إجمالي الإشعارات", value: stats.total, icon: Bell, color: "from-blue-500 to-indigo-600" },
          { label: "مرسل للجميع", value: stats.global, icon: Users, color: "from-emerald-500 to-teal-600" },
          { label: "إشعارات مجمدة", value: stats.frozen, icon: Snowflake, color: "from-cyan-500 to-blue-600" },
          { label: "آخر تحديث", value: stats.lastDate, icon: Clock, color: "from-amber-500 to-orange-600" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex items-center gap-6 group hover:border-blue-500/30 transition-all cursor-pointer"
          >
            <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">{stat.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Notifications List */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <History className="text-blue-500" size={24} />
                سجل البث الفوري
              </h2>
              <p className="text-slate-400 font-bold text-sm">قائمة بجميع الإشعارات التي تم إرسالها مسبقاً</p>
            </div>
            
            <div className="relative group min-w-[300px]">
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="ابحث في السجل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 pr-14 pl-6 font-bold text-slate-600 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className={cn(
                    "bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 p-6 md:p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group relative overflow-hidden",
                    notif.is_frozen 
                      ? "border-cyan-300 dark:border-cyan-800 bg-cyan-50/50 dark:bg-cyan-950/20" 
                      : "border-slate-50 dark:border-slate-800"
                  )}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:bg-blue-500/10"></div>
                  
                  {/* Frozen Badge */}
                  {notif.is_frozen && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-full text-xs font-black shadow-lg">
                      <Snowflake size={14} />
                      مجمد
                    </div>
                  )}
                  
                  {/* Actions Menu */}
                  <div className="absolute top-6 right-6 z-20">
                    <button
                      onClick={() => setActiveMenu(activeMenu === notif.id ? null : notif.id)}
                      className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                    >
                      <MoreVertical size={20} className="text-slate-500" />
                    </button>
                    
                    <AnimatePresence>
                      {activeMenu === notif.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          className="absolute top-12 right-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden min-w-[180px] z-30"
                        >
                          <button
                            onClick={() => handleEdit(notif)}
                            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-bold"
                          >
                            <Edit3 size={18} className="text-blue-500" />
                            تعديل الإشعار
                          </button>
                          <button
                            onClick={() => handleToggleFreeze(notif)}
                            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-bold"
                          >
                            {notif.is_frozen ? (
                              <>
                                <Play size={18} className="text-emerald-500" />
                                إلغاء التجميد
                              </>
                            ) : (
                              <>
                                <Snowflake size={18} className="text-cyan-500" />
                                تجميد الإشعار
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(notif)}
                            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 font-bold"
                          >
                            <Trash2 size={18} />
                            حذف الإشعار
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-start justify-between gap-8 relative z-10">
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center",
                          notif.is_frozen 
                            ? "bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600" 
                            : "bg-blue-50 dark:bg-blue-500/10 text-blue-600"
                        )}>
                          {notif.is_frozen ? <Snowflake size={24} /> : <Bell size={24} className="group-hover:animate-bounce" />}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">{notif.title}</h3>
                          <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                            <CalendarDays size={14} />
                            <span>{new Date(notif.created_at).toLocaleString('en-GB')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                        <p className="text-slate-600 dark:text-slate-300 font-bold text-base leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      {notif.image_path && (
                        <div className="rounded-3xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 max-w-sm shadow-xl">
                          <img 
                            src={notif.image_path} 
                            alt="Notification Content" 
                            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
  
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-5 py-2.5 rounded-2xl">
                          <Users size={16} className="text-blue-500" />
                          <span className="text-sm font-black text-slate-600 dark:text-slate-400">
                            {notif.sent_to_all ? "مرسل للجميع" : "مرسل لشركات محددة"}
                          </span>
                        </div>
                        {notif.sent_to_all && !notif.is_frozen && (
                          <div className="flex items-center gap-3 bg-emerald-100 dark:bg-emerald-500/10 px-5 py-2.5 rounded-2xl">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">نشط</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
  
            {filteredNotifications.length === 0 && (
              <div className="py-40 flex flex-col items-center gap-6 opacity-20 text-center">
                <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <Bell size={80} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black">لا توجد إشعارات مطابقة</h3>
                  <p className="font-bold text-lg">حاول استخدام كلمات بحث أخرى أو ابدأ ببث إشعار جديد</p>
                </div>
              </div>
            )}
          </div>
        </div>
  
        {/* Sidebar Luxury Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>
            
            <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-4 mb-10 relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Star size={24} className="fill-amber-600" />
              </div>
              إدارة الإشعارات
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div className="flex gap-4 items-start p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
                <Edit3 size={20} className="text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-black text-slate-800 dark:text-white">تعديل</h4>
                  <p className="text-sm text-slate-500 font-bold">تحديث محتوى الإشعار</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start p-4 bg-cyan-50 dark:bg-cyan-500/10 rounded-2xl">
                <Snowflake size={20} className="text-cyan-500 mt-0.5" />
                <div>
                  <h4 className="font-black text-slate-800 dark:text-white">تجميد</h4>
                  <p className="text-sm text-slate-500 font-bold">إخفاء مؤقت للمستخدمين</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl">
                <Trash2 size={20} className="text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-black text-slate-800 dark:text-white">حذف</h4>
                  <p className="text-sm text-slate-500 font-bold">إزالة نهائية للإشعار</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] text-white">
              <h4 className="font-black text-lg mb-2 flex items-center gap-2">
                <LayoutGrid size={20} />
                تلميحة
              </h4>
              <p className="text-white/70 text-sm font-bold leading-relaxed">
                الإشعارات المجمدة لن تظهر للمستخدمين لكنها تبقى محفوظة ويمكن إعادة تفعيلها.
              </p>
            </div>
          </div>
        </div>
      </div>
  
      {/* Add Notification Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-white/10 max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-8 md:p-12 text-white relative sticky top-0 z-10">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-45">
                  <Send size={200} />
                </div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-2">
                    <h3 className="text-3xl md:text-4xl font-black tracking-tighter">بث إشعار جديد</h3>
                    <p className="text-white/50 font-bold text-base md:text-lg tracking-wide uppercase">صمم رسالتك التالية بعناية فائقة</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsModalOpen(false)}
                    className="h-14 w-14 md:h-16 md:w-16 rounded-[2rem] bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shadow-lg"
                  >
                    <X size={28} />
                  </motion.button>
                </div>
              </div>
  
              <form onSubmit={handleSubmit} className="p-8 md:p-16 space-y-8 md:space-y-10 text-right">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                  <div className="space-y-4">
                    <label className="text-sm font-black text-slate-400 mr-2 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      عنوان البث
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="عنوان جذاب يشد الانتباه..."
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] py-5 md:py-6 px-8 md:px-10 font-black text-slate-800 dark:text-white focus:border-blue-500/50 focus:ring-[12px] focus:ring-blue-500/5 outline-none transition-all text-lg md:text-xl placeholder:text-slate-300"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-black text-slate-400 mr-2 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      رابط الصورة (اختياري)
                    </label>
                    <div className="relative">
                      <ImageIcon className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                      <input
                        type="text"
                        value={formData.image_path}
                        onChange={(e) => setFormData({ ...formData, image_path: e.target.value })}
                        placeholder="ضع رابط الصورة هنا..."
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] py-5 md:py-6 pr-14 md:pr-16 pl-8 md:pl-10 font-black text-slate-800 dark:text-white focus:border-purple-500/50 focus:ring-[12px] focus:ring-purple-500/5 outline-none transition-all text-lg md:text-xl placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </div>
  
                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-400 mr-2 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    محتوى الرسالة الإعلانية
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="اكتب رسالتك الفخمة هنا..."
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] md:rounded-[3rem] py-6 md:py-8 px-8 md:px-10 font-black text-slate-800 dark:text-white focus:border-emerald-500/50 focus:ring-[12px] focus:ring-emerald-500/5 outline-none transition-all text-lg md:text-xl resize-none placeholder:text-slate-300"
                  />
                </div>
  
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 justify-between bg-slate-50 dark:bg-slate-800/50 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-slate-900 flex items-center justify-center text-blue-500 shadow-xl shadow-blue-500/10 border border-slate-100 dark:border-slate-800">
                      <Users size={32} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-xl md:text-2xl tracking-tight">استهداف جميع الشركات</h4>
                      <p className="text-slate-400 font-bold text-base md:text-lg mt-1">سيتم بث الإشعار لجميع حسابات النظام فوراً</p>
                    </div>
                  </div>
                  
                  <div 
                    onClick={() => setFormData({ ...formData, sent_to_all: !formData.sent_to_all })}
                    className={cn(
                      "w-24 h-12 rounded-full p-2 cursor-pointer transition-all duration-500 relative shadow-inner shrink-0",
                      formData.sent_to_all ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-slate-300"
                    )}
                  >
                    <motion.div
                      animate={{ x: formData.sent_to_all ? 48 : 0 }}
                      className="w-8 h-8 bg-white rounded-full shadow-2xl"
                    />
                  </div>
                </div>
  
                <div className="flex flex-col md:flex-row gap-6 pt-4 md:pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 25px 50px rgba(52, 152, 219, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-4 bg-gradient-to-r from-[#3498db] via-[#2980b9] to-[#3498db] text-white py-6 md:py-8 rounded-[2rem] md:rounded-[2.5rem] font-black text-2xl md:text-3xl shadow-2xl shadow-[#3498db]/30 disabled:opacity-50 border-b-4 md:border-b-8 border-blue-700/50"
                  >
                    {isLoading ? (
                      <div className="h-8 w-8 md:h-10 md:w-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={28} />
                        <span>أطلق البث الآن</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Notification Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingNotification(null);
                setFormData({ title: "", message: "", sent_to_all: true, image_path: "" });
              }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-white/10 max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 p-8 md:p-12 text-white relative sticky top-0 z-10">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-45">
                  <Edit3 size={200} />
                </div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-2">
                    <h3 className="text-3xl md:text-4xl font-black tracking-tighter">تعديل الإشعار</h3>
                    <p className="text-white/70 font-bold text-base md:text-lg">قم بتحديث محتوى الإشعار</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingNotification(null);
                      setFormData({ title: "", message: "", sent_to_all: true, image_path: "" });
                    }}
                    className="h-14 w-14 md:h-16 md:w-16 rounded-[2rem] bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shadow-lg"
                  >
                    <X size={28} />
                  </motion.button>
                </div>
              </div>
  
              <form onSubmit={handleUpdateSubmit} className="p-8 md:p-16 space-y-8 md:space-y-10 text-right">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                  <div className="space-y-4">
                    <label className="text-sm font-black text-slate-400 mr-2 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      عنوان البث
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="عنوان جذاب يشد الانتباه..."
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] py-5 md:py-6 px-8 md:px-10 font-black text-slate-800 dark:text-white focus:border-amber-500/50 focus:ring-[12px] focus:ring-amber-500/5 outline-none transition-all text-lg md:text-xl placeholder:text-slate-300"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-black text-slate-400 mr-2 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      رابط الصورة (اختياري)
                    </label>
                    <div className="relative">
                      <ImageIcon className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                      <input
                        type="text"
                        value={formData.image_path}
                        onChange={(e) => setFormData({ ...formData, image_path: e.target.value })}
                        placeholder="ضع رابط الصورة هنا..."
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] py-5 md:py-6 pr-14 md:pr-16 pl-8 md:pl-10 font-black text-slate-800 dark:text-white focus:border-purple-500/50 focus:ring-[12px] focus:ring-purple-500/5 outline-none transition-all text-lg md:text-xl placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </div>
  
                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-400 mr-2 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    محتوى الرسالة الإعلانية
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="اكتب رسالتك الفخمة هنا..."
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] md:rounded-[3rem] py-6 md:py-8 px-8 md:px-10 font-black text-slate-800 dark:text-white focus:border-emerald-500/50 focus:ring-[12px] focus:ring-emerald-500/5 outline-none transition-all text-lg md:text-xl resize-none placeholder:text-slate-300"
                  />
                </div>
  
                <div className="flex flex-col md:flex-row gap-6 pt-4 md:pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingNotification(null);
                      setFormData({ title: "", message: "", sent_to_all: true, image_path: "" });
                    }}
                    className="flex-1 flex items-center justify-center gap-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-5 md:py-6 rounded-[2rem] font-black text-xl md:text-2xl"
                  >
                    إلغاء
                  </motion.button>
                   <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 25px 50px rgba(245, 158, 11, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white py-5 md:py-6 rounded-[2rem] font-black text-xl md:text-2xl shadow-2xl shadow-amber-500/30 disabled:opacity-50 border-b-4 border-amber-700/50"
                    >
                      {isLoading ? (
                        <div className="h-8 w-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Edit3 size={24} />
                          <span>حفظ التعديلات</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirmModal.isOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteConfirmModal({ isOpen: false, notification: null })}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.3)] overflow-hidden border-4 border-red-500/20"
              >
                {/* Header with animated icon */}
                <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", damping: 15 }}
                    className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <AlertTriangle size={48} className="text-white drop-shadow-lg" />
                    </motion.div>
                  </motion.div>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-black tracking-tight relative z-10"
                  >
                    تأكيد الحذف
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/80 font-bold mt-2 relative z-10"
                  >
                    هذا الإجراء لا يمكن التراجع عنه
                  </motion.p>
                </div>

                {/* Content */}
                <div className="p-8 text-center space-y-6">
                  <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-6 border-2 border-red-100 dark:border-red-900/50">
                    <p className="text-slate-700 dark:text-slate-300 font-bold text-lg leading-relaxed">
                      هل أنت متأكد من حذف الإشعار
                    </p>
                    <p className="text-red-600 dark:text-red-400 font-black text-xl mt-2 truncate">
                      "{deleteConfirmModal.notification?.title}"
                    </p>
                  </div>

                  <p className="text-slate-500 font-bold text-sm">
                    سيتم حذف الإشعار نهائياً ولن يتمكن أي مستخدم من رؤيته بعد الآن
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDeleteConfirmModal({ isOpen: false, notification: null })}
                      className="flex-1 flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X size={20} />
                      إلغاء
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(239, 68, 68, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={confirmDelete}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-500/30 disabled:opacity-50 border-b-4 border-red-700/50"
                    >
                      {isLoading ? (
                        <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Trash2 size={20} />
                          نعم، احذف
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
          {successModal.isOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSuccessModal({ isOpen: false, type: null, title: '' })}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className={cn(
                  "relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border-4",
                  successModal.type === 'delete' 
                    ? "border-emerald-500/20 shadow-[0_0_100px_rgba(16,185,129,0.3)]" 
                    : "border-blue-500/20 shadow-[0_0_100px_rgba(59,130,246,0.3)]"
                )}
              >
                {/* Header */}
                <div className={cn(
                  "relative p-10 text-white text-center overflow-hidden",
                  successModal.type === 'delete'
                    ? "bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700"
                    : "bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700"
                )}>
                  {/* Animated particles */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ 
                          y: -100, 
                          opacity: [0, 1, 0],
                          x: Math.random() * 100 - 50
                        }}
                        transition={{ 
                          delay: i * 0.2, 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                        className="absolute"
                        style={{ left: `${15 + i * 15}%` }}
                      >
                        <Sparkles size={20} className="text-white/40" />
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", damping: 12 }}
                    className="relative z-10 mx-auto w-28 h-28 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <CheckCircle2 size={56} className="text-white drop-shadow-lg" />
                    </motion.div>
                  </motion.div>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-black tracking-tight relative z-10"
                  >
                    {successModal.type === 'delete' ? 'تم الحذف بنجاح!' : 'تم التحديث بنجاح!'}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/80 font-bold mt-2 relative z-10"
                  >
                    {successModal.type === 'delete' ? 'تمت إزالة الإشعار من النظام' : 'تم نشر التعديلات للمستخدمين'}
                  </motion.p>
                </div>

                {/* Content */}
                <div className="p-8 text-center space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className={cn(
                      "rounded-2xl p-6 border-2",
                      successModal.type === 'delete'
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50"
                        : "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50"
                    )}
                  >
                    <p className="text-slate-500 font-bold text-sm mb-2">
                      {successModal.type === 'delete' ? 'الإشعار المحذوف:' : 'الإشعار المحدّث:'}
                    </p>
                    <p className={cn(
                      "font-black text-xl truncate",
                      successModal.type === 'delete' ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"
                    )}>
                      "{successModal.title}"
                    </p>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSuccessModal({ isOpen: false, type: null, title: '' })}
                    className={cn(
                      "w-full flex items-center justify-center gap-3 text-white py-5 rounded-2xl font-black text-xl shadow-xl border-b-4",
                      successModal.type === 'delete'
                        ? "bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 shadow-emerald-500/30 border-emerald-700/50"
                        : "bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-600 shadow-blue-500/30 border-blue-700/50"
                    )}
                  >
                    <CheckCircle2 size={24} />
                    حسناً
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Click outside to close menu */}
        {activeMenu !== null && (
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setActiveMenu(null)}
          />
        )}
      </div>
    );
}
