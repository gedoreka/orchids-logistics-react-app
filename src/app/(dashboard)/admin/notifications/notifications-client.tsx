"use client";

import React, { useState } from "react";
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
  Info
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
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    sent_to_all: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await sendAdminNotification(formData);
      if (result.success) {
        toast.success("تم إرسال الإشعار بنجاح");
        setIsModalOpen(false);
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

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2c3e50] to-[#34495e] rounded-[2.5rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Bell size={200} />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 font-black text-xs uppercase tracking-widest">
            <Info size={14} className="text-[#3498db]" />
            نظام التنبيهات الإدارية
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">إشعارات النظام</h1>
          <p className="text-white/60 font-bold text-lg max-w-xl">
            أرسل تنبيهات فورية لجميع الشركات أو لمجموعات محددة لإبلاغهم بالتحديثات أو التعليمات الجديدة
          </p>

          <div className="pt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#3498db] to-[#2ecc71] text-white px-10 py-5 rounded-3xl font-black text-xl shadow-xl shadow-[#3498db]/20 transition-all"
            >
              <Plus size={24} />
              <span>إنشاء إشعار جديد</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Notifications List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <History className="text-[#3498db]" />
              سجل الإشعارات المرسلة
            </h2>
            <span className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-full text-xs font-black">
              {notifications.length} إشعار
            </span>
          </div>

          <div className="space-y-4">
            {notifications.map((notif, index) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-[2rem] border-2 border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 group relative"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#3498db]">
                        <Bell size={20} />
                      </div>
                      <h3 className="text-xl font-black text-gray-900">{notif.title}</h3>
                    </div>
                    
                    <p className="text-gray-500 font-bold leading-relaxed pr-13">
                      {notif.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 pt-4 pr-13">
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Clock size={12} />
                        <span>{new Date(notif.created_at).toLocaleString('ar-SA')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Users size={12} />
                        <span>{notif.sent_to_all ? "مرسل للجميع" : "مرسل لشركات محددة"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                      notif.sent_to_all ? "bg-green-50 text-green-600 border border-green-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                    )}>
                      {notif.sent_to_all ? "عام" : "خاص"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {notifications.length === 0 && (
              <div className="py-20 flex flex-col items-center gap-4 opacity-30 text-center">
                <Bell size={80} />
                <span className="text-xl font-black">لا توجد إشعارات مرسلة بعد</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Tips */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border-2 border-gray-100 p-8 shadow-xl space-y-6">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                <ImageIcon size={18} />
              </div>
              نصائح الاستخدام
            </h3>
            
            <div className="space-y-4">
              {[
                { title: "عنوان واضح", desc: "استخدم عناوين مختصرة ومباشرة للفت الانتباه" },
                { title: "التوقيت المناسب", desc: "أرسل الإشعارات المهمة في أوقات العمل الرسمية" },
                { title: "الرسائل العامة", desc: "الإشعارات العامة تظهر لجميع الشركات المشتركة" },
              ].map((tip, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="h-6 w-6 rounded-full bg-gray-100 text-[10px] font-black flex items-center justify-center shrink-0 group-hover:bg-[#3498db] group-hover:text-white transition-colors">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-gray-800">{tip.title}</h4>
                    <p className="text-xs text-gray-400 font-bold mt-1">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Notification Modal */}
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
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#2c3e50] to-[#3498db] p-10 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black">إرسال إشعار جديد</h3>
                  <p className="text-white/70 font-bold text-sm mt-1 tracking-wider">بث رسالة فورية لشركاء النظام</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="h-14 w-14 rounded-[1.5rem] bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
                >
                  <X size={28} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8 text-right">
                <div className="space-y-3">
                  <label className="text-sm font-black text-gray-500 mr-2 uppercase tracking-widest">عنوان الإشعار</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: تحديث أمني هام في النظام"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl py-5 px-8 font-bold text-gray-700 focus:border-[#3498db]/30 focus:ring-4 focus:ring-[#3498db]/5 outline-none transition-all text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-gray-500 mr-2 uppercase tracking-widest">محتوى الإشعار</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="اكتب تفاصيل الإشعار هنا..."
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] py-5 px-8 font-bold text-gray-700 focus:border-[#3498db]/30 focus:ring-4 focus:ring-[#3498db]/5 outline-none transition-all text-lg resize-none"
                  />
                </div>

                <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl border-2 border-gray-100">
                  <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-[#3498db] shadow-sm">
                    <Users size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-gray-900 text-sm">إرسال لجميع الشركات</h4>
                    <p className="text-xs text-gray-400 font-bold">سيظهر هذا التنبيه في الصفحة الرئيسية لجميع المستخدمين</p>
                  </div>
                  <div 
                    onClick={() => setFormData({ ...formData, sent_to_all: !formData.sent_to_all })}
                    className={cn(
                      "w-16 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 relative",
                      formData.sent_to_all ? "bg-green-500" : "bg-gray-300"
                    )}
                  >
                    <motion.div
                      animate={{ x: formData.sent_to_all ? 32 : 0 }}
                      className="w-6 h-6 bg-white rounded-full shadow-md"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-[#3498db] to-[#2ecc71] text-white py-5 rounded-[1.5rem] font-black text-xl shadow-xl shadow-[#3498db]/20 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={24} />
                        <span>بث الإشعار الآن</span>
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-10 bg-gray-100 text-gray-500 py-5 rounded-[1.5rem] font-black text-xl hover:bg-gray-200 transition-all"
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
