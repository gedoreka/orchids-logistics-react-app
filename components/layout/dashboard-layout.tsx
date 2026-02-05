"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar } from "./sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./header";
import { Footer } from "./footer";
import { GlobalChatNotifications } from "./global-chat-notifications";
import { GlobalAdminNotifications } from "./global-admin-notifications";
import { X, AlertCircle } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { usePathname, useRouter } from "next/navigation";

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
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <div 
      className="h-screen overflow-hidden text-foreground transition-colors duration-300" 
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0d1525] to-[#0a0e1a] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/15 via-transparent to-transparent -z-10" />
      
      <GlobalChatNotifications isAdmin={user?.role === "admin"} companyId={user?.company_id} />
      <GlobalAdminNotifications />
      
      <aside className={`hidden lg:flex fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-screen w-64 z-50`}>
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
              <div className="absolute inset-0 bg-gradient-to-b from-[#0d1525] via-[#0a0e1a] to-[#080c15]" />
              <div className="relative z-10 flex items-center justify-between p-4 border-b border-white/5">
                <span className="text-white font-black text-sm">{isRTL ? 'القائمة الرئيسية' : 'Main Menu'}</span>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
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
