"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./header";
import { Footer } from "./footer";
import { GlobalChatNotifications } from "./global-chat-notifications";
import { GlobalAdminNotifications } from "./global-admin-notifications";
import { X } from "lucide-react";

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
}

export function DashboardLayout({ children, user, permissions, userType }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRTL, setIsRTL] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.company_id || user?.role === "admin") return;
    try {
      const response = await fetch(`/api/admin/chat?company_id=${user.company_id}&action=client_unread`);
      const data = await response.json();
      if (data.unread_count !== undefined) {
        setUnreadChatCount(data.unread_count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [user?.company_id, user?.role]);

  useEffect(() => {
    setMounted(true);
    const dir = document.documentElement.dir;
    setIsRTL(dir === 'rtl');
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  if (!mounted) {
    return (
      <div className="h-screen overflow-hidden bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

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
          <Header user={user} onToggleSidebar={() => setIsSidebarOpen(true)} unreadChatCount={unreadChatCount} />
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="min-h-full w-full"
          >
            {children}
          </motion.div>
        </main>

        <div className="flex-shrink-0">
          <Footer />
        </div>
      </div>
    </div>
  );
}
