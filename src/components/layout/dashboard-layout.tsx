"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { motion } from "framer-motion";
import { Bell, User, Search, LogOut } from "lucide-react";

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
  return (
    <div className="flex min-h-screen bg-[var(--background)]" dir="rtl">
      <Sidebar userRole={user?.role} permissions={permissions} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-md group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3498db] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="البحث عن تقارير، عملاء، فواتير..."
                className="w-full bg-gray-50 border-none rounded-2xl py-2.5 pr-12 pl-4 text-sm focus:ring-2 focus:ring-[#3498db]/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-2xl bg-gray-50 text-gray-500 hover:text-[#3498db] hover:bg-[#3498db]/5 transition-all relative"
            >
              <Bell size={20} />
              <span className="absolute top-2.5 left-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </motion.button>

            <div className="h-10 w-[1px] bg-gray-100 mx-2" />

            <div className="flex items-center gap-3 pl-2">
              <div className="text-left flex flex-col items-end">
                <span className="text-sm font-black text-gray-900 leading-tight">{user?.name || "مستخدم"}</span>
                <span className="text-[10px] font-bold text-[#3498db] uppercase tracking-wider">{user?.role === "admin" ? "مدير النظام" : "مدير منشأة"}</span>
              </div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#3498db] to-[#764ba2] flex items-center justify-center text-white shadow-lg shadow-[#3498db]/20"
              >
                <User size={22} />
              </motion.div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
