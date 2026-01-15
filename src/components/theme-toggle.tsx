"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn(
        "relative p-2.5 rounded-xl bg-white/5 border border-white/10",
        className
      )}>
        <div className="w-5 h-5" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative p-2.5 rounded-xl overflow-hidden transition-all duration-300",
        "group focus:outline-none focus:ring-2 focus:ring-offset-2",
        isDark
          ? "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-lg shadow-purple-500/30 focus:ring-purple-500"
          : "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 shadow-lg shadow-orange-500/30 focus:ring-orange-500",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-white/20 blur-sm" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sparkles className="w-8 h-8 text-white/30" />
        </motion.div>
      </div>

      <div className="relative w-5 h-5">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon className="w-5 h-5 text-white drop-shadow-lg" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: 90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: -90, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun className="w-5 h-5 text-white drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className="absolute inset-0 rounded-xl"
        animate={{
          boxShadow: isDark
            ? "0 0 20px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 0 20px rgba(251, 146, 60, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
        transition={{ duration: 0.3 }}
      />

      <span className="sr-only">
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </motion.button>
  );
}

export function ThemeToggleWithLabel({ className }: { className?: string }) {
  const [mounted, setMounted] = React.useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300",
        "border backdrop-blur-sm",
        isDark
          ? "bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50"
          : "bg-white/50 border-gray-200 hover:bg-gray-100/50",
        className
      )}
    >
      <div className={cn(
        "relative p-2 rounded-lg transition-all duration-300",
        isDark
          ? "bg-gradient-to-br from-indigo-600 to-purple-600"
          : "bg-gradient-to-br from-amber-400 to-orange-500"
      )}>
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="w-4 h-4 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className={cn(
        "text-sm font-bold transition-colors",
        isDark ? "text-white/80" : "text-gray-700"
      )}>
        {isDark ? "Dark Mode" : "Light Mode"}
      </span>
    </motion.button>
  );
}
