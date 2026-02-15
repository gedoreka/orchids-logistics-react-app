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
import { useLocale, useTranslations } from "@/lib/locale-context";
import { useTheme } from "next-themes";

export function Footer() {
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [systemStatus, setSystemStatus] = useState({ cpu: 23, memory: 45, latency: 42 });
  const { isRTL } = useLocale();
  const t = useTranslations('footer');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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
    <footer className={cn(
      "w-full no-print mt-auto relative overflow-hidden",
      !isDark && "bg-gradient-to-r from-[#dbe4ff] via-[#c7d2f8] to-[#d0d0f0]"
    )}>
        {/* Glass effect - dark mode only */}
        {isDark && <div className="absolute inset-0 backdrop-blur-2xl bg-white/[0.03]" />}
        {isDark && <div className="absolute inset-0 bg-gradient-to-r from-white/[0.04] via-transparent to-white/[0.04]" />}
        <div className={`absolute top-0 left-0 right-0 h-[1px] ${isDark ? 'bg-gradient-to-r from-transparent via-white/[0.15] to-transparent' : 'bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent'}`} />
      
      <div className="relative z-10 max-w-[1800px] mx-auto px-4 md:px-6 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className={cn("hidden sm:flex items-center gap-1.5 text-[10px] font-bold", isDark ? "text-white/30" : "text-black")}>
                  <Copyright size={10} />
                  <span>2026 {t('copyright')}</span>
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
                    <span className={cn("text-[10px] font-bold", isDark ? "text-emerald-400" : "text-black")}>{t('online')}</span>
                </>
              ) : (
                <>
                  <WifiOff size={12} className="text-rose-400" />
                  <span className="text-[10px] font-bold text-rose-400">{t('offline')}</span>
                </>
              )}
            </motion.div>

            <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl border", isDark ? "bg-white/5 border-white/10" : "bg-white/30 border-indigo-200/30")}>
                  <Server size={12} className="text-blue-400" />
                  <span className={cn("text-[10px] font-bold", isDark ? "text-white/50" : "text-black")}>CPU</span>
                  <span className={cn("text-[10px] font-bold", isDark ? "text-blue-400" : "text-black")}>{systemStatus.cpu}%</span>
              </div>

            <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl border", isDark ? "bg-white/5 border-white/10" : "bg-white/30 border-indigo-200/30")}>
                <Activity size={12} className="text-purple-400" />
                <span className={cn("text-[10px] font-bold", isDark ? "text-white/50" : "text-black")}>{isRTL ? 'الذاكرة' : 'Memory'}</span>
                  <span className={cn("text-[10px] font-bold", isDark ? "text-purple-400" : "text-black")}>{systemStatus.memory}%</span>
              </div>

              <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl border", isDark ? "bg-white/5 border-white/10" : "bg-white/30 border-indigo-200/30")}>
                  <Zap size={12} className="text-amber-400" />
                  <span className={cn("text-[10px] font-bold", isDark ? "text-white/50" : "text-black")}>Latency</span>
                <span className={cn("text-[10px] font-bold", isDark ? "text-amber-400" : "text-black")}>{systemStatus.latency}ms</span>
              </div>
            </div>

            <div className="flex items-center flex-wrap justify-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl border", isDark ? "bg-blue-500/5 border-blue-500/10" : "bg-white/30 border-indigo-200/30")}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className={cn("text-[10px] font-bold", isDark ? "text-blue-400" : "text-black")}>
                      {isRTL ? 'نسخة النظام الحالي 1.4' : 'System Version 1.4'}
                </span>
              </motion.div>

              <motion.a 
                whileHover={{ scale: 1.05, y: -2 }}
                href="mailto:Info@zoolspeed.com"
                className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all group", isDark ? "bg-white/5 hover:bg-white/10 border-white/10 hover:border-blue-500/30" : "bg-white/30 hover:bg-white/50 border-indigo-200/30 hover:border-indigo-300/50")}
              >
                <div className="p-1 rounded-md bg-blue-500/20">
                  <Mail size={10} className="text-blue-400" />
                  </div>
                  <span className={cn("text-[10px] font-bold transition-colors", isDark ? "text-white/50 group-hover:text-white/80" : "text-black")}>Info@zoolspeed.com</span>
              </motion.a>

            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              onClick={() => copyToClipboard("+966534907721", "ksa")}
              className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all group", isDark ? "bg-white/5 hover:bg-white/10 border-white/10 hover:border-emerald-500/30" : "bg-white/30 hover:bg-white/50 border-indigo-200/30 hover:border-emerald-300/50")}
            >
              <div className="p-1 rounded-md bg-emerald-500/20">
                  <Phone size={10} className="text-emerald-400" />
                </div>
                <span className={cn("text-[10px] font-bold transition-colors", isDark ? "text-white/50 group-hover:text-white/80" : "text-black")} dir="ltr">+966 53 490 7721</span>
              {copiedPhone === "ksa" ? (
                <Check size={10} className="text-emerald-500" />
              ) : (
                <Copy size={10} className="opacity-0 group-hover:opacity-100 text-white/30 transition-opacity" />
              )}
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              onClick={() => copyToClipboard("+249921163000", "sdn")}
              className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all group", isDark ? "bg-white/5 hover:bg-white/10 border-white/10 hover:border-amber-500/30" : "bg-white/30 hover:bg-white/50 border-indigo-200/30 hover:border-amber-300/50")}
            >
              <div className="p-1 rounded-md bg-amber-500/20">
                <Globe size={10} className="text-amber-400" />
                </div>
                <span className={cn("text-[10px] font-bold transition-colors", isDark ? "text-white/50 group-hover:text-white/80" : "text-black")} dir="ltr">+249 92 116 3000</span>
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
                <span className={cn("text-[10px] font-bold", isDark ? "text-emerald-400" : "text-black")}>SSL Secured</span>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}
