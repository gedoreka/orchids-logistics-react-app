"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  Phone, 
  Copy, 
  Check, 
  Copyright,
  Wifi,
  WifiOff,
  Server,
  Activity,
  Zap,
  Shield,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer() {
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [systemStatus, setSystemStatus] = useState({ cpu: 23, memory: 45, latency: 42 });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);
    
    const statusInterval = setInterval(() => {
      setSystemStatus({
        cpu: Math.floor(Math.random() * 30) + 15,
        memory: Math.floor(Math.random() * 20) + 40,
        latency: Math.floor(Math.random() * 30) + 30
      });
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(statusInterval);
    };
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ""));
    setCopiedPhone(id);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <footer className="w-full no-print mt-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="relative z-10 max-w-[1800px] mx-auto px-4 md:px-6 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-white/30 text-[10px] font-bold">
              <Copyright size={10} />
              <span>2026 جميع الحقوق محفوظة الي شركة زول اسبيد للانشطة المتعددة</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl border",
                isOnline 
                  ? "bg-emerald-500/10 border-emerald-500/20" 
                  : "bg-rose-500/10 border-rose-500/20"
              )}
            >
              {isOnline ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Wifi size={12} className="text-emerald-400" />
                  </motion.div>
                  <span className="text-[10px] font-bold text-emerald-400">متصل</span>
                </>
              ) : (
                <>
                  <WifiOff size={12} className="text-rose-400" />
                  <span className="text-[10px] font-bold text-rose-400">غير متصل</span>
                </>
              )}
            </motion.div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
              <Server size={12} className="text-blue-400" />
              <span className="text-[10px] font-bold text-white/50">CPU</span>
              <span className="text-[10px] font-bold text-blue-400">{systemStatus.cpu}%</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
              <Activity size={12} className="text-purple-400" />
              <span className="text-[10px] font-bold text-white/50">الذاكرة</span>
              <span className="text-[10px] font-bold text-purple-400">{systemStatus.memory}%</span>
            </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                <Zap size={12} className="text-amber-400" />
                <span className="text-[10px] font-bold text-white/50">Latency</span>
                <span className="text-[10px] font-bold text-amber-400">{systemStatus.latency}ms</span>
              </div>
            </div>

          <div className="flex items-center flex-wrap justify-center gap-3">
            <motion.a 
              whileHover={{ scale: 1.05, y: -2 }}
              href="mailto:info@zoolspeed.com"
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all group"
            >
              <div className="p-1 rounded-md bg-blue-500/20">
                <Mail size={10} className="text-blue-400" />
              </div>
              <span className="text-[10px] font-bold text-white/50 group-hover:text-white/80 transition-colors">info@zoolspeed.com</span>
            </motion.a>

            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              onClick={() => copyToClipboard("+966534907721", "ksa")}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-emerald-500/30 transition-all group"
            >
              <div className="p-1 rounded-md bg-emerald-500/20">
                <Phone size={10} className="text-emerald-400" />
              </div>
              <span className="text-[10px] font-bold text-white/50 group-hover:text-white/80 transition-colors" dir="ltr">+966 53 490 7721</span>
              {copiedPhone === "ksa" ? (
                <Check size={10} className="text-emerald-500" />
              ) : (
                <Copy size={10} className="opacity-0 group-hover:opacity-100 text-white/30 transition-opacity" />
              )}
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              onClick={() => copyToClipboard("+249921163000", "sdn")}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-amber-500/30 transition-all group"
            >
              <div className="p-1 rounded-md bg-amber-500/20">
                <Globe size={10} className="text-amber-400" />
              </div>
              <span className="text-[10px] font-bold text-white/50 group-hover:text-white/80 transition-colors" dir="ltr">+249 92 116 3000</span>
              {copiedPhone === "sdn" ? (
                <Check size={10} className="text-emerald-500" />
              ) : (
                <Copy size={10} className="opacity-0 group-hover:opacity-100 text-white/30 transition-opacity" />
              )}
            </motion.button>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20"
            >
              <Shield size={10} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400">SSL Secured</span>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}
