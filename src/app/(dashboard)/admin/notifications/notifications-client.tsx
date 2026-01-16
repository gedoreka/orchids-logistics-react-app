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
  Info,
  Megaphone,
  Star,
  Zap,
  LayoutGrid,
  Search,
  ArrowLeft,
  CalendarDays
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
  const [searchQuery, setSearchQuery] = useState("");

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
      withImage: notifications.filter(n => n.image_path).length,
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

  return (
    <div className="space-y-10 pb-20 p-4 md:p-8 bg-[#f8fafc] dark:bg-slate-950/50 min-h-screen">
      {/* Luxurious Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12">
            <Megaphone size={300} />
          </div>
          <div className="absolute bottom-0 left-0 p-12 opacity-5 pointer-events-none -rotate-12">
            <Bell size={250} />
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-2xl px-8 py-3 rounded-full border border-white/20 font-black text-sm uppercase tracking-[0.2em]"
            >
              <Zap size={18} className="text-amber-400 fill-amber-400" />
              <span>مركز البث الإداري</span>
            </motion.div>
            
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                إشعارات الإدارة
              </h1>
              <p className="text-white/50 font-bold text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
                تحكم في التواصل المباشر مع جميع المستخدمين. أرسل التحديثات، التنبيهات، والإعلانات الهامة بلمسة واحدة.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(52, 152, 219, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-4 bg-gradient-to-r from-[#3498db] via-[#2980b9] to-[#3498db] text-white px-8 py-4 rounded-[1.5rem] font-black text-xl shadow-2xl shadow-[#3498db]/30 transition-all border-b-4 border-blue-700/50"
              >
                <Plus size={28} />
                <span>إنشاء إشعار ملكي</span>
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
          { label: "إشعارات بالصور", value: stats.withImage, icon: ImageIcon, color: "from-purple-500 to-pink-600" },
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
              {filteredNotifications.map((notif, index) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800 p-6 md:p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:bg-blue-500/10"></div>
                  
                  <div className="flex flex-col md:flex-row items-start justify-between gap-8 relative z-10">
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                          <Bell size={24} className="group-hover:animate-bounce" />
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
                            onerror="this.style.display='none'"
                          />
                        </div>
                      )}
  
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-5 py-2.5 rounded-2xl">
                          <Users size={16} className="text-blue-500" />
                          <span className="text-sm font-black text-slate-600 dark:text-slate-400">
                            {notif.sent_to_all ? "مرسل للجميع" : "مرسل لشركات محددة"}
                          </span>
                        </div>
                        {notif.sent_to_all && (
                          <div className="flex items-center gap-3 bg-emerald-100 dark:bg-emerald-500/10 px-5 py-2.5 rounded-2xl">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">حالة عامة</span>
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
              أسرار البث الناجح
            </h3>
            
            <div className="space-y-10 relative z-10">
              {[
                { title: "العناوين الملكية", desc: "استخدم عناوين قصيرة جداً ومثيرة للفضول لضمان القراءة.", color: "bg-blue-500" },
                { title: "الإيجاز المذهل", desc: "خير الكلام ما قل ودل، اجعل رسالتك مباشرة جداً.", color: "bg-emerald-500" },
                { title: "قوة البصريات", desc: "الإشعارات التي تحتوي على صور تحقق نسبة تفاعل أعلى بـ 70%.", color: "bg-purple-500" },
                { title: "التوقيت الذهبي", desc: "أفضل وقت لإرسال التنبيهات هو بداية يوم العمل.", color: "bg-orange-500" },
              ].map((tip, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="shrink-0">
                    <div className={cn("h-4 w-4 rounded-full mt-1.5 shadow-lg group-hover:scale-150 transition-transform duration-500", tip.color)}></div>
                    <div className="w-0.5 h-16 bg-slate-100 dark:bg-slate-800 mx-auto mt-2"></div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-lg text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors">{tip.title}</h4>
                    <p className="text-sm text-slate-400 font-bold leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] text-white">
              <h4 className="font-black text-lg mb-2 flex items-center gap-2">
                <LayoutGrid size={20} />
                تلميحة ذكية
              </h4>
              <p className="text-white/70 text-sm font-bold leading-relaxed">
                يمكنك معاينة الإشعار قبل إرساله للتأكد من ظهوره بشكل فخم للمستخدمين.
              </p>
            </div>
          </div>
        </div>
      </div>
  
      {/* Luxurious Add Notification Modal */}
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
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-white/10"
            >
              <div className="bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-12 text-white relative">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-45">
                  <Send size={200} />
                </div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-2">
                    <h3 className="text-4xl font-black tracking-tighter">بث إشعار ملكي</h3>
                    <p className="text-white/50 font-bold text-lg tracking-wide uppercase">صمم رسالتك التالية بعناية فائقة</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsModalOpen(false)}
                    className="h-16 w-16 rounded-[2rem] bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shadow-lg"
                  >
                    <X size={32} />
                  </motion.button>
                </div>
              </div>
  
              <form onSubmit={handleSubmit} className="p-12 md:p-16 space-y-10 text-right">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] py-6 px-10 font-black text-slate-800 dark:text-white focus:border-blue-500/50 focus:ring-[12px] focus:ring-blue-500/5 outline-none transition-all text-xl placeholder:text-slate-300"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-black text-slate-400 mr-2 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      رابط الصورة (اختياري)
                    </label>
                    <div className="relative">
                      <ImageIcon className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                      <input
                        type="text"
                        value={formData.image_path}
                        onChange={(e) => setFormData({ ...formData, image_path: e.target.value })}
                        placeholder="ضع رابط الصورة هنا..."
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] py-6 pr-16 pl-10 font-black text-slate-800 dark:text-white focus:border-purple-500/50 focus:ring-[12px] focus:ring-purple-500/5 outline-none transition-all text-xl placeholder:text-slate-300"
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
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] py-8 px-10 font-black text-slate-800 dark:text-white focus:border-emerald-500/50 focus:ring-[12px] focus:ring-emerald-500/5 outline-none transition-all text-xl resize-none placeholder:text-slate-300"
                  />
                </div>
  
                <div className="flex flex-col md:flex-row items-center gap-8 justify-between bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-[2rem] bg-white dark:bg-slate-900 flex items-center justify-center text-blue-500 shadow-xl shadow-blue-500/10 border border-slate-100 dark:border-slate-800">
                      <Users size={36} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-2xl tracking-tight">استهداف جميع الشركات</h4>
                      <p className="text-slate-400 font-bold text-lg mt-1">سيتم بث الإشعار لجميع حسابات النظام فوراً</p>
                    </div>
                  </div>
                  
                  <div 
                    onClick={() => setFormData({ ...formData, sent_to_all: !formData.sent_to_all })}
                    className={cn(
                      "w-24 h-12 rounded-full p-2 cursor-pointer transition-all duration-500 relative shadow-inner",
                      formData.sent_to_all ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-slate-300"
                    )}
                  >
                    <motion.div
                      animate={{ x: formData.sent_to_all ? 48 : 0 }}
                      className="w-8 h-8 bg-white rounded-full shadow-2xl"
                    />
                  </div>
                </div>
  
                <div className="flex flex-col md:flex-row gap-6 pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 25px 50px rgba(52, 152, 219, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-4 bg-gradient-to-r from-[#3498db] via-[#2980b9] to-[#3498db] text-white py-8 rounded-[2.5rem] font-black text-3xl shadow-2xl shadow-[#3498db]/30 disabled:opacity-50 border-b-8 border-blue-700/50"
                  >
                    {isLoading ? (
                      <div className="h-10 w-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={32} />
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
    </div>
  );
}
