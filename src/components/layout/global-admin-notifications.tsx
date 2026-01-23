"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Info, Megaphone, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AdminNotification {
  id: number;
  title: string;
  message: string;
  image_path?: string;
  created_at: string;
  sent_to_all: boolean;
}

export function GlobalAdminNotifications() {
  const [activeNotification, setActiveNotification] = useState<AdminNotification | null>(null);
  const [showCenterAlert, setShowCenterAlert] = useState(false);
  const lastCheckedIdRef = useRef<number>(0);
  const router = useRouter();

  const checkForNewNotifications = useCallback(async () => {
    try {
      // Get the last seen notification ID from localStorage to avoid showing the same one multiple times
      const lastSeenId = parseInt(localStorage.getItem("last_admin_notification_id") || "0");
      
      const response = await fetch(`/api/admin/notifications?limit=1&last_id=${lastSeenId}`);
      const data = await response.json();
      
      if (data.success && data.notifications && data.notifications.length > 0) {
        const latest = data.notifications[0];
        
        // Only show if it's actually new
        if (latest.id > lastSeenId) {
          setActiveNotification(latest);
          setShowCenterAlert(true);
          
          // Play sound
          try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.4;
            audio.play().catch(() => {});
          } catch (e) {}
        }
      }
    } catch (error) {
      console.error("Error checking for admin notifications:", error);
    }
  }, []);

  useEffect(() => {
    // Check every 30 seconds for admin announcements (less frequent than chat)
    checkForNewNotifications();
    const interval = setInterval(checkForNewNotifications, 30000);
    return () => clearInterval(interval);
  }, [checkForNewNotifications]);

  const handleDismiss = () => {
    if (activeNotification) {
      localStorage.setItem("last_admin_notification_id", activeNotification.id.toString());
    }
    setShowCenterAlert(false);
  };

  const handleViewDetails = () => {
    if (activeNotification) {
      localStorage.setItem("last_admin_notification_id", activeNotification.id.toString());
    }
    setShowCenterAlert(false);
    // Maybe we have a general notifications page for users? 
    // For now, just dismiss as the content is already shown in the modal
  };

  return (
    <AnimatePresence>
      {showCenterAlert && activeNotification && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative w-full max-w-lg overflow-hidden"
          >
            {/* Luxurious Card Design */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-white/20 dark:border-slate-800 overflow-hidden">
              
              {/* Header with Gradient */}
              <div className="bg-gradient-to-r from-[#2c3e50] via-[#34495e] to-[#2c3e50] p-8 text-white relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Megaphone size={120} />
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center animate-pulse">
                    <Bell size={28} className="text-amber-400" />
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-black tracking-tight">تنبيه إداري هام</h2>
                    <p className="text-white/60 font-bold text-xs uppercase tracking-widest mt-1">
                        {new Date(activeNotification.created_at).toLocaleDateString('en-US')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className="absolute top-6 left-6 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content Area */}
              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {activeNotification.title}
                  </h3>
                  <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border-2 border-slate-100 dark:border-slate-800">
                  <p className="text-slate-600 dark:text-slate-300 font-bold text-lg leading-relaxed text-right">
                    {activeNotification.message}
                  </p>
                </div>

                {activeNotification.image_path && (
                  <div className="rounded-3xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-lg">
                    <img 
                      src={activeNotification.image_path} 
                      alt="Notification content"
                      className="w-full h-48 object-cover"
                      onerror="this.style.display='none'"
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleViewDetails}
                    className="flex-1 bg-gradient-to-r from-[#3498db] to-[#2ecc71] text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3"
                  >
                    <span>فهمت، شكراً</span>
                    <ArrowLeft size={24} />
                  </motion.button>
                </div>
              </div>

              {/* Footer Decoration */}
              <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
