"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Bell, Headset, ArrowLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface ChatNotification {
  id: number;
  companyName: string;
  message: string;
  time: string;
  companyId?: number;
}

interface GlobalChatNotificationsProps {
  isAdmin: boolean;
}

export function GlobalChatNotifications({ isAdmin }: GlobalChatNotificationsProps) {
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showCenterAlert, setShowCenterAlert] = useState(false);
  const [centerAlertData, setCenterAlertData] = useState<ChatNotification | null>(null);
  const lastUnreadCountRef = useRef(0);
  const router = useRouter();
  const pathname = usePathname();

  const isOnChatPage = pathname?.includes("/admin/chat");

  const checkForNewMessages = useCallback(async () => {
    if (!isAdmin || isOnChatPage) return;

    try {
      const response = await fetch("/api/admin/chat?action=unread_count");
      const data = await response.json();
      const newUnreadCount = data.unread_count || 0;
      
      if (newUnreadCount > lastUnreadCountRef.current && lastUnreadCountRef.current >= 0) {
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
            message: latestCompany.last_message?.substring(0, 80) || "رسالة جديدة",
            time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
            companyId: latestCompany.id
          };

          setNotifications(prev => [newNotification, ...prev.slice(0, 2)]);
          
          setCenterAlertData(newNotification);
          setShowCenterAlert(true);
          setTimeout(() => setShowCenterAlert(false), 6000);

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("رسالة جديدة - دعم العملاء", {
              body: `${latestCompany.name}: ${latestCompany.last_message?.substring(0, 50)}`,
              icon: "/favicon.ico"
            });
          }

          try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {});
          } catch (e) {}
        }
      }

      lastUnreadCountRef.current = newUnreadCount;
      setUnreadCount(newUnreadCount);
    } catch (error) {
      console.error("Error checking for new messages:", error);
    }
  }, [isAdmin, isOnChatPage]);

  useEffect(() => {
    if (!isAdmin) return;

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    checkForNewMessages();

    const interval = setInterval(checkForNewMessages, 3000);

    return () => clearInterval(interval);
  }, [isAdmin, checkForNewMessages]);

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const goToChat = (companyId?: number) => {
    router.push("/admin/chat");
    setNotifications([]);
    setShowCenterAlert(false);
  };

  if (!isAdmin || isOnChatPage) return null;

  return (
    <>
      {/* Center Screen Alert - Big and Attractive */}
      <AnimatePresence>
        {showCenterAlert && centerAlertData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="pointer-events-auto"
            >
              <div 
                onClick={() => goToChat(centerAlertData.companyId)}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 max-w-md mx-4 cursor-pointer hover:scale-105 transition-transform border-4 border-white/20"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce">
                    <Headset size={32} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">رسالة جديدة!</h3>
                    <p className="text-white/80 text-sm">من دعم العملاء</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCenterAlert(false);
                    }}
                    className="absolute top-4 left-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
                      {centerAlertData.companyName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{centerAlertData.companyName}</h4>
                      <p className="text-white/60 text-xs">{centerAlertData.time}</p>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed">{centerAlertData.message}</p>
                </div>

                <button className="w-full bg-white text-indigo-600 font-bold py-4 rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg">
                  <span>الذهاب للرد</span>
                  <ArrowLeft size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating notification badge */}
      <AnimatePresence>
        {unreadCount > 0 && notifications.length === 0 && !showCenterAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <motion.button
              onClick={() => goToChat()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-5 rounded-2xl shadow-2xl shadow-indigo-500/40"
            >
              <MessageSquare size={28} />
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 min-w-[28px] h-[28px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
              <motion.div
                className="absolute inset-0 rounded-2xl bg-white/20"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner Toast notifications */}
      <div className="fixed top-24 left-6 z-[9998] space-y-4 pointer-events-none max-w-sm">
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
                className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-3xl transition-shadow"
                onClick={() => goToChat(notification.companyId)}
              >
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5, repeatDelay: 2 }}
                    >
                      <Bell size={18} />
                    </motion.div>
                    <span className="font-bold">رسالة جديدة</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(notification.id);
                    }}
                    className="text-white/70 hover:text-white transition-colors p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {notification.companyName.charAt(0)}
                    </div>
                    <h4 className="font-bold text-gray-800 truncate flex-1">
                      {notification.companyName}
                    </h4>
                  </div>
                  <p className="text-gray-500 text-sm truncate">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
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
