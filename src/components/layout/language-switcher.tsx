"use client";

import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLocale } from '@/lib/locale-context';
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { locale, setLocale, isRTL } = useLocale();

  const toggleLocale = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    setLocale(newLocale);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLocale}
      className="relative flex items-center gap-2 h-9 px-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 group"
    >
      <Globe size={14} className="text-white/40 group-hover:text-violet-400 transition-colors" />
      <div className="flex items-center gap-1">
        <span className={cn(
          "text-[10px] font-black transition-colors",
          isRTL ? "text-violet-400" : "text-white/20"
        )}>
          AR
        </span>
        <span className="text-white/10 text-[8px]">|</span>
        <span className={cn(
          "text-[10px] font-black transition-colors",
          !isRTL ? "text-violet-400" : "text-white/20"
        )}>
          EN
        </span>
      </div>
    </motion.button>
  );
}
