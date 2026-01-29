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
  X
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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">قاعدة المعرفة الذكية</h1>
            <p className="text-gray-500 text-sm">إدارة المعلومات التي يستخدمها المساعد الذكي للرد على العملاء</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          إضافة معلومة جديدة
        </button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 relative">
          <input
            type="text"
            placeholder="ابحث في الأسئلة، الأجوبة، أو التصنيفات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{articles.length}</p>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">إجمالي المعلومات</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <HelpCircle size={60} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-600">لا توجد معلومات متوفرة</h3>
          <p className="text-gray-400 mt-2">ابدأ بإضافة أول معلومة لمساعدة الـ AI على التعلم</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <motion.div
              layout
              key={article.id}
              className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                    {article.category}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                    <Globe size={10} />
                    {article.language === 'ar' ? 'العربية' : 'English'}
                  </span>
                </div>
                <button 
                  onClick={() => handleDelete(article.id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
                {article.question}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                {article.answer}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-indigo-400" />
                  <span className="text-[10px] text-gray-400 font-medium">
                    {Array.isArray(article.keywords) ? article.keywords.join(", ") : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                  <MessageSquare size={12} />
                  استخدم {article.used_count} مرات
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-center justify-between">
                <h2 className="text-white font-bold text-xl">إضافة معلومة جديدة</h2>
                <button onClick={() => setShowAddModal(false)} className="text-white/70 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAdd} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">التصنيف</label>
                    <select 
                      value={newArticle.category}
                      onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="general">عام</option>
                      <option value="technical">فني</option>
                      <option value="financial">مالي</option>
                      <option value="service">خدمات</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">اللغة</label>
                    <select 
                      value={newArticle.language}
                      onChange={(e) => setNewArticle({...newArticle, language: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">السؤال / الكلمة المفتاحية</label>
                  <input
                    required
                    type="text"
                    value={newArticle.question}
                    onChange={(e) => setNewArticle({...newArticle, question: e.target.value})}
                    placeholder="مثال: كيف أعيد تعيين كلمة المرور؟"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">الجواب المنسق</label>
                  <textarea
                    required
                    rows={4}
                    value={newArticle.answer}
                    onChange={(e) => setNewArticle({...newArticle, answer: e.target.value})}
                    placeholder="اكتب الإجابة التفصيلية التي سيقدمها المساعد..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">كلمات دلالية (مفصولة بفاصلة)</label>
                  <input
                    type="text"
                    value={newArticle.keywords}
                    onChange={(e) => setNewArticle({...newArticle, keywords: e.target.value})}
                    placeholder="كلمة، سر، دخول، نسيت"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50"
                  >
                    {loading ? "جاري الحفظ..." : "حفظ المعلومة"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-bold transition-all"
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
