"use client";

import { useId } from "react";
import { motion } from "framer-motion";

type LogoSize = "sm" | "md" | "lg" | "xl";

interface BrandLogoProps {
  size?: LogoSize;
  className?: string;
}

const sizeConfig = {
  sm: {
    svgSize: "w-16 h-16",
    glow: "-m-4",
    title: "text-xs",
    pro: "text-[8px] tracking-[0.3em]",
    gap: "mt-1",
    proGap: "mt-0.5",
  },
  md: {
    svgSize: "w-24 h-24",
    glow: "-m-6",
    title: "text-sm font-black",
    pro: "text-[10px] tracking-[0.35em]",
    gap: "mt-2",
    proGap: "mt-0.5",
  },
  lg: {
    svgSize: "w-52 h-52",
    glow: "-m-10",
    title: "text-4xl font-black",
    pro: "text-base tracking-[0.4em]",
    gap: "mt-5",
    proGap: "mt-1",
  },
  xl: {
    svgSize: "w-44 h-44",
    glow: "-m-10",
    title: "text-4xl font-black",
    pro: "text-lg tracking-[0.45em]",
    gap: "mt-5",
    proGap: "mt-1.5",
  },
};

export function LogisticsLogoMark({ className = "" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const a = `a${uid}`;  // arrow gradient
  const n = `n${uid}`;  // node gradient
  const h = `h${uid}`;  // highlight gradient
  const g = `g${uid}`;  // glow filter

  return (
    <svg
      viewBox="0 0 60 60"
      className={`w-full h-full ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logistics Hub"
    >
      <defs>
        <linearGradient id={a} x1="0" y1="30" x2="60" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="48%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id={n} x1="0" y1="0" x2="0" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
        <linearGradient id={h} x1="4" y1="22" x2="56" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id={g} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Main arrow body ── */}
      <path
        d="M4 22 L36 22 L36 12 L56 30 L36 48 L36 38 L4 38 Q10 30 4 22 Z"
        fill={`url(#${a})`}
      />

      {/* Inner top highlight (depth/metallic feel) */}
      <path
        d="M5 24 L36 24 L36 15 L53 30"
        stroke={`url(#${h})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Waypoint dots on shaft */}
      <circle cx="14" cy="30" r="2.5" fill="rgba(255,255,255,0.38)" />
      <circle cx="24" cy="30" r="2.5" fill="rgba(255,255,255,0.38)" />

      {/* Hub ring at arrowhead base */}
      <circle cx="36" cy="30" r="5.5" fill="rgba(255,255,255,0.14)" />
      <circle cx="36" cy="30" r="2.5" fill="rgba(255,255,255,0.55)" filter={`url(#${g})`} />

      {/* ── Route network — top-left ── */}
      <circle cx="8"  cy="9"  r="3"   fill={`url(#${n})`} opacity="0.88" filter={`url(#${g})`} />
      <circle cx="19" cy="7"  r="2.5" fill={`url(#${n})`} opacity="0.78" />
      <circle cx="30" cy="9"  r="2.5" fill={`url(#${n})`} opacity="0.68" />

      {/* Horizontal connectors between nodes */}
      <line x1="11"   y1="9" x2="16.5" y2="8" stroke="#22D3EE" strokeWidth="1.4" strokeLinecap="round" opacity="0.65" />
      <line x1="21.5" y1="8" x2="27.5" y2="9" stroke="#818CF8" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />

      {/* Vertical drop lines from nodes to arrow */}
      <line x1="8"  y1="12"   x2="8"  y2="22" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2.5 2" opacity="0.42" />
      <line x1="19" y1="9.5"  x2="19" y2="22" stroke="#7DD3FC" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2.5 2" opacity="0.35" />
      <line x1="30" y1="11.5" x2="30" y2="22" stroke="#818CF8" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2.5 2" opacity="0.30" />

      {/* ── Route trail — bottom-right ── */}
      <circle cx="50" cy="51" r="2.5" fill={`url(#${n})`} opacity="0.55" />
      <circle cx="44" cy="51" r="2"   fill={`url(#${n})`} opacity="0.42" />
      <line x1="38" y1="51" x2="41.5" y2="51" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <line x1="50" y1="48" x2="50"   y2="48.5" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

export default function BrandLogo({ size = "lg", className = "" }: BrandLogoProps) {
  const s = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Logo mark with glow */}
      <motion.div
        className="relative cursor-pointer"
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
        whileHover={{ scale: 1.08, rotate: 3 }}
        whileTap={{ scale: 0.93 }}
      >
        {/* Pulsing glow */}
        <motion.div
          className={`absolute inset-0 ${s.glow} rounded-full bg-gradient-to-tr from-cyan-500/25 via-blue-500/20 to-indigo-500/25 blur-2xl`}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Logo SVG */}
        <div className={`relative ${s.svgSize} drop-shadow-[0_0_22px_rgba(6,182,212,0.55)]`}>
          <LogisticsLogoMark />
        </div>
      </motion.div>

      {/* Text */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`${s.gap} ${s.title} bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent tracking-tight`}
        style={{ backgroundSize: "200% 200%" }}
      >
        LOGISTICS HUB
      </motion.h2>
    </div>
  );
}
