"use client";

import { motion } from "framer-motion";

type LogoSize = "sm" | "md" | "lg" | "xl";

interface BrandLogoProps {
  size?: LogoSize;
  className?: string;
}

const sizeConfig = {
  sm: {
    img: "w-16 h-16",
    ring: "-m-2",
    glow: "-m-4",
    spinRing: "-m-1",
    title: "text-xs",
    pro: "text-[8px] tracking-[0.3em]",
    gap: "mt-1",
    proGap: "mt-0.5",
  },
  md: {
    img: "w-24 h-24",
    ring: "-m-3",
    glow: "-m-6",
    spinRing: "-m-2",
    title: "text-sm font-black",
    pro: "text-[10px] tracking-[0.35em]",
    gap: "mt-2",
    proGap: "mt-0.5",
  },
  lg: {
    img: "w-36 h-36",
    ring: "-m-4",
    glow: "-m-8",
    spinRing: "-m-3",
    title: "text-3xl font-black",
    pro: "text-base tracking-[0.4em]",
    gap: "mt-4",
    proGap: "mt-1",
  },
  xl: {
    img: "w-44 h-44",
    ring: "-m-5",
    glow: "-m-10",
    spinRing: "-m-4",
    title: "text-4xl font-black",
    pro: "text-lg tracking-[0.45em]",
    gap: "mt-5",
    proGap: "mt-1.5",
  },
};

export default function BrandLogo({ size = "lg", className = "" }: BrandLogoProps) {
  const s = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Logo with effects */}
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
          className={`absolute inset-0 ${s.glow} rounded-full bg-gradient-to-tr from-pink-500/20 via-orange-400/15 to-yellow-400/20 blur-2xl`}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Spinning dashed ring */}
        <div
          className={`absolute inset-0 ${s.ring} rounded-full border-2 border-dashed border-pink-400/25 dark:border-pink-300/15 animate-[spin_15s_linear_infinite]`}
        />
        {/* Spinning gradient ring */}
        <motion.div
          className={`absolute inset-0 ${s.spinRing} rounded-full`}
          style={{
            background:
              "conic-gradient(from 0deg, transparent, #ec4899, #f97316, #eab308, transparent)",
            opacity: 0.25,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        {/* Bird image */}
        <img
          src="/logo-bird.png"
          alt="Logistics Systems Pro"
          className={`relative ${s.img} object-contain drop-shadow-[0_8px_28px_rgba(236,72,153,0.35)]`}
        />
      </motion.div>

      {/* Text */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`${s.gap} ${s.title} bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent tracking-tight`}
        style={{ backgroundSize: "200% 200%" }}
      >
        LOGISTICS SYSTEMS
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
        className={`${s.proGap} ${s.pro} font-black bg-gradient-to-r from-pink-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent`}
      >
        P R O
      </motion.p>
    </div>
  );
}
