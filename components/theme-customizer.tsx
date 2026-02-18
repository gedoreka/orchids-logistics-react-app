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
  {
    id: "rose-gold",
    name: { ar: "ذهبي وردي", en: "Rose Gold" },
    desc: { ar: "أنيق ودافئ بلمسة وردية", en: "Elegant warm rose tones" },
    preview: ["#FDF2F4", "#fff1f4", "#e11d48"],
    accent: "#e11d48",
    vars: {
      background: "350 50% 97%",
      foreground: "240 25% 14%",
      card: "350 60% 98%",
      cardForeground: "240 25% 14%",
      popover: "350 60% 98%",
      popoverForeground: "240 25% 14%",
      primary: "347 77% 50%",
      primaryForeground: "0 0% 100%",
      secondary: "340 30% 94%",
      secondaryForeground: "240 25% 14%",
      muted: "340 30% 94%",
      mutedForeground: "280 12% 40%",
      accentVar: "340 30% 94%",
      accentForeground: "240 25% 14%",
      destructive: "0 84% 60%",
      border: "340 30% 88%",
      input: "340 30% 88%",
      ring: "347 77% 50%",
      sidebar: "340 40% 8%",
      sidebarForeground: "340 30% 90%",
      sidebarBorder: "340 30% 15%",
      sidebarAccent: "340 30% 12%",
      sidebarAccentForeground: "340 30% 95%",
      cardShadow: "0 8px 32px rgba(225,29,72,0.06)",
      hoverShadow: "0 12px 40px rgba(225,29,72,0.10)",
      glassBg: "rgba(255,241,244,0.7)",
      glassBorder: "rgba(244,163,186,0.25)",
      headerBg: "linear-gradient(to right, #fce7f3, #fbcfe8, #fce7f3)",
      headerBorder: "rgba(225,29,72,0.12)",
      headerText: "#1a1a2e",
      pageBg: "#FDF2F4",
      tableHeaderBg: "rgba(244,163,186,0.25)",
      tableRowHover: "rgba(255,241,244,0.40)",
      tableBorder: "rgba(244,163,186,0.15)",
      inputFocusBorder: "#f472b6",
      inputFocusRing: "rgba(244,163,186,0.25)",
      successBg: "rgba(16,185,129,0.1)",
      successText: "#059669",
      warningBg: "rgba(245,158,11,0.1)",
      warningText: "#d97706",
      dangerBg: "rgba(225,29,72,0.1)",
      dangerText: "#e11d48",
      infoBg: "rgba(225,29,72,0.08)",
      infoText: "#e11d48",
      headingGradient: "linear-gradient(135deg, #e11d48, #f472b6)",
      scrollbarTrack: "#fce7f3",
      scrollbarThumb: "#f9a8d4",
      chart1: "347 77% 50%",
      chart2: "160 60% 45%",
      chart3: "30 80% 55%",
      chart4: "280 65% 60%",
      chart5: "0 72% 51%",
      headingFont: "'Cairo', 'Tajawal', sans-serif",
      bodyFont: "'Tajawal', 'Segoe UI', sans-serif",
      headingColor: "#1a1a2e",
      subheadingColor: "#2d1b3d",
      bodyTextColor: "#4a3f55",
      helperTextColor: "#6b5b7b",
      linkColor: "#e11d48",
      linkHoverColor: "#be123c",
      labelColor: "#4a3f55",
      statNumberColor: "#1a1a2e",
    },
  },
  {
    id: "ocean-breeze",
    name: { ar: "نسيم المحيط", en: "Ocean Breeze" },
    desc: { ar: "هادئ ومنعش كأمواج البحر", en: "Calm refreshing ocean feel" },
    preview: ["#F0F9FF", "#e0f2fe", "#0284c7"],
    accent: "#0284c7",
    vars: {
      background: "204 100% 97%",
      foreground: "213 54% 10%",
      card: "204 100% 98%",
      cardForeground: "213 54% 10%",
      popover: "204 100% 98%",
      popoverForeground: "213 54% 10%",
      primary: "200 98% 39%",
      primaryForeground: "0 0% 100%",
      secondary: "200 40% 93%",
      secondaryForeground: "213 54% 10%",
      muted: "200 40% 93%",
      mutedForeground: "210 30% 38%",
      accentVar: "200 40% 93%",
      accentForeground: "213 54% 10%",
      destructive: "0 84% 60%",
      border: "200 40% 87%",
      input: "200 40% 87%",
      ring: "200 98% 39%",
      sidebar: "210 60% 7%",
      sidebarForeground: "200 40% 90%",
      sidebarBorder: "210 40% 15%",
      sidebarAccent: "210 40% 12%",
      sidebarAccentForeground: "200 40% 95%",
      cardShadow: "0 8px 32px rgba(2,132,199,0.06)",
      hoverShadow: "0 12px 40px rgba(2,132,199,0.10)",
      glassBg: "rgba(224,242,254,0.6)",
      glassBorder: "rgba(125,211,252,0.25)",
      headerBg: "linear-gradient(to right, #e0f2fe, #bae6fd, #e0f2fe)",
      headerBorder: "rgba(2,132,199,0.12)",
      headerText: "#0c1929",
      pageBg: "#F0F9FF",
      tableHeaderBg: "rgba(125,211,252,0.25)",
      tableRowHover: "rgba(224,242,254,0.40)",
      tableBorder: "rgba(125,211,252,0.15)",
      inputFocusBorder: "#38bdf8",
      inputFocusRing: "rgba(125,211,252,0.25)",
      successBg: "rgba(16,185,129,0.1)",
      successText: "#059669",
      warningBg: "rgba(245,158,11,0.1)",
      warningText: "#d97706",
      dangerBg: "rgba(239,68,68,0.1)",
      dangerText: "#dc2626",
      infoBg: "rgba(2,132,199,0.1)",
      infoText: "#0284c7",
      headingGradient: "linear-gradient(135deg, #0284c7, #38bdf8)",
      scrollbarTrack: "#e0f2fe",
      scrollbarThumb: "#7dd3fc",
      chart1: "200 98% 39%",
      chart2: "160 60% 45%",
      chart3: "30 80% 55%",
      chart4: "280 65% 60%",
      chart5: "340 75% 55%",
      headingFont: "'Cairo', 'Tajawal', sans-serif",
      bodyFont: "'Tajawal', 'Segoe UI', sans-serif",
      headingColor: "#0c1929",
      subheadingColor: "#0c4a6e",
      bodyTextColor: "#1e3a5f",
      helperTextColor: "#3b6d8f",
      linkColor: "#0284c7",
      linkHoverColor: "#0369a1",
      labelColor: "#1e3a5f",
      statNumberColor: "#0c1929",
    },
  },
  {
    id: "forest-mint",
    name: { ar: "غابة النعناع", en: "Forest Mint" },
    desc: { ar: "طبيعي ومريح للعين", en: "Natural eye-friendly greens" },
    preview: ["#F0FDF4", "#dcfce7", "#059669"],
    accent: "#059669",
    vars: {
      background: "138 76% 97%",
      foreground: "150 72% 10%",
      card: "138 76% 98%",
      cardForeground: "150 72% 10%",
      popover: "138 76% 98%",
      popoverForeground: "150 72% 10%",
      primary: "161 94% 30%",
      primaryForeground: "0 0% 100%",
      secondary: "140 40% 92%",
      secondaryForeground: "150 72% 10%",
      muted: "140 40% 92%",
      mutedForeground: "150 40% 30%",
      accentVar: "140 40% 92%",
      accentForeground: "150 72% 10%",
      destructive: "0 84% 60%",
      border: "140 40% 86%",
      input: "140 40% 86%",
      ring: "161 94% 30%",
      sidebar: "150 60% 6%",
      sidebarForeground: "140 40% 90%",
      sidebarBorder: "150 40% 14%",
      sidebarAccent: "150 40% 11%",
      sidebarAccentForeground: "140 40% 95%",
      cardShadow: "0 8px 32px rgba(5,150,105,0.06)",
      hoverShadow: "0 12px 40px rgba(5,150,105,0.10)",
      glassBg: "rgba(220,252,231,0.55)",
      glassBorder: "rgba(134,239,172,0.25)",
      headerBg: "linear-gradient(to right, #dcfce7, #bbf7d0, #dcfce7)",
      headerBorder: "rgba(5,150,105,0.12)",
      headerText: "#052e16",
      pageBg: "#F0FDF4",
      tableHeaderBg: "rgba(134,239,172,0.25)",
      tableRowHover: "rgba(220,252,231,0.40)",
      tableBorder: "rgba(134,239,172,0.15)",
      inputFocusBorder: "#34d399",
      inputFocusRing: "rgba(134,239,172,0.25)",
      successBg: "rgba(5,150,105,0.12)",
      successText: "#047857",
      warningBg: "rgba(245,158,11,0.1)",
      warningText: "#d97706",
      dangerBg: "rgba(239,68,68,0.1)",
      dangerText: "#dc2626",
      infoBg: "rgba(5,150,105,0.1)",
      infoText: "#059669",
      headingGradient: "linear-gradient(135deg, #059669, #34d399)",
      scrollbarTrack: "#dcfce7",
      scrollbarThumb: "#86efac",
      chart1: "161 94% 30%",
      chart2: "220 70% 50%",
      chart3: "30 80% 55%",
      chart4: "280 65% 60%",
      chart5: "340 75% 55%",
      headingFont: "'Cairo', 'Tajawal', sans-serif",
      bodyFont: "'Tajawal', 'Segoe UI', sans-serif",
      headingColor: "#052e16",
      subheadingColor: "#14532d",
      bodyTextColor: "#166534",
      helperTextColor: "#4d7c5e",
      linkColor: "#059669",
      linkHoverColor: "#047857",
      labelColor: "#14532d",
      statNumberColor: "#052e16",
    },
  },
  {
    id: "royal-purple",
    name: { ar: "بنفسجي ملكي", en: "Royal Purple" },
    desc: { ar: "فاخر وعصري بلمسة ملكية", en: "Luxurious regal purple" },
    preview: ["#FAF5FF", "#f3e8ff", "#7c3aed"],
    accent: "#7c3aed",
    vars: {
      background: "270 100% 98%",
      foreground: "268 60% 11%",
      card: "270 100% 99%",
      cardForeground: "268 60% 11%",
      popover: "270 100% 99%",
      popoverForeground: "268 60% 11%",
      primary: "263 70% 58%",
      primaryForeground: "0 0% 100%",
      secondary: "270 40% 94%",
      secondaryForeground: "268 60% 11%",
      muted: "270 40% 94%",
      mutedForeground: "270 30% 40%",
      accentVar: "270 40% 94%",
      accentForeground: "268 60% 11%",
      destructive: "0 84% 60%",
      border: "270 40% 88%",
      input: "270 40% 88%",
      ring: "263 70% 58%",
      sidebar: "270 60% 7%",
      sidebarForeground: "270 30% 90%",
      sidebarBorder: "270 30% 15%",
      sidebarAccent: "270 30% 12%",
      sidebarAccentForeground: "270 30% 95%",
      cardShadow: "0 8px 32px rgba(124,58,237,0.06)",
      hoverShadow: "0 12px 40px rgba(124,58,237,0.10)",
      glassBg: "rgba(243,232,255,0.6)",
      glassBorder: "rgba(196,181,253,0.25)",
      headerBg: "linear-gradient(to right, #f3e8ff, #e9d5ff, #f3e8ff)",
      headerBorder: "rgba(124,58,237,0.12)",
      headerText: "#1a0a2e",
      pageBg: "#FAF5FF",
      tableHeaderBg: "rgba(196,181,253,0.25)",
      tableRowHover: "rgba(243,232,255,0.40)",
      tableBorder: "rgba(196,181,253,0.15)",
      inputFocusBorder: "#a78bfa",
      inputFocusRing: "rgba(196,181,253,0.25)",
      successBg: "rgba(16,185,129,0.1)",
      successText: "#059669",
      warningBg: "rgba(245,158,11,0.1)",
      warningText: "#d97706",
      dangerBg: "rgba(239,68,68,0.1)",
      dangerText: "#dc2626",
      infoBg: "rgba(124,58,237,0.1)",
      infoText: "#7c3aed",
      headingGradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
      scrollbarTrack: "#f3e8ff",
      scrollbarThumb: "#c4b5fd",
      chart1: "263 70% 58%",
      chart2: "160 60% 45%",
      chart3: "30 80% 55%",
      chart4: "347 77% 50%",
      chart5: "200 98% 39%",
      headingFont: "'Cairo', 'Tajawal', sans-serif",
      bodyFont: "'Tajawal', 'Segoe UI', sans-serif",
      headingColor: "#1a0a2e",
      subheadingColor: "#3b1f6e",
      bodyTextColor: "#4c2d8e",
      helperTextColor: "#6b5b7b",
      linkColor: "#7c3aed",
      linkHoverColor: "#6d28d9",
      labelColor: "#3b1f6e",
      statNumberColor: "#1a0a2e",
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
  {
    id: "crimson-night",
    name: { ar: "ليلة قرمزية", en: "Crimson Night" },
    desc: { ar: "داكن عميق بلمسات حمراء", en: "Deep dark with red accents" },
    preview: ["#0c0a0e", "#190a12", "#dc2626"],
    accent: "#dc2626",
    vars: {
      background: "300 20% 4%",
      foreground: "330 60% 94%",
      card: "330 40% 7%",
      cardForeground: "330 60% 94%",
      popover: "330 40% 7%",
      popoverForeground: "330 60% 94%",
      primary: "0 72% 51%",
      primaryForeground: "0 0% 100%",
      secondary: "330 20% 12%",
      secondaryForeground: "330 60% 94%",
      muted: "330 20% 12%",
      mutedForeground: "290 20% 60%",
      accentVar: "330 20% 12%",
      accentForeground: "330 60% 94%",
      destructive: "0 72% 51%",
      border: "330 20% 14%",
      input: "330 20% 14%",
      ring: "0 72% 51%",
      sidebar: "300 25% 5%",
      sidebarForeground: "330 30% 90%",
      sidebarBorder: "330 20% 12%",
      sidebarAccent: "330 20% 10%",
      sidebarAccentForeground: "330 30% 95%",
      cardShadow: "0 4px 12px rgba(220,38,38,0.08)",
      hoverShadow: "0 8px 24px rgba(220,38,38,0.12)",
      glassBg: "rgba(25,10,18,0.9)",
      glassBorder: "rgba(220,38,38,0.1)",
      headerBg: "rgba(25,10,18,0.95)",
      headerBorder: "rgba(220,38,38,0.1)",
      headerText: "#fce7f3",
      pageBg: "#0c0a0e",
      tableHeaderBg: "rgba(60,20,35,0.4)",
      tableRowHover: "rgba(60,20,35,0.25)",
      tableBorder: "rgba(220,38,38,0.08)",
      inputFocusBorder: "#dc2626",
      inputFocusRing: "rgba(220,38,38,0.2)",
      successBg: "rgba(16,185,129,0.15)",
      successText: "#34d399",
      warningBg: "rgba(245,158,11,0.15)",
      warningText: "#fbbf24",
      dangerBg: "rgba(220,38,38,0.2)",
      dangerText: "#fca5a5",
      infoBg: "rgba(220,38,38,0.15)",
      infoText: "#fb7185",
      headingGradient: "linear-gradient(135deg, #fb7185, #f43f5e)",
      scrollbarTrack: "hsl(330,20%,8%)",
      scrollbarThumb: "hsl(330,20%,25%)",
      chart1: "0 72% 51%",
      chart2: "160 60% 45%",
      chart3: "30 80% 55%",
      chart4: "280 65% 60%",
      chart5: "200 70% 50%",
      headingFont: "'Cairo', 'Tajawal', sans-serif",
      bodyFont: "'Tajawal', 'Segoe UI', sans-serif",
      headingColor: "#fce7f3",
      subheadingColor: "#fda4af",
      bodyTextColor: "#e8b4c0",
      helperTextColor: "#a78baf",
      linkColor: "#fb7185",
      linkHoverColor: "#fda4af",
      labelColor: "#e8b4c0",
      statNumberColor: "#fce7f3",
    },
  },
  {
    id: "cyber-teal",
    name: { ar: "تيل سايبر", en: "Cyber Teal" },
    desc: { ar: "مستقبلي بألوان النيون", en: "Futuristic neon teal vibes" },
    preview: ["#021a1a", "#021e1e", "#14b8a6"],
    accent: "#14b8a6",
    vars: {
      background: "180 78% 5%",
      foreground: "166 76% 90%",
      card: "180 78% 6%",
      cardForeground: "166 76% 90%",
      popover: "180 78% 6%",
      popoverForeground: "166 76% 90%",
      primary: "174 72% 40%",
      primaryForeground: "0 0% 100%",
      secondary: "180 40% 10%",
      secondaryForeground: "166 76% 90%",
      muted: "180 40% 10%",
      mutedForeground: "168 60% 65%",
      accentVar: "180 40% 10%",
      accentForeground: "166 76% 90%",
      destructive: "0 63% 51%",
      border: "180 40% 12%",
      input: "180 40% 12%",
      ring: "174 72% 40%",
      sidebar: "180 78% 4%",
      sidebarForeground: "168 40% 88%",
      sidebarBorder: "180 40% 10%",
      sidebarAccent: "180 40% 8%",
      sidebarAccentForeground: "168 40% 95%",
      cardShadow: "0 4px 12px rgba(20,184,166,0.08)",
      hoverShadow: "0 8px 24px rgba(20,184,166,0.12)",
      glassBg: "rgba(2,30,30,0.9)",
      glassBorder: "rgba(20,184,166,0.1)",
      headerBg: "rgba(2,30,30,0.95)",
      headerBorder: "rgba(20,184,166,0.1)",
      headerText: "#ccfbf1",
      pageBg: "#021a1a",
      tableHeaderBg: "rgba(10,60,60,0.4)",
      tableRowHover: "rgba(10,60,60,0.25)",
      tableBorder: "rgba(20,184,166,0.08)",
      inputFocusBorder: "#14b8a6",
      inputFocusRing: "rgba(20,184,166,0.2)",
      successBg: "rgba(20,184,166,0.15)",
      successText: "#5eead4",
      warningBg: "rgba(245,158,11,0.15)",
      warningText: "#fbbf24",
      dangerBg: "rgba(239,68,68,0.15)",
      dangerText: "#f87171",
      infoBg: "rgba(20,184,166,0.15)",
      infoText: "#5eead4",
      headingGradient: "linear-gradient(135deg, #14b8a6, #5eead4)",
      scrollbarTrack: "hsl(180,40%,6%)",
      scrollbarThumb: "hsl(174,40%,25%)",
      chart1: "174 72% 40%",
      chart2: "220 70% 50%",
      chart3: "30 80% 55%",
      chart4: "280 65% 60%",
      chart5: "340 75% 55%",
      headingFont: "'Cairo', 'Tajawal', sans-serif",
      bodyFont: "'Tajawal', 'Segoe UI', sans-serif",
      headingColor: "#ccfbf1",
      subheadingColor: "#99f6e4",
      bodyTextColor: "#5eead4",
      helperTextColor: "#5eead4",
      linkColor: "#2dd4bf",
      linkHoverColor: "#5eead4",
      labelColor: "#99f6e4",
      statNumberColor: "#ccfbf1",
    },
  },
  {
    id: "midnight-gold",
    name: { ar: "ذهب منتصف الليل", en: "Midnight Gold" },
    desc: { ar: "فاخر كالذهب في الظلام", en: "Luxurious gold on dark" },
    preview: ["#0d0b07", "#14100a", "#f59e0b"],
    accent: "#f59e0b",
    vars: {
      background: "30 30% 4%",
      foreground: "45 90% 88%",
      card: "30 30% 6%",
      cardForeground: "45 90% 88%",
      popover: "30 30% 6%",
      popoverForeground: "45 90% 88%",
      primary: "38 92% 50%",
      primaryForeground: "30 30% 5%",
      secondary: "30 20% 11%",
      secondaryForeground: "45 90% 88%",
      muted: "30 20% 11%",
      mutedForeground: "36 90% 50%",
      accentVar: "30 20% 11%",
      accentForeground: "45 90% 88%",
      destructive: "0 63% 51%",
      border: "30 20% 13%",
      input: "30 20% 13%",
      ring: "38 92% 50%",
      sidebar: "30 30% 4%",
      sidebarForeground: "40 40% 88%",
      sidebarBorder: "30 20% 11%",
      sidebarAccent: "30 20% 9%",
      sidebarAccentForeground: "40 40% 95%",
      cardShadow: "0 4px 12px rgba(245,158,11,0.08)",
      hoverShadow: "0 8px 24px rgba(245,158,11,0.12)",
      glassBg: "rgba(20,16,10,0.9)",
      glassBorder: "rgba(245,158,11,0.1)",
      headerBg: "rgba(20,16,10,0.95)",
      headerBorder: "rgba(245,158,11,0.1)",
      headerText: "#fef3c7",
      pageBg: "#0d0b07",
      tableHeaderBg: "rgba(50,40,20,0.4)",
      tableRowHover: "rgba(50,40,20,0.25)",
      tableBorder: "rgba(245,158,11,0.08)",
      inputFocusBorder: "#f59e0b",
      inputFocusRing: "rgba(245,158,11,0.2)",
      successBg: "rgba(16,185,129,0.15)",
      successText: "#34d399",
      warningBg: "rgba(245,158,11,0.2)",
      warningText: "#fcd34d",
      dangerBg: "rgba(239,68,68,0.15)",
      dangerText: "#f87171",
      infoBg: "rgba(245,158,11,0.15)",
      infoText: "#fbbf24",
      headingGradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
      scrollbarTrack: "hsl(30,20%,6%)",
      scrollbarThumb: "hsl(38,40%,25%)",
      chart1: "38 92% 50%",
      chart2: "160 60% 45%",
      chart3: "0 72% 51%",
      chart4: "280 65% 60%",
      chart5: "200 70% 50%",
      headingFont: "'Cairo', 'Tajawal', sans-serif",
      bodyFont: "'Tajawal', 'Segoe UI', sans-serif",
      headingColor: "#fef3c7",
      subheadingColor: "#fde68a",
      bodyTextColor: "#fbbf24",
      helperTextColor: "#d97706",
      linkColor: "#fbbf24",
      linkHoverColor: "#fcd34d",
      labelColor: "#fde68a",
      statNumberColor: "#fef3c7",
    },
  },
  {
    id: "aurora-violet",
    name: { ar: "شفق بنفسجي", en: "Aurora Violet" },
    desc: { ar: "سحري كأضواء الشفق القطبي", en: "Magical aurora lights" },
    preview: ["#0a0515", "#0f081e", "#8b5cf6"],
    accent: "#8b5cf6",
    vars: {
      background: "264 60% 5%",
      foreground: "263 80% 95%",
      card: "264 55% 7%",
      cardForeground: "263 80% 95%",
      popover: "264 55% 7%",
      popoverForeground: "263 80% 95%",
      primary: "263 70% 58%",
      primaryForeground: "0 0% 100%",
      secondary: "264 30% 12%",
      secondaryForeground: "263 80% 95%",
      muted: "264 30% 12%",
      mutedForeground: "263 50% 73%",
      accentVar: "264 30% 12%",
      accentForeground: "263 80% 95%",
      destructive: "0 63% 51%",
      border: "264 30% 14%",
      input: "264 30% 14%",
      ring: "263 70% 58%",
      sidebar: "264 60% 4%",
      sidebarForeground: "263 40% 88%",
      sidebarBorder: "264 30% 11%",
      sidebarAccent: "264 30% 9%",
      sidebarAccentForeground: "263 40% 95%",
      cardShadow: "0 4px 12px rgba(139,92,246,0.08)",
      hoverShadow: "0 8px 24px rgba(139,92,246,0.12)",
      glassBg: "rgba(15,8,30,0.9)",
      glassBorder: "rgba(139,92,246,0.1)",
      headerBg: "rgba(15,8,30,0.95)",
      headerBorder: "rgba(139,92,246,0.1)",
      headerText: "#ede9fe",
      pageBg: "#0a0515",
      tableHeaderBg: "rgba(35,20,60,0.4)",
      tableRowHover: "rgba(35,20,60,0.25)",
      tableBorder: "rgba(139,92,246,0.08)",
      inputFocusBorder: "#8b5cf6",
      inputFocusRing: "rgba(139,92,246,0.2)",
      successBg: "rgba(16,185,129,0.15)",
      successText: "#34d399",
      warningBg: "rgba(245,158,11,0.15)",
      warningText: "#fbbf24",
      dangerBg: "rgba(239,68,68,0.15)",
      dangerText: "#f87171",
      infoBg: "rgba(139,92,246,0.15)",
      infoText: "#a78bfa",
      headingGradient: "linear-gradient(135deg, #8b5cf6, #c4b5fd)",
      scrollbarTrack: "hsl(264,30%,7%)",
      scrollbarThumb: "hsl(263,30%,25%)",
      chart1: "263 70% 58%",
      chart2: "160 60% 45%",
      chart3: "30 80% 55%",
      chart4: "0 72% 51%",
      chart5: "200 70% 50%",
      headingFont: "'Cairo', 'Tajawal', sans-serif",
      bodyFont: "'Tajawal', 'Segoe UI', sans-serif",
      headingColor: "#ede9fe",
      subheadingColor: "#c4b5fd",
      bodyTextColor: "#a78bfa",
      helperTextColor: "#a78bfa",
      linkColor: "#a78bfa",
      linkHoverColor: "#c4b5fd",
      labelColor: "#c4b5fd",
      statNumberColor: "#ede9fe",
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

              {/* Light Themes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Sun size={14} className="text-amber-500" />
                  <span className={cn("text-xs font-black", isDark ? "text-white/70" : "text-slate-600")}>
                    {isRTL ? "ثيمات الوضع النهاري" : "Light Mode Themes"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {lightThemes.map((theme) => (
                    <MiniThemeCard
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

              {/* Dark Themes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Moon size={14} className="text-blue-400" />
                  <span className={cn("text-xs font-black", isDark ? "text-white/70" : "text-slate-600")}>
                    {isRTL ? "ثيمات الوضع الليلي" : "Dark Mode Themes"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {darkThemes.map((theme) => (
                    <MiniThemeCard
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
