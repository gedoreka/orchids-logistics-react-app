"use client";

import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLocale } from '@/lib/locale-context';

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
      className="relative flex items-center gap-2 h-10 px-1 bg-slate-800/80 hover:bg-slate-700/80 rounded-full transition-all border border-white/10 overflow-hidden"
    >
      <motion.div
        className="absolute inset-y-1 w-[calc(50%-2px)] bg-gradient-to-r from-violet-500 to-purple-500 rounded-full shadow-lg"
        animate={{
          x: isRTL ? 2 : 'calc(100% + 2px)',
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      
      <div className="relative z-10 flex items-center gap-1 px-3 py-1.5">
        <span className={`text-xs font-bold transition-colors ${isRTL ? 'text-white' : 'text-white/50'}`}>
          عربي
        </span>
      </div>
      
      <div className="relative z-10 flex items-center gap-1 px-3 py-1.5">
        <span className={`text-xs font-bold transition-colors ${!isRTL ? 'text-white' : 'text-white/50'}`}>
          EN
        </span>
      </div>
    </motion.button>
  );
}
