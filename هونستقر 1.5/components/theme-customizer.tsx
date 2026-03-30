"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { Palette, Check, Sun, Moon, Sparkles, X, RotateCcw, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-context";

// ============================================================
// Extended Theme Definition
// ============================================================
interface ThemeVars {
  // Core Tailwind CSS variables (HSL format "H S% L%")
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accentVar: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;

  // Sidebar
  sidebar: string;
  sidebarForeground: string;
  sidebarBorder: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;

  // Extended UI variables (raw CSS values)
  cardShadow: string;
  hoverShadow: string;
  glassBg: string;
  glassBorder: string;

  // Header / Footer
  headerBg: string;
  headerBorder: string;
  headerText: string;

  // Page background
  pageBg: string;

  // Table
  tableHeaderBg: string;
  tableRowHover: string;
  tableBorder: string;

  // Input focus
  inputFocusBorder: string;
  inputFocusRing: string;

  // Badge / Status
  successBg: string;
  successText: string;
  warningBg: string;
  warningText: string;
  dangerBg: string;
  dangerText: string;
  infoBg: string;
  infoText: string;

  // Heading gradient (for light mode fancy headings)
  headingGradient: string;

  // Scrollbar
  scrollbarTrack: string;
  scrollbarThumb: string;

  // Charts
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;

  // Fonts
  headingFont: string;
  bodyFont: string;

  // Font colors
  headingColor: string;
  subheadingColor: string;
  bodyTextColor: string;
  helperTextColor: string;
  linkColor: string;
  linkHoverColor: string;
  labelColor: string;
  statNumberColor: string;
}

interface ThemeDef {
  id: string;
  name: { ar: string; en: string };
  desc: { ar: string; en: string };
  preview: string[];
  accent: string;
  vars: ThemeVars;
}

// ============================================================
// LIGHT THEMES
// ============================================================
export const lightThemes: ThemeDef[] = [
  {
    id: "default",
    name: { ar: "الافتراضي", en: "Default" },
    desc: { ar: "الثيم الأساسي الأصلي", en: "Original default theme" },
    preview: ["#F9FAFB", "#ffffff", "#3b82f6"],
    accent: "#3b82f6",
    vars: {
      background: "210 20% 98%",
      foreground: "222 47% 11%",
      card: "0 0% 100%",
      cardForeground: "222 47% 11%",
      popover: "0 0% 100%",
      popoverForeground: "222 47% 11%",
      primary: "217 91% 60%",
      primaryForeground: "0 0% 100%",
      secondary: "220 14% 96%",
      secondaryForeground: "222 47% 11%",
      muted: "220 14% 96%",
      mutedForeground: "220 9% 46%",
      accentVar: "220 14% 96%",
      accentForeground: "222 47% 11%",
      destructive: "0 84% 60%",
      border: "220 13% 91%",
      input: "220 13% 91%",
      ring: "224 76% 48%",
      sidebar: "222 84% 7%",
      sidebarForeground: "210 40% 90%",
      sidebarBorder: "217 33% 16%",
      sidebarAccent: "217 33% 13%",
      sidebarAccentForeground: "210 40% 98%",
      cardShadow: "0 8px 32px rgba(0,0,0,0.04)",
      hoverShadow: "0 12px 40px rgba(0,0,0,0.08)",
      glassBg: "rgba(255,255,255,0.6)",
      glassBorder: "rgba(255,255,255,0.3)",
      headerBg: "linear-gradient(to right, #dbe4ff, #c7d2f8, #d0d0f0)",
      headerBorder: "rgba(99,102,241,0.12)",
      headerText: "#1e293b",
      pageBg: "#F9FAFB",
      tableHeaderBg: "rgba(226,232,240,0.40)",
      tableRowHover: "rgba(241,245,249,0.25)",
      tableBorder: "rgba(226,232,240,0.20)",
      inputFocusBorder: "#94a3b8",
      inputFocusRing: "rgba(226,232,240,0.20)",
      successBg: "rgba(16,185,129,0.1)",
      successText: "#059669",
      warningBg: "rgba(245,158,11,0.1)",
      warningText: "#d97706",
      dangerBg: "rgba(239,68,68,0.1)",
      dangerText: "#dc2626",
      infoBg: "rgba(59,130,246,0.1)",
      infoText: "#2563eb",
      headingGradient: "linear-gradient(135deg, #ec4899, #f97316)",
      scrollbarTrack: "#f1f5f9",
      scrollbarThumb: "#cbd5e1",
      chart1: "220 70% 50%",
      chart2: "160 60% 45%",
      chart3: "30 80% 55%",
      chart4: "280 65% 60%",
      chart5: "340 75% 55%",
      headingFont: "'Cairo', 'Tajawal', sans-serif",
      bodyFont: "'Tajawal', 'Segoe UI', sans-serif",
      headingColor: "#000000",
      subheadingColor: "#0f172a",
      bodyTextColor: "#1e293b",
      helperTextColor: "#475569",
      linkColor: "#2563eb",
      linkHoverColor: "#1d4ed8",
      labelColor: "#334155",
      statNumberColor: "#000000",
    },
  },

];

// ============================================================
// DARK THEMES
// ============================================================
export const darkThemes: ThemeDef[] = [
  {
    id: "default",
    name: { ar: "الافتراضي", en: "Default" },
    desc: { ar: "الثيم الليلي الأصلي", en: "Original dark theme" },
    preview: ["#0a0e1a", "#0f172a", "#3b82f6"],
    accent: "#3b82f6",
    vars: {
      background: "222 84% 5%",
      foreground: "210 40% 98%",
      card: "222 84% 9%",
      cardForeground: "210 40% 98%",
      popover: "222 84% 9%",
      popoverForeground: "210 40% 98%",
      primary: "217 91% 60%",
      primaryForeground: "222 47% 11%",
      secondary: "217 33% 18%",
      secondaryForeground: "210 40% 98%",
      muted: "217 33% 18%",
      mutedForeground: "215 20% 65%",
      accentVar: "217 33% 18%",
      accentForeground: "210 40% 98%",
      destructive: "0 63% 51%",
      border: "217 33% 18%",
      input: "217 33% 18%",
      ring: "224 76% 48%",
      sidebar: "222 84% 7%",
      sidebarForeground: "210 40% 90%",
      sidebarBorder: "217 33% 16%",
      sidebarAccent: "217 33% 13%",
      sidebarAccentForeground: "210 40% 98%",
      cardShadow: "0 4px 12px rgba(0,0,0,0.3)",
      hoverShadow: "0 8px 24px rgba(0,0,0,0.4)",
      glassBg: "rgba(15,23,42,0.9)",
      glassBorder: "rgba(255,255,255,0.05)",
      headerBg: "rgba(15,23,42,0.95)",
      headerBorder: "rgba(255,255,255,0.05)",
      headerText: "#f8fafc",
      pageBg: "hsl(222,84%,5%)",
      tableHeaderBg: "rgba(30,41,59,0.5)",
      tableRowHover: "rgba(30,41,59,0.3)",
      tableBorder: "rgba(255,255,255,0.05)",
      inputFocusBorder: "#3b82f6",
      inputFocusRing: "rgba(59,130,246,0.2)",
      successBg: "rgba(16,185,129,0.15)",
      successText: "#34d399",
      warningBg: "rgba(245,158,11,0.15)",
      warningText: "#fbbf24",
      dangerBg: "rgba(239,68,68,0.15)",
      dangerText: "#f87171",
      infoBg: "rgba(59,130,246,0.15)",
      infoText: "#60a5fa",
      headingGradient: "linear-gradient(135deg, #60a5fa, #a78bfa)",
      scrollbarTrack: "hsl(217,33%,12%)",
      scrollbarThumb: "hsl(215,20%,35%)",
      chart1: "220 70% 50%",
      chart2: "160 60% 45%",
      chart3: "30 80% 55%",
      chart4: "280 65% 60%",
      chart5: "340 75% 55%",
      headingFont: "'Cairo', 'Tajawal', sans-serif",
      bodyFont: "'Tajawal', 'Segoe UI', sans-serif",
      headingColor: "#f8fafc",
      subheadingColor: "#e2e8f0",
      bodyTextColor: "#cbd5e1",
      helperTextColor: "#94a3b8",
      linkColor: "#60a5fa",
      linkHoverColor: "#93c5fd",
      labelColor: "#94a3b8",
      statNumberColor: "#f8fafc",
    },
  },

];

// ============================================================
// Storage helpers
// ============================================================
function getStoredTheme(mode: "light" | "dark"): string {
  if (typeof window === "undefined") return "default";
  return localStorage.getItem(`accent-theme-${mode}`) || "default";
}

function storeTheme(mode: "light" | "dark", id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`accent-theme-${mode}`, id);
}

// ============================================================
// Apply theme - sets ALL CSS variables on :root
// ============================================================
export function applyAccentTheme() {
  if (typeof window === "undefined") return;
  const isDark = document.documentElement.classList.contains("dark");
  const mode = isDark ? "dark" : "light";
  const themeId = getStoredTheme(mode);
  const themes = mode === "light" ? lightThemes : darkThemes;
  const theme = themes.find((t) => t.id === themeId) || themes[0];

  const html = document.documentElement;
  const v = theme.vars;

  // Core Tailwind CSS variables
  html.style.setProperty("--background", v.background);
  html.style.setProperty("--foreground", v.foreground);
  html.style.setProperty("--card", v.card);
  html.style.setProperty("--card-foreground", v.cardForeground);
  html.style.setProperty("--popover", v.popover);
  html.style.setProperty("--popover-foreground", v.popoverForeground);
  html.style.setProperty("--primary", v.primary);
  html.style.setProperty("--primary-foreground", v.primaryForeground);
  html.style.setProperty("--secondary", v.secondary);
  html.style.setProperty("--secondary-foreground", v.secondaryForeground);
  html.style.setProperty("--muted", v.muted);
  html.style.setProperty("--muted-foreground", v.mutedForeground);
  html.style.setProperty("--accent", v.accentVar);
  html.style.setProperty("--accent-foreground", v.accentForeground);
  html.style.setProperty("--destructive", v.destructive);
  html.style.setProperty("--border", v.border);
  html.style.setProperty("--input", v.input);
  html.style.setProperty("--ring", v.ring);

  // Sidebar
  html.style.setProperty("--sidebar", v.sidebar);
  html.style.setProperty("--sidebar-foreground", v.sidebarForeground);
  html.style.setProperty("--sidebar-border", v.sidebarBorder);
  html.style.setProperty("--sidebar-accent", v.sidebarAccent);
  html.style.setProperty("--sidebar-accent-foreground", v.sidebarAccentForeground);

  // Extended UI
  html.style.setProperty("--card-shadow", v.cardShadow);
  html.style.setProperty("--hover-shadow", v.hoverShadow);
  html.style.setProperty("--glass-bg", v.glassBg);
  html.style.setProperty("--glass-border", v.glassBorder);

  // Header / Footer
  html.style.setProperty("--header-bg", v.headerBg);
  html.style.setProperty("--header-border", v.headerBorder);
  html.style.setProperty("--header-text", v.headerText);

  // Page
  html.style.setProperty("--page-bg", v.pageBg);
  html.style.setProperty("--text-color", v.headingColor);

  // Table
  html.style.setProperty("--table-header-bg", v.tableHeaderBg);
  html.style.setProperty("--table-row-hover", v.tableRowHover);
  html.style.setProperty("--table-border", v.tableBorder);

  // Input
  html.style.setProperty("--input-focus-border", v.inputFocusBorder);
  html.style.setProperty("--input-focus-ring", v.inputFocusRing);

  // Status colors
  html.style.setProperty("--success-bg", v.successBg);
  html.style.setProperty("--success-text", v.successText);
  html.style.setProperty("--warning-bg", v.warningBg);
  html.style.setProperty("--warning-text", v.warningText);
  html.style.setProperty("--danger-bg", v.dangerBg);
  html.style.setProperty("--danger-text", v.dangerText);
  html.style.setProperty("--info-bg", v.infoBg);
  html.style.setProperty("--info-text", v.infoText);

  // Heading gradient
  html.style.setProperty("--heading-gradient", v.headingGradient);

  // Scrollbar
  html.style.setProperty("--scrollbar-track", v.scrollbarTrack);
  html.style.setProperty("--scrollbar-thumb", v.scrollbarThumb);

  // Charts
  html.style.setProperty("--chart-1", v.chart1);
  html.style.setProperty("--chart-2", v.chart2);
  html.style.setProperty("--chart-3", v.chart3);
  html.style.setProperty("--chart-4", v.chart4);
  html.style.setProperty("--chart-5", v.chart5);

  // Fonts
  html.style.setProperty("--heading-font", v.headingFont);
  html.style.setProperty("--body-font", v.bodyFont);

  // Font colors
  html.style.setProperty("--heading-color", v.headingColor);
  html.style.setProperty("--subheading-color", v.subheadingColor);
  html.style.setProperty("--body-text-color", v.bodyTextColor);
  html.style.setProperty("--helper-text-color", v.helperTextColor);
  html.style.setProperty("--link-color", v.linkColor);
  html.style.setProperty("--link-hover-color", v.linkHoverColor);
  html.style.setProperty("--label-color", v.labelColor);
  html.style.setProperty("--stat-number-color", v.statNumberColor);

  // Legacy compat
  html.setAttribute("data-accent", themeId);
  html.style.setProperty("--accent-page-bg", v.pageBg);
  html.style.setProperty("--accent-card-bg", v.glassBg);
  html.style.setProperty("--accent-card-border", v.glassBorder);
  html.style.setProperty("--accent-text-primary", v.headingColor);
  html.style.setProperty("--accent-text-secondary", v.helperTextColor);
  html.style.setProperty("--accent-color", theme.accent);
  html.style.setProperty("--accent-color-light", v.infoBg);
}

// ============================================================
// Theme Selector Popup
// ============================================================
export function ThemeSelectorPopup({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { resolvedTheme, setTheme } = useTheme();
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
    if (isOpen) {
      setSelectedLight(getStoredTheme("light"));
      setSelectedDark(getStoredTheme("dark"));
    }
  }, [isOpen]);

  const handleSelect = useCallback((mode: "light" | "dark", id: string) => {
    if (mode === "light") setSelectedLight(id);
    else setSelectedDark(id);
    storeTheme(mode, id);

    const currentMode = isDark ? "dark" : "light";
    if (currentMode !== mode) {
      setTheme(mode);
      setTimeout(applyAccentTheme, 150);
    } else {
      applyAccentTheme();
      setTimeout(applyAccentTheme, 100);
    }
  }, [isDark, setTheme]);

  const handleReset = useCallback(() => {
    storeTheme("light", "default");
    storeTheme("dark", "default");
    setSelectedLight("default");
    setSelectedDark("default");
    applyAccentTheme();
    setTimeout(applyAccentTheme, 100);
  }, []);

  if (!mounted) return null;

  const lang = (obj: { ar: string; en: string }) => (isRTL ? obj.ar : obj.en);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 backdrop-blur-md bg-black/50"
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 30 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
            className={cn(
              "relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl shadow-2xl",
              isDark
                ? "bg-slate-900/95 border border-white/10"
                : "bg-white/95 border border-slate-200"
            )}
          >
            {/* Header */}
            <div className={cn(
              "sticky top-0 z-10 flex items-center justify-between p-5 pb-4 border-b backdrop-blur-xl",
              isDark ? "border-white/10 bg-slate-900/90" : "border-slate-200 bg-white/90"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2.5 rounded-xl",
                  isDark ? "bg-violet-500/15" : "bg-violet-50"
                )}>
                  <Palette size={20} className={isDark ? "text-violet-400" : "text-violet-600"} />
                </div>
                <div>
                  <h2 className={cn("text-lg font-black", isDark ? "text-white" : "text-slate-800")}>
                    {isRTL ? "تخصيص المظهر" : "Theme Selection"}
                  </h2>
                  <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-500")}>
                    {isRTL ? "اختر ثيم مختلف لكل وضع" : "Pick a theme for each mode"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    isDark ? "hover:bg-white/10 text-white/50" : "hover:bg-slate-100 text-slate-400"
                  )}
                  title={isRTL ? "إعادة تعيين" : "Reset to Default"}
                >
                  <RotateCcw size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    isDark ? "hover:bg-white/10 text-white/50" : "hover:bg-slate-100 text-slate-400"
                  )}
                >
                  <X size={18} />
                </motion.button>
              </div>
            </div>

            <div className="p-5 space-y-6">
              {/* Dark/Light toggle */}
              <div className="flex items-center gap-3 justify-center">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setTheme("light"); setTimeout(applyAccentTheme, 150); }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border",
                    !isDark
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-600"
                      : isDark
                        ? "border-white/10 text-white/50 hover:bg-white/5"
                        : "border-slate-200 text-slate-400 hover:bg-slate-50"
                  )}
                >
                  <Sun size={16} />
                  <span className="text-sm font-bold">{isRTL ? "نهاري" : "Light"}</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setTheme("dark"); setTimeout(applyAccentTheme, 150); }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border",
                    isDark
                      ? "bg-purple-500/15 border-purple-500/30 text-purple-400"
                      : "border-slate-200 text-slate-400 hover:bg-slate-50"
                  )}
                >
                  <Moon size={16} />
                  <span className="text-sm font-bold">{isRTL ? "ليلي" : "Dark"}</span>
                </motion.button>
              </div>

              {/* Active theme info */}
              <div className={cn(
                "flex items-center justify-center gap-3 p-4 rounded-xl border",
                isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
              )}>
                {isDark ? <Moon size={18} className="text-purple-400" /> : <Sun size={18} className="text-amber-500" />}
                <span className={cn("text-sm font-bold", isDark ? "text-white/80" : "text-slate-700")}>
                  {isRTL
                    ? (isDark ? "الوضع الليلي — الافتراضي" : "الوضع النهاري — الافتراضي")
                    : (isDark ? "Dark Mode — Default" : "Light Mode — Default")}
                </span>
                <div className="flex gap-1">
                  {(isDark ? darkThemes[0] : lightThemes[0]).preview.map((color, i) => (
                    <div key={i} className="w-4 h-4 rounded-md" style={{ background: color }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function MiniThemeCard({
  theme,
  selected,
  onSelect,
  lang,
  mode,
  currentIsDark,
}: {
  theme: ThemeDef;
  selected: boolean;
  onSelect: () => void;
  lang: (obj: { ar: string; en: string }) => string;
  mode: "light" | "dark";
  currentIsDark: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={cn(
        "relative group p-3 rounded-xl border-2 transition-all duration-300 text-start w-full",
        selected
          ? "shadow-lg"
          : currentIsDark
            ? "border-white/10 hover:border-white/20"
            : "border-slate-200 hover:border-slate-300 bg-white/40"
      )}
      style={selected ? { borderColor: theme.accent, boxShadow: `0 0 20px ${theme.accent}20` } : undefined}
    >
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1.5 -right-1.5 rtl:-left-1.5 rtl:right-auto w-5 h-5 rounded-full flex items-center justify-center shadow-md z-10"
            style={{ background: theme.accent }}
          >
            <Check size={10} className="text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color preview */}
      <div className="flex gap-1.5 mb-2">
        {theme.preview.map((color, i) => (
          <div
            key={i}
            className="rounded-md flex-1 h-7"
            style={{
              background: color,
              border: `1px solid ${mode === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"}`,
            }}
          />
        ))}
      </div>

      {/* Font preview */}
      <div className="flex items-center gap-1 mb-1.5">
        <Type size={8} className={currentIsDark ? "text-white/20" : "text-slate-300"} />
        <span className={cn("text-[8px] truncate", currentIsDark ? "text-white/30" : "text-slate-400")}
          style={{ fontFamily: theme.vars.headingFont }}>
          {theme.vars.headingFont.split("'")[1] || "Default"}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className={cn("text-[11px] font-bold truncate", currentIsDark ? "text-white/85" : "text-slate-700")}>
          {lang(theme.name)}
        </span>
        {theme.id !== "default" && (
          <Sparkles size={8} className={currentIsDark ? "text-white/25" : "text-slate-400"} />
        )}
      </div>
    </motion.button>
  );
}

// ============================================================
// Full Theme Customizer (for Settings page)
// ============================================================
export function ThemeCustomizer() {
  const { resolvedTheme, setTheme } = useTheme();
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

    const currentMode = isDark ? "dark" : "light";
    if (currentMode === mode) {
      applyAccentTheme();
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
  theme: ThemeDef;
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

      <div className="flex gap-2 mb-3">
        {theme.preview.map((color, i) => (
          <div
            key={i}
            className={cn(
              "rounded-lg transition-all",
              i === 0 ? "w-12 h-10" : i === 1 ? "w-10 h-10" : "w-8 h-10 rounded-xl"
            )}
            style={{
              background: color,
              border: `1px solid ${mode === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
              boxShadow: i === 2 ? `0 4px 12px ${color}40` : undefined,
            }}
          />
        ))}
        <div
          className="flex-1 h-10 rounded-lg"
          style={{
            background: theme.vars.glassBg,
            border: `1px solid ${theme.vars.glassBorder}`,
          }}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-black", currentIsDark ? "text-white/90" : "text-slate-800")}>{lang(theme.name)}</span>
          {theme.id !== "default" && (
            <Sparkles size={10} className={currentIsDark ? "text-white/30" : "text-slate-400"} />
          )}
        </div>
        <p className={cn("text-[10px] font-medium leading-relaxed", currentIsDark ? "text-slate-400" : "text-slate-500")}>
          {lang(theme.desc)}
        </p>
        <div className="flex items-center gap-1 pt-0.5">
          <Type size={9} className={currentIsDark ? "text-white/25" : "text-slate-300"} />
          <span className={cn("text-[9px]", currentIsDark ? "text-white/30" : "text-slate-400")}
            style={{ fontFamily: theme.vars.headingFont }}>
            {theme.vars.headingFont.split("'")[1] || "Default"}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
