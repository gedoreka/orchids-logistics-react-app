"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./header";
import { Footer } from "./footer";
import { X } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    role: string;
    email: string;
  };
  permissions?: Record<string, number>;
}

export function DashboardLayout({ children, user, permissions }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      {/* Sidebar - Desktop - Fixed */}
      <aside className="hidden lg:flex fixed top-0 right-0 h-screen w-64 z-50">
        <Sidebar userRole={user?.role} permissions={permissions} />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-64 bg-[#0f172a] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <span className="text-white font-black">القائمة الرئيسية</span>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-white/50 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar userRole={user?.role} permissions={permissions} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Main Content Area - with margin for fixed sidebar */}
      <div className="lg:mr-64 flex flex-col min-h-screen w-full">
        {/* Header - Fixed at top */}
        <Header user={user} onToggleSidebar={() => setIsSidebarOpen(true)} />

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
