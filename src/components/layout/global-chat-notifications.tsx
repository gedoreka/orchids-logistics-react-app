"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Bell } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface ChatNotification {
  id: number;
  companyName: string;
  message: string;
  time: string;
}

interface GlobalChatNotificationsProps {
  isAdmin: boolean;
}

export function GlobalChatNotifications({ isAdmin }: GlobalChatNotificationsProps) {
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastCheck, setLastCheck] = useState<number>(Date.now());
  const router = useRouter();
  const pathname = usePathname();

  const isOnChatPage = pathname?.includes("/admin/chat");

  const checkForNewMessages = useCallback(async () => {
    if (!isAdmin || isOnChatPage) return;

    try {
      const response = await fetch("/api/admin/chat?action=unread_count");
      const data = await response.json();
      
      if (data.unread_count > unreadCount && unreadCount > 0) {
        const companyResponse = await fetch("/api/admin/chat");
        const companyData = await companyResponse.json();
        
        const companiesWithNewMessages = companyData.companies?.filter(
          (c: any) => c.unread_count > 0
        );

        if (companiesWithNewMessages?.length > 0) {
          const latestCompany = companiesWithNewMessages[0];
          const newNotification: ChatNotification = {
            id: Date.now(),
            companyName: latestCompany.name,
            message: latestCompany.last_message?.substring(0, 50) + "...",
            time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
          };

          setNotifications(prev => [newNotification, ...prev.slice(0, 2)]);

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("رسالة جديدة - الدعم الفني", {
              body: `${latestCompany.name}: ${latestCompany.last_message?.substring(0, 50)}`,
              icon: "/favicon.ico"
            });
          }
        }
      }

      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error("Error checking for new messages:", error);
    }
  }, [isAdmin, isOnChatPage, unreadCount]);

  useEffect(() => {
    if (!isAdmin) return;

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    checkForNewMessages();

    const interval = setInterval(checkForNewMessages, 5000);

    return () => clearInterval(interval);
  }, [isAdmin, checkForNewMessages]);

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const goToChat = () => {
    router.push("/admin/chat");
    setNotifications([]);
  };

  if (!isAdmin || isOnChatPage) return null;

  return (
    <>
      {/* Floating notification badge in fixed position */}
      <AnimatePresence>
        {unreadCount > 0 && notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <motion.button
              onClick={goToChat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-500/40"
            >
              <MessageSquare size={24} />
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      <div className="fixed top-20 left-4 z-[9999] space-y-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.8 }}
              className="pointer-events-auto"
            >
              <div 
                className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-w-sm cursor-pointer"
                onClick={goToChat}
              >
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Bell size={16} className="animate-bounce" />
                    <span className="font-bold text-sm">رسالة جديدة</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(notification.id);
                    }}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">
                    {notification.companyName}
                  </h4>
                  <p className="text-slate-500 text-xs truncate">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {notification.time}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
