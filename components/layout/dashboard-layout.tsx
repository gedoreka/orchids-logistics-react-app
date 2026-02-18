"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar } from "./sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./header";
import { Footer } from "./footer";
import { GlobalChatNotifications } from "./global-chat-notifications";
import { GlobalAdminNotifications } from "./global-admin-notifications";
import { X, AlertCircle, Phone, ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { applyAccentTheme } from "@/components/theme-customizer";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    role: string;
    email: string;
    company_id?: number;
  };
  permissions?: Record<string, number>;
  userType?: string;
  subscriptionData?: {
    isActive: boolean;
    endDate: string | null;
    daysRemaining: number;
  };
}

export function DashboardLayout({ children, user, permissions, userType, subscriptionData }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isRTL } = useLocale();
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const isFetchingRef = useRef(false);
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showPhoneBanner, setShowPhoneBanner] = useState(false);
  const [phoneBannerDismissed, setPhoneBannerDismissed] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Apply accent theme on mount and when theme changes
  useEffect(() => {
    if (mounted) {
      applyAccentTheme();
      // Re-apply after a short delay in case next-themes resets attributes
      const t = setTimeout(applyAccentTheme, 150);
      return () => clearTimeout(t);
    }
  }, [mounted, resolvedTheme]);

  // Check if company needs phone number for WhatsApp OTP
  useEffect(() => {
    if (!mounted || phoneBannerDismissed || user?.role === "admin") return;
    fetch("/api/auth/check-phone")
      .then((r) => r.json())
      .then((data) => {
        if (data.needsPhone) setShowPhoneBanner(true);
      })
      .catch(() => {});
  }, [mounted, phoneBannerDismissed, user?.role]);

  const isDark = !mounted || resolvedTheme === "dark";

  const isSubscriptionPage = pathname.includes('/subscriptions');
  const isBlocked = user?.role !== 'admin' && subscriptionData && !subscriptionData.isActive && !isSubscriptionPage;

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.company_id || user?.role === "admin" || isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const response = await fetch(`/api/admin/chat?company_id=${user.company_id}&action=client_unread`);
      if (!response.ok) {
        console.warn(`Chat API returned status ${response.status}:`, response.statusText);
        return; // Don't throw, just log and return
      }
      const data = await response.json();
      if (data.unread_count !== undefined) {
        setUnreadChatCount(data.unread_count);
      }
      } catch (error: any) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          console.warn('Network error fetching chat:', error.message);
          return;
        }
        console.error("Error fetching unread count:", error);
      } finally {
      isFetchingRef.current = false;
    }
  }, [user?.company_id, user?.role]);

  useEffect(() => {
    if (pathname === "/chat" && user?.company_id && unreadChatCount > 0) {
      const clearUnread = async () => {
        try {
          await fetch(`/api/admin/chat?company_id=${user.company_id}`, { method: 'GET' });
          setUnreadChatCount(0);
        } catch (error) {
          console.error("Error clearing chat notifications:", error);
        }
      };
      clearUnread();
    }
  }, [pathname, user?.company_id, unreadChatCount]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

    return (
    <div 
      className="h-screen overflow-hidden text-foreground transition-colors duration-300" 
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Dark mode backgrounds */}
      {isDark && (
        <>
          <div className="fixed inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0d1525] to-[#0a0e1a] -z-10" />
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent -z-10" />
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/15 via-transparent to-transparent -z-10" />
        </>
      )}
          {/* Light mode background - clean white like financial vouchers */}
            {!isDark && (
              <>
                <div className="fixed inset-0 bg-[#fafbfd] -z-10" />
                <div className="fixed inset-0 bg-gradient-to-br from-[#f8f9fb] via-[#fafbfd] to-[#f9f7fb] -z-10" />
            <div className="light-bg-decorations" />
            <div className="light-decor-extra" />
          </>
        )}
      
      <GlobalChatNotifications isAdmin={user?.role === "admin"} companyId={user?.company_id} />
      <GlobalAdminNotifications />
      
        <aside className={`hidden lg:flex fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-screen w-64 z-50 ${isDark ? 'bg-gradient-to-b from-[#0d1525] via-[#0a0e1a] to-[#080c15]' : 'bg-gradient-to-b from-[#dbe4ff] via-[#c7d2f8] to-[#d0d0f0]'}`}>
          <Sidebar userRole={user?.role} permissions={permissions} userType={userType} />
        </aside>

      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: isRTL ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "100%" : "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} bottom-0 w-64 overflow-hidden flex flex-col`}
            >
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-[#0d1525] via-[#0a0e1a] to-[#080c15]' : 'bg-gradient-to-b from-[#dbe4ff] via-[#c7d2f8] to-[#d0d0f0]'}`} />
                <div className={`relative z-10 flex items-center justify-between p-4 border-b ${isDark ? 'border-white/5' : 'border-indigo-200/30'}`}>
                  <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{isRTL ? 'القائمة الرئيسية' : 'Main Menu'}</span>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`p-2 rounded-xl transition-all ${isDark ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/50'}`}
                  >
                  <X size={20} />
                </motion.button>
              </div>
              <div className="relative z-10 flex-1 overflow-y-auto">
                <Sidebar userRole={user?.role} permissions={permissions} userType={userType} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
        <div className={`${isRTL ? 'lg:mr-64' : 'lg:ml-64'} flex flex-col h-screen`}>
          <div className="flex-shrink-0 relative z-[100]">
              <Header user={user} onToggleSidebar={() => setIsSidebarOpen(true)} unreadChatCount={unreadChatCount} subscriptionData={subscriptionData} />
            </div>

            {/* Phone Number Required Banner */}
            <AnimatePresence>
              {showPhoneBanner && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="flex-shrink-0 overflow-hidden"
                >
                  <div className={`relative flex items-center gap-3 px-5 py-3.5 border-b ${
                    isDark
                      ? "bg-gradient-to-r from-amber-900/40 via-orange-900/30 to-amber-900/40 border-amber-500/20"
                      : "bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-200"
                  }`}>
                    {/* Animated glow strip */}
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-500/0 via-amber-400 to-amber-500/0" />

                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center"
                    >
                      <Phone size={18} className="text-amber-500" />
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                        رقم الهاتف مطلوب لاستقبال رمز التحقق عبر واتساب
                      </p>
                      <p className={`text-xs mt-0.5 ${isDark ? "text-amber-400/70" : "text-amber-600/80"}`}>
                        تحقق الدخول بخطوتين مفعّل — يجب إضافة رقم هاتف في بيانات المؤسسة لاستقبال رمز التحقق
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => router.push("/settings")}
                      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        isDark
                          ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
                          : "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25"
                      }`}
                    >
                      <Phone size={13} />
                      إضافة رقم الهاتف
                      {isRTL ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
                    </motion.button>

                    <button
                      onClick={() => { setShowPhoneBanner(false); setPhoneBannerDismissed(true); }}
                      className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
                        isDark ? "hover:bg-white/10 text-white/30 hover:text-white/60" : "hover:bg-amber-100 text-amber-400 hover:text-amber-600"
                      }`}
                      title="إغلاق"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
            <div className="w-full">
              {isBlocked ? (
                <div className="flex items-center justify-center min-h-[70vh] p-6 text-center">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900/80 backdrop-blur-xl border border-red-500/20 p-8 rounded-3xl max-w-md w-full"
                  >
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle size={40} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-4">
                      {isRTL ? 'تنبيه: اشتراك غير نشط' : 'Alert: Inactive Subscription'}
                    </h2>
                    <p className="text-slate-400 mb-8">
                      {isRTL 
                        ? 'عذراً، يجب أن يكون لديك اشتراك نشط لتتمكن من استخدام ميزات النظام. يرجى تفعيل باقة اشتراك للمتابعة.' 
                        : 'Sorry, you must have an active subscription to use system features. Please activate a subscription plan to continue.'}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/subscriptions')}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20"
                    >
                      {isRTL ? 'الذهاب لصفحة الاشتراكات' : 'Go to Subscriptions'}
                    </motion.button>
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="min-h-full w-full"
                >
                  {children}
                </motion.div>
              )}
            </div>
          </main>


        <div className="flex-shrink-0">
          <Footer />
        </div>
      </div>
    </div>
  );
}
