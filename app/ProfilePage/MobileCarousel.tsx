"use client";

import { useState } from "react";
import Image from "next/image";

interface Slide {
  src: string;
  label: string;
}

const SLIDES: Slide[] = [
  { src: "/screenshots/driver-app/01.png", label: "الصفحة الرئيسية" },
  { src: "/screenshots/driver-app/02.png", label: "التقدم نحو الهدف" },
  { src: "/screenshots/driver-app/03.png", label: "الطلبات اليومية" },
  { src: "/screenshots/driver-app/04.png", label: "المشاكل اليومية" },
  { src: "/screenshots/driver-app/05.png", label: "الإجازات والخطابات" },
  { src: "/screenshots/driver-app/06.png", label: "ملخص اليوم" },
  { src: "/screenshots/driver-app/07.png", label: "الكشف الشهري" },
  { src: "/screenshots/driver-app/08.png", label: "تسوية المحفظة" },
  { src: "/screenshots/driver-app/09.png", label: "عرض المستندات" },
];

// iPhone dimensions — width 390px renders at same pixel density as a real iPhone 14
const PHONE_W = 390;

export default function MobileCarousel() {
  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setActive((i) => (i + 1) % SLIDES.length);

  return (
    <div className="flex flex-col items-center gap-6 select-none" style={{ width: PHONE_W + 16 }}>

      {/* ─── iPhone 14 Pro–style mockup ─── */}
      <div
        className="relative flex flex-col shadow-[0_60px_120px_rgba(0,0,0,0.7)]"
        style={{
          width: PHONE_W,
          borderRadius: "3.2rem",
          border: "8px solid rgba(255,255,255,0.16)",
          background: "#18181b",
          overflow: "hidden",
          // Subtle titanium-grey side gradient
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,255,255,0.06), 0 60px 120px rgba(0,0,0,0.7)",
        }}
      >
        {/* ── Status bar + Dynamic Island ── */}
        <div
          className="shrink-0 flex items-center justify-between px-8 relative"
          style={{ height: 52, background: "#18181b" }}
        >
          {/* Time (left) */}
          <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)", fontFamily: "-apple-system, sans-serif" }}>
            9:41
          </span>

          {/* Dynamic Island (center) */}
          <div
            className="absolute left-1/2 top-3 -translate-x-1/2 flex items-center justify-center gap-2"
            style={{
              width: 120,
              height: 32,
              borderRadius: 20,
              background: "#000",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            {/* Front camera dot */}
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1a1a1a", border: "1.5px solid rgba(255,255,255,0.15)" }} />
          </div>

          {/* Icons (right) */}
          <div className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.85)" }}>
            {/* Signal */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
              <rect x="0" y="8" width="3" height="4" rx="0.5" opacity="0.4"/>
              <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5" opacity="0.6"/>
              <rect x="9" y="3" width="3" height="9" rx="0.5" opacity="0.8"/>
              <rect x="13.5" y="0" width="2.5" height="12" rx="0.5"/>
            </svg>
            {/* Wifi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
              <path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
              <path d="M3.5 6.5a6.5 6.5 0 019 0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
              <path d="M1 4a10 10 0 0114 0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.35"/>
            </svg>
            {/* Battery */}
            <div className="flex items-center gap-0.5">
              <div style={{ width: 22, height: 11, borderRadius: 3, border: "1.5px solid rgba(255,255,255,0.5)", position: "relative", padding: "1.5px" }}>
                <div style={{ width: "75%", height: "100%", borderRadius: 1.5, background: "rgba(255,255,255,0.85)" }} />
              </div>
              <div style={{ width: 2, height: 5, borderRadius: 1, background: "rgba(255,255,255,0.4)" }} />
            </div>
          </div>
        </div>

        {/* ── Screen area: fills frame edge-to-edge, no white bars ── */}
        <div
          className="relative shrink-0 w-full"
          style={{ aspectRatio: "9/19.5", background: "#000" }}
        >
          {SLIDES.map((s, i) => (
            <div
              key={s.src}
              className="absolute inset-0 transition-opacity duration-350"
              style={{
                opacity: i === active ? 1 : 0,
                pointerEvents: i === active ? "auto" : "none",
              }}
            >
              <Image
                src={s.src}
                alt={s.label}
                fill
                className="object-cover object-top"
                sizes={`${PHONE_W}px`}
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        {/* ── Home indicator ── */}
        <div
          className="shrink-0 flex items-center justify-center"
          style={{ height: 34, background: "#18181b" }}
        >
          <div style={{ width: 96, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.28)" }} />
        </div>

        {/* Side power button (decorative — outside the border so we fake it with a pseudo) */}
      </div>

      {/* ─── Controls row ── */}
      <div className="flex items-center justify-between w-full px-2">
        {/* Prev */}
        <button
          onClick={prev}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-gray-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          السابق
        </button>

        {/* Slide name + counter */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-white font-bold text-sm">{SLIDES[active].label}</span>
          <span className="text-gray-600 text-xs">{active + 1} من {SLIDES.length}</span>
        </div>

        {/* Next */}
        <button
          onClick={next}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-gray-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-sm"
        >
          التالي
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* ─── Progress dots ── */}
      <div className="flex items-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === active ? 24 : 8,
              height: 8,
              background: i === active ? "#22d3ee" : "rgba(255,255,255,0.18)",
            }}
            aria-label={`${SLIDES[i].label}`}
          />
        ))}
      </div>
    </div>
  );
}
