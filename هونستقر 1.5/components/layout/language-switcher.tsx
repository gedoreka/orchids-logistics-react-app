"use client";

import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useLocale, type Locale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";

const localeOptions: { code: Locale; label: string }[] = [
  { code: "ar", label: "AR" },
  { code: "en", label: "EN" },
  { code: "ur", label: "UR" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-1.5 backdrop-blur-md">
      <Globe size={14} className="text-cyan-300/70" />
      <div className="flex items-center gap-1">
        {localeOptions.map((option) => {
          const isActive = locale === option.code;
          return (
            <motion.button
              key={option.code}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocale(option.code)}
              className={cn(
                "h-7 min-w-10 rounded-lg px-2 text-[10px] font-black transition-all",
                isActive
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              )}
              aria-label={`Switch language to ${option.code}`}
            >
              {option.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
