"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type LogoSize = "sm" | "md" | "lg" | "xl";

interface BrandLogoProps {
  size?: LogoSize;
  className?: string;
}

const sizeConfig = {
  sm: {
    imgSize: 56,
    containerClass: "w-14 h-14",
    glow: "-m-3",
    title: "text-xs",
    gap: "mt-1",
  },
  md: {
    imgSize: 64,
    containerClass: "w-16 h-16",
    glow: "-m-3",
    title: "text-sm font-black",
    gap: "mt-1",
  },
  lg: {
    imgSize: 200,
    containerClass: "w-52 h-52",
    glow: "-m-10",
    title: "text-3xl font-black",
    gap: "mt-5",
  },
  xl: {
    imgSize: 176,
    containerClass: "w-44 h-44",
    glow: "-m-9",
    title: "text-3xl font-black",
    gap: "mt-5",
  },
};

export function LogisticsLogoMark({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <Image
        src="/logo.png"
        alt="Logistics Hub"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}

export default function BrandLogo({ size = "lg", className = "" }: BrandLogoProps) {
  const s = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
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

        {/* Logo image */}
        <div
          className={`relative ${s.containerClass}`}
          style={{ filter: "drop-shadow(0 0 18px rgba(6,182,212,0.55))" }}
        >
          <Image
            src="/logo.png"
            alt="Logistics Hub Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </motion.div>

    </div>
  );
}
