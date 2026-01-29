"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Search, 
  ChevronRight, 
  HelpCircle, 
  MessageSquare,
  Globe,
  Tag,
  Loader2,
  X,
  BrainCircuit,
  Sparkles,
  Layers,
  SearchCode,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Article {
  id: number;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  language: string;
  used_count: number;
  created_at: string;
}

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArticle, setNewArticle] = useState({
    category: "general",
    question: "",
    answer: "",
    keywords: "",
    language: "ar"
  });

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/admin/knowledge-base");
      const data = await res.json();
      if (data.articles) setArticles(data.articles);
    } catch (error) {
      toast.error("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newArticle,
          keywords: newArticle.keywords.split(",").map(k => k.trim())
        })
      });
      if (res.ok) {
        toast.success("تمت الإضافة بنجاح");
        setShowAddModal(false);
        setNewArticle({ category: "general", question: "", answer: "", keywords: "", language: "ar" });
        fetchArticles();
      }
    } catch (error) {
      toast.error("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const res = await fetch(`/api/admin/knowledge-base?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("تم الحذف");
        setArticles(articles.filter(a => a.id !== id));
      }
    } catch (error) {
      toast.error("فشل الحذف");
    }
  };

  const filteredArticles = articles.filter(a => 
    a.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcfcfd] p-4 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden"
      >
        {/* Modern Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 px-8 py-12">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full -ml-20 -mb-20" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-2xl">
                <BrainCircuit size={40} className="text-indigo-300" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">قاعدة المعرفة الذكية</h1>
                  <span className="bg-indigo-500/20 text-indigo-200 text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-500/30 uppercase flex items-center gap-1">
                    <Sparkles size={10} />
                    AI Ready
                  </span>
                </div>
                <p className="text-indigo-200/60 text-lg font-medium">إدارة وتدريب المساعد الذكي بمعلومات شركتك الخاصة</p>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="bg-white text-indigo-950 px-8 py-4 rounded-[1.5rem] font-black transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 group"
            >
              <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              إضافة معلومة جديدة
            </motion.button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 lg:p-12 space-y-10">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative group">
              <input
                type="text"
                placeholder="ابحث عن سؤال، جواب، أو تصنيف محدد..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-8 py-5 pr-14 text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm group-hover:bg-white"
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={24} />
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-[1.5rem] px-8 py-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <Layers size={22} />
                </div>
                <div>
                  <p className="text-2xl font-black text-indigo-950 leading-none">{articles.length}</p>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.1em] mt-1">إجمالي السجلات</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout for Articles */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-100 rounded-full" />
                <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0" />
              </div>
              <p className="text-slate-400 font-bold animate-pulse">جاري جلب المعلومات...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200/60"
            >
              <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-center mx-auto mb-8 border border-slate-100">
                <SearchCode size={48} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-800">لا توجد بيانات متاحة</h3>
              <p className="text-slate-400 mt-3 max-w-sm mx-auto font-medium">ابدأ الآن بإضافة معلومات شركتك ليتمكن المساعد الذكي من الرد على استفسارات عملائك بدقة.</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="mt-8 text-indigo-600 font-black flex items-center gap-2 mx-auto hover:gap-4 transition-all"
              >
                أضف أول معلومة الآن <ChevronRight size={20} />
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredArticles.map((article) => (
                  <motion.div
                    layout
                    key={article.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 relative flex flex-col h-full overflow-hidden"
                  >
                    {/* Hover Effect Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-transparent to-purple-50/0 group-hover:from-indigo-50/50 group-hover:to-purple-50/50 transition-all duration-500 -z-10" />
                    
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100/50 text-indigo-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider border border-indigo-100">
                          {article.category === 'general' ? 'عام' : 
                           article.category === 'technical' ? 'فني' : 
                           article.category === 'financial' ? 'مالي' : 'خدمات'}
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                          <Globe size={12} className="text-slate-400" />
                          <span className="text-[10px] text-slate-600 font-bold uppercase">
                            {article.language === 'ar' ? 'العربية' : 'English'}
                          </span>
                        </div>
                      </div>
                      
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(article.id)}
                        className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Trash2 size={20} />
                      </motion.button>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1.5">
                          <Lightbulb className="text-indigo-600" size={20} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 leading-[1.4]">
                          {article.question}
                        </h3>
                      </div>
                      
                      <div className="pr-9">
                        <p className="text-slate-500 text-[15px] leading-[1.8] font-medium line-clamp-4">
                          {article.answer}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-slate-50 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                          <Tag size={14} className="text-indigo-400" />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(article.keywords) ? article.keywords : []).slice(0, 3).map((k, i) => (
                            <span key={i} className="text-[10px] text-slate-400 font-bold bg-slate-50/50 px-2 py-0.5 rounded-md">
                              #{k}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-indigo-50/30 px-4 py-2 rounded-2xl border border-indigo-50/50">
                        <MessageSquare size={14} className="text-indigo-600" />
                        <span className="text-[11px] text-indigo-950 font-black">
                          استخدم {article.used_count} مرات
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modernized Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-indigo-950/20 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden my-auto"
            >
              <div className="bg-indigo-950 p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -mr-32 -mt-32" />
                <div className="relative flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-white font-black text-2xl">توسيع قاعدة المعرفة</h2>
                    <p className="text-indigo-300/60 font-medium">أضف معلومة جديدة لتدريب ذكاء المساعد</p>
                  </div>
                  <button 
                    onClick={() => setShowAddModal(false)} 
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleAdd} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      التصنيف الوظيفي
                    </label>
                    <select 
                      value={newArticle.category}
                      onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                    >
                      <option value="general">عام (معلومات عامة)</option>
                      <option value="technical">فني (طريقة الاستخدام)</option>
                      <option value="financial">مالي (الأسعار والفوترة)</option>
                      <option value="service">خدمات (شرح الخدمات)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      لغة المعلومة
                    </label>
                    <select 
                      value={newArticle.language}
                      onChange={(e) => setNewArticle({...newArticle, language: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                    >
                      <option value="ar">العربية (الأم)</option>
                      <option value="en">English (Secondary)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    السؤال أو المحفز (Trigger)
                  </label>
                  <input
                    required
                    type="text"
                    value={newArticle.question}
                    onChange={(e) => setNewArticle({...newArticle, question: e.target.value})}
                    placeholder="مثال: كيف يمكنني طلب شحنة دولية؟"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    الإجابة النموذجية للـ AI
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={newArticle.answer}
                    onChange={(e) => setNewArticle({...newArticle, answer: e.target.value})}
                    placeholder="اكتب الرد الذي سيستخدمه الذكاء الاصطناعي بدقة..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    الكلمات المفتاحية (لفهم السياق)
                  </label>
                  <input
                    type="text"
                    value={newArticle.keywords}
                    onChange={(e) => setNewArticle({...newArticle, keywords: e.target.value})}
                    placeholder="شحن، دولي، طلب، سعر، طرد (افصل بفاصلة)"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-indigo-950 hover:bg-indigo-900 text-white py-5 rounded-2xl font-black transition-all disabled:opacity-50 shadow-xl shadow-indigo-950/10 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : (
                      <>
                        <Sparkles size={20} />
                        حفظ وتدريب المساعد
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 py-5 rounded-2xl font-black transition-all border border-slate-100"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
