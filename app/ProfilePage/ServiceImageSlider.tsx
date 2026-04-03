"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

interface ServiceImageSliderProps {
  images: { src: string; alt?: string }[];
  title: string;
  /** When true the hover-to-open lightbox is disabled (use for large/clear sliders) */
  disableHoverLightbox?: boolean;
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({
  images,
  title,
  startIndex,
  onClose,
}: {
  images: { src: string; alt?: string }[];
  title: string;
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [visible, setVisible] = useState(false);

  // Fade-in on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") setIndex((p) => (p + 1) % images.length);
      if (e.key === "ArrowRight") setIndex((p) => (p - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [close, images.length]);

  const img = images[index];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        transition: "opacity 0.3s ease",
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 cursor-zoom-out"
        style={{
          background: "rgba(3, 8, 18, 0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
        onClick={close}
      />

      {/* Glow behind image */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "60vw",
          height: "40vh",
          background: "radial-gradient(ellipse, rgba(6,182,212,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Image card */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.92) translateY(16px)",
          transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between w-full mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="text-white/80 text-sm font-semibold" style={{ fontFamily: "var(--font-cairo)" }}>
              {img.alt ?? `${title} – ${index + 1}`}
            </span>
            <span className="text-white/30 text-xs">({index + 1} / {images.length})</span>
          </div>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image frame */}
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: 16,
            border: "1px solid rgba(34,211,238,0.2)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(6,182,212,0.1)",
          }}
        >
          <Image
            src={img.src}
            alt={img.alt ?? title}
            width={1600}
            height={900}
            className="block"
            style={{
              maxWidth: "88vw",
              maxHeight: "78vh",
              width: "auto",
              height: "auto",
              display: "block",
            }}
            sizes="90vw"
            priority
          />
        </div>

        {/* Dot nav */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setIndex((p) => (p - 1 + images.length) % images.length)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-cyan-500/30 flex items-center justify-center text-white/70 hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  style={{
                    width: i === index ? 24 : 7,
                    height: 7,
                    borderRadius: 4,
                    background: i === index ? "#22d3ee" : "rgba(255,255,255,0.25)",
                    transition: "all 0.3s",
                  }}
                  aria-label={`الشريحة ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setIndex((p) => (p + 1) % images.length)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-cyan-500/30 flex items-center justify-center text-white/70 hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ─── Main slider ─────────────────────────────────────────────────────────────
export default function ServiceImageSlider({ images, title, disableHoverLightbox = false }: ServiceImageSliderProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setActive((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (paused || images.length <= 1) return;
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [paused, next, images.length]);

  return (
    <>
      <div
        className={`relative w-full rounded-2xl overflow-hidden border border-white/10 mt-2 shadow-2xl group/slider ${disableHoverLightbox ? "" : "cursor-zoom-in"}`}
        onMouseEnter={() => { setPaused(true); if (!disableHoverLightbox) setLightboxOpen(true); }}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Slides — CSS-grid stacking, natural size, no cropping */}
        <div className="grid w-full">
          {images.map((img, i) => (
            <div
              key={img.src}
              className="[grid-area:1/1] transition-opacity duration-700"
              style={{
                opacity: i === active ? 1 : 0,
                pointerEvents: i === active ? "auto" : "none",
              }}
            >
              <Image
                src={img.src}
                alt={img.alt ?? `${title} - ${i + 1}`}
                width={1600}
                height={900}
                className="w-full h-auto block"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        {/* ── Hover overlay: expand button (only for small sliders) ── */}
        {!disableHoverLightbox && (
          <div
            className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)" }}
          >
            <button
              className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "rgba(6,182,212,0.2)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(34,211,238,0.4)",
                boxShadow: "0 4px 24px rgba(6,182,212,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
                fontFamily: "var(--font-cairo)",
              }}
              onClick={() => setLightboxOpen(true)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              عرض كبير
            </button>
          </div>
        )}

        {/* Prev / Next arrows */}
        <button
          onClick={prev}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-black/80"
          aria-label="السابق"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-black/80"
          aria-label="التالي"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Dots + counter */}
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center z-10">
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="transition-all duration-300"
                style={{
                  width: i === active ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === active ? "#22d3ee" : "rgba(255,255,255,0.4)",
                }}
                aria-label={`الشريحة ${i + 1}`}
              />
            ))}
            <span className="text-white/60 text-xs mr-1">{active + 1}/{images.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        {!paused && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-10">
            <div
              key={active}
              className="h-full bg-cyan-400"
              style={{ animation: "progress-bar 3s linear forwards" }}
            />
          </div>
        )}

        <style>{`
          @keyframes progress-bar {
            from { width: 0% }
            to   { width: 100% }
          }
        `}</style>
      </div>

      {/* Lightbox portal */}
      {mounted && lightboxOpen && (
        <Lightbox
          images={images}
          title={title}
          startIndex={active}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
