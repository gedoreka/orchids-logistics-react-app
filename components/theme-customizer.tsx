"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Palette, Check, Sun, Moon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-context";

// Light mode accent themes
const lightThemes = [
  {
    id: "default",
    name: { ar: "الافتراضي", en: "Default" },
    desc: { ar: "الثيم الأساسي الأصلي", en: "Original default theme" },
    pageBg: "#F9FAFB",
    cardBg: "rgba(255,255,255,0.6)",
    cardBorder: "rgba(226,232,240,0.60)",
    textPrimary: "#000000",
    textSecondary: "#334155",
    accent: "#3b82f6",
    accentLight: "rgba(59,130,246,0.08)",
    preview: ["#F9FAFB", "#ffffff", "#3b82f6"],
  },
  {
    id: "rose-gold",
    name: { ar: "ذهبي وردي", en: "Rose Gold" },
    desc: { ar: "أنيق ودافئ بلمسة وردية", en: "Elegant warm rose tones" },
    pageBg: "#FDF2F4",
    cardBg: "rgba(255,241,244,0.7)",
    cardBorder: "rgba(244,163,186,0.35)",
    textPrimary: "#1a1a2e",
    textSecondary: "#4a3f55",
    accent: "#e11d48",
    accentLight: "rgba(225,29,72,0.06)",
    preview: ["#FDF2F4", "#fff1f4", "#e11d48"],
  },
  {
    id: "ocean-breeze",
    name: { ar: "نسيم المحيط", en: "Ocean Breeze" },
    desc: { ar: "هادئ ومنعش كأمواج البحر", en: "Calm refreshing ocean feel" },
    pageBg: "#F0F9FF",
    cardBg: "rgba(224,242,254,0.6)",
    cardBorder: "rgba(125,211,252,0.30)",
    textPrimary: "#0c1929",
    textSecondary: "#1e3a5f",
    accent: "#0284c7",
    accentLight: "rgba(2,132,199,0.06)",
    preview: ["#F0F9FF", "#e0f2fe", "#0284c7"],
  },
  {
    id: "forest-mint",
    name: { ar: "غابة النعناع", en: "Forest Mint" },
    desc: { ar: "طبيعي ومريح للعين", en: "Natural eye-friendly greens" },
    pageBg: "#F0FDF4",
    cardBg: "rgba(220,252,231,0.55)",
    cardBorder: "rgba(134,239,172,0.30)",
    textPrimary: "#052e16",
    textSecondary: "#14532d",
    accent: "#059669",
    accentLight: "rgba(5,150,105,0.06)",
    preview: ["#F0FDF4", "#dcfce7", "#059669"],
  },
  {
    id: "royal-purple",
    name: { ar: "بنفسجي ملكي", en: "Royal Purple" },
    desc: { ar: "فاخر وعصري بلمسة ملكية", en: "Luxurious regal purple" },
    pageBg: "#FAF5FF",
    cardBg: "rgba(243,232,255,0.6)",
    cardBorder: "rgba(196,181,253,0.35)",
    textPrimary: "#1a0a2e",
    textSecondary: "#3b1f6e",
    accent: "#7c3aed",
    accentLight: "rgba(124,58,237,0.06)",
    preview: ["#FAF5FF", "#f3e8ff", "#7c3aed"],
  },
];

// Dark mode accent themes
const darkThemes = [
  {
    id: "default",
    name: { ar: "الافتراضي", en: "Default" },
    desc: { ar: "الثيم الليلي الأصلي", en: "Original dark theme" },
    pageBg: "hsl(222.2,84%,4.9%)",
    cardBg: "rgba(15,23,42,0.9)",
    cardBorder: "rgba(255,255,255,0.05)",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    accent: "#3b82f6",
    accentLight: "rgba(59,130,246,0.10)",
    preview: ["#0a0e1a", "#0f172a", "#3b82f6"],
  },
  {
    id: "crimson-night",
    name: { ar: "ليلة قرمزية", en: "Crimson Night" },
    desc: { ar: "داكن عميق بلمسات حمراء", en: "Deep dark with red accents" },
    pageBg: "#0c0a0e",
    cardBg: "rgba(25,10,18,0.9)",
    cardBorder: "rgba(220,38,38,0.12)",
    textPrimary: "#fce7f3",
    textSecondary: "#a78baf",
    accent: "#dc2626",
    accentLight: "rgba(220,38,38,0.08)",
    preview: ["#0c0a0e", "#190a12", "#dc2626"],
  },
  {
    id: "cyber-teal",
    name: { ar: "تيل سايبر", en: "Cyber Teal" },
    desc: { ar: "مستقبلي بألوان النيون", en: "Futuristic neon teal vibes" },
    pageBg: "#021a1a",
    cardBg: "rgba(2,30,30,0.9)",
    cardBorder: "rgba(20,184,166,0.12)",
    textPrimary: "#ccfbf1",
    textSecondary: "#5eead4",
    accent: "#14b8a6",
    accentLight: "rgba(20,184,166,0.08)",
    preview: ["#021a1a", "#021e1e", "#14b8a6"],
  },
  {
    id: "midnight-gold",
    name: { ar: "ذهب منتصف الليل", en: "Midnight Gold" },
    desc: { ar: "فاخر كالذهب في الظلام", en: "Luxurious gold on dark" },
    pageBg: "#0d0b07",
    cardBg: "rgba(20,16,10,0.9)",
    cardBorder: "rgba(245,158,11,0.12)",
    textPrimary: "#fef3c7",
    textSecondary: "#d97706",
    accent: "#f59e0b",
    accentLight: "rgba(245,158,11,0.08)",
    preview: ["#0d0b07", "#14100a", "#f59e0b"],
  },
  {
    id: "aurora-violet",
    name: { ar: "شفق بنفسجي", en: "Aurora Violet" },
    desc: { ar: "سحري كأضواء الشفق القطبي", en: "Magical aurora lights" },
    pageBg: "#0a0515",
    cardBg: "rgba(15,8,30,0.9)",
    cardBorder: "rgba(139,92,246,0.12)",
    textPrimary: "#ede9fe",
    textSecondary: "#a78bfa",
    accent: "#8b5cf6",
    accentLight: "rgba(139,92,246,0.08)",
    preview: ["#0a0515", "#0f081e", "#8b5cf6"],
  },
];

function getStoredTheme(mode: "light" | "dark"): string {
  if (typeof window === "undefined") return "default";
  return localStorage.getItem(`accent-theme-${mode}`) || "default";
}

function storeTheme(mode: "light" | "dark", id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`accent-theme-${mode}`, id);
}

export function applyAccentTheme() {
  if (typeof window === "undefined") return;
  const isDark = document.documentElement.classList.contains("dark");
  const mode = isDark ? "dark" : "light";
  const themeId = getStoredTheme(mode);
  const themes = mode === "light" ? lightThemes : darkThemes;
  const theme = themes.find((t) => t.id === themeId) || themes[0];

  const html = document.documentElement;
  html.style.setProperty("--accent-page-bg", theme.pageBg);
  html.style.setProperty("--accent-card-bg", theme.cardBg);
  html.style.setProperty("--accent-card-border", theme.cardBorder);
  html.style.setProperty("--accent-text-primary", theme.textPrimary);
  html.style.setProperty("--accent-text-secondary", theme.textSecondary);
  html.style.setProperty("--accent-color", theme.accent);
  html.style.setProperty("--accent-color-light", theme.accentLight);
  html.setAttribute("data-accent", themeId);
}

export function ThemeCustomizer() {
  const { resolvedTheme } = useTheme();
  const { locale } = useLocale();
  const isRTL = locale === "ar";
  const isDark = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);
  const [selectedLight, setSelectedLight] = useState("default");
  const [selectedDark, setSelectedDark] = useState("default");

  useEffect(() => {
    setMounted(true);
    setSelectedLight(getStoredTheme("light"));
    setSelectedDark(getStoredTheme("dark"));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyAccentTheme();
  }, [resolvedTheme, mounted]);

  const handleSelect = (mode: "light" | "dark", id: string) => {
    if (mode === "light") setSelectedLight(id);
    else setSelectedDark(id);
    storeTheme(mode, id);

    // Apply if current mode matches
    const currentMode = isDark ? "dark" : "light";
    if (currentMode === mode) {
      applyAccentTheme();
      // Small delay to re-apply after next-themes may reset
      setTimeout(applyAccentTheme, 100);
    }
  };

  if (!mounted) return null;

  const lang = (obj: { ar: string; en: string }) => (isRTL ? obj.ar : obj.en);

  return (
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className={cn("p-2.5 rounded-xl border", isDark ? "bg-violet-500/10 border-violet-500/20" : "bg-violet-50 border-violet-200")}>
            <Palette size={20} className={isDark ? "text-violet-400" : "text-violet-600"} />
          </div>
          <div>
            <h2 className={cn("text-xl font-black tracking-tight", isDark ? "text-white" : "text-slate-800")} data-no-gradient>
              {isRTL ? "تخصيص المظهر" : "Theme Customization"}
            </h2>
            <p className={cn("text-xs mt-0.5 font-medium", isDark ? "text-slate-500" : "text-slate-500")}>
              {isRTL ? "اختر ثيم مختلف لكل وضع حسب مزاجك" : "Pick a theme for each mode to match your mood"}
            </p>
          </div>
        </div>

        {/* Light Mode Themes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Sun size={16} className="text-amber-500" />
            <span className={cn("text-sm font-black", isDark ? "text-white/80" : "text-slate-700")}>
              {isRTL ? "ثيمات الوضع النهاري" : "Light Mode Themes"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lightThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                selected={selectedLight === theme.id}
                onSelect={() => handleSelect("light", theme.id)}
                lang={lang}
                mode="light"
                currentIsDark={isDark}
              />
            ))}
          </div>
        </div>

        {/* Dark Mode Themes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Moon size={16} className="text-blue-400" />
            <span className={cn("text-sm font-black", isDark ? "text-white/80" : "text-slate-700")}>
              {isRTL ? "ثيمات الوضع الليلي" : "Dark Mode Themes"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {darkThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                selected={selectedDark === theme.id}
                onSelect={() => handleSelect("dark", theme.id)}
                lang={lang}
                mode="dark"
                currentIsDark={isDark}
              />
            ))}
          </div>
        </div>
      </section>
    );
}

function ThemeCard({
  theme,
  selected,
  onSelect,
  lang,
  mode,
  currentIsDark,
}: {
  theme: (typeof lightThemes)[0];
  selected: boolean;
  onSelect: () => void;
  lang: (obj: { ar: string; en: string }) => string;
  mode: "light" | "dark";
  currentIsDark: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={cn(
        "relative group p-4 rounded-2xl border-2 transition-all duration-300 text-start w-full",
        selected
          ? currentIsDark
            ? "border-blue-500 shadow-[0_0_24px_rgba(99,102,241,0.15)] bg-white/5"
            : "border-blue-500 shadow-[0_0_24px_rgba(99,102,241,0.12)] bg-blue-50/50"
          : currentIsDark
            ? "border-white/10 hover:border-white/20"
            : "border-slate-200 hover:border-slate-300 bg-white/40"
      )}
      style={selected ? { borderColor: theme.accent } : undefined}
    >
      {/* Selected Badge */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -right-2 rtl:-left-2 rtl:right-auto w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: theme.accent }}
          >
            <Check size={12} className="text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Colors */}
      <div className="flex gap-2 mb-3">
        {theme.preview.map((color, i) => (
          <div
            key={i}
            className={cn(
              "rounded-lg transition-all",
              i === 0
                ? "w-12 h-10"
                : i === 1
                  ? "w-10 h-10"
                  : "w-8 h-10 rounded-xl"
            )}
            style={{
              background: color,
              border: `1px solid ${mode === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
              boxShadow: i === 2 ? `0 4px 12px ${color}40` : undefined,
            }}
          />
        ))}
        {/* Mini card preview */}
        <div
          className="flex-1 h-10 rounded-lg"
          style={{
            background: theme.cardBg,
            border: `1px solid ${theme.cardBorder}`,
          }}
        />
      </div>

      {/* Name & Description */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-black", currentIsDark ? "text-white/90" : "text-slate-800")}>{lang(theme.name)}</span>
          {theme.id !== "default" && (
            <Sparkles size={10} className={currentIsDark ? "text-white/30" : "text-slate-400"} />
          )}
        </div>
        <p className={cn("text-[10px] font-medium leading-relaxed", currentIsDark ? "text-slate-400" : "text-slate-500")}>
          {lang(theme.desc)}
        </p>
      </div>
    </motion.button>
  );
}
