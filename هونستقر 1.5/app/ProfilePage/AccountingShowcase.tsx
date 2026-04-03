"use client";
import { useState } from "react";
import Image from "next/image";

const ITEMS = [
  {
    num: "11",
    title: "القيود اليومية",
    titleEn: "Journal Entries",
    desc: "إضافة القيود المدينة والدائنة بترتيب دقيق ومنظم",
    img: "/screenshots/accounting/01.webp",
    gradient: "from-indigo-500 to-blue-600",
    glowColor: "rgba(99,102,241,0.35)",
  },
  {
    num: "12",
    title: "ملخص الأرباح والخسائر",
    titleEn: "P&L Summary",
    desc: "تقرير مختصر للربح والخسارة حسب المصروفات والإيرادات",
    img: "/screenshots/accounting/02.webp",
    gradient: "from-emerald-500 to-teal-600",
    glowColor: "rgba(16,185,129,0.35)",
  },
  {
    num: "13–14",
    title: "شجرة الحسابات ومراكز التكلفة",
    titleEn: "Chart of Accounts",
    desc: "هيكل حسابي منظم ومراكز تكلفة مفصلة",
    img: "/screenshots/accounting/03.webp",
    gradient: "from-violet-500 to-purple-600",
    glowColor: "rgba(139,92,246,0.35)",
  },
  {
    num: "16",
    title: "ميزان المراجعة",
    titleEn: "Trial Balance",
    desc: "التحقق من توازن القيود المحاسبية بدقة",
    img: "/screenshots/accounting/04.webp",
    gradient: "from-cyan-500 to-blue-600",
    glowColor: "rgba(6,182,212,0.35)",
  },
  {
    num: "17",
    title: "قائمة الدخل",
    titleEn: "Income Statement",
    desc: "تقرير الإيرادات والمصروفات للفترة المحاسبية",
    img: "/screenshots/accounting/05.webp",
    gradient: "from-amber-500 to-orange-600",
    glowColor: "rgba(245,158,11,0.35)",
  },
  {
    num: "18",
    title: "الميزانية العمومية",
    titleEn: "Balance Sheet",
    desc: "عرض كامل لأصول وخصوم الشركة",
    img: "/screenshots/accounting/06.webp",
    gradient: "from-rose-500 to-pink-600",
    glowColor: "rgba(244,63,94,0.35)",
  },
  {
    num: "20",
    title: "الإقرارات الضريبية",
    titleEn: "Tax Returns",
    desc: "إنشاء وتصدير الإقرارات الضريبية الربعية إلكترونياً",
    img: "/screenshots/accounting/07.webp",
    gradient: "from-sky-500 to-cyan-600",
    glowColor: "rgba(14,165,233,0.35)",
  },
  {
    num: "15",
    title: "دفاتر الأستاذ العام",
    titleEn: "General Ledger",
    desc: "سجل كامل لجميع الحسابات والحركات المالية",
    img: "/screenshots/accounting/08.webp",
    gradient: "from-green-500 to-emerald-600",
    glowColor: "rgba(34,197,94,0.35)",
  },
];

export default function AccountingShowcase() {
  const [selected, setSelected] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = (idx: number) => {
    if (idx === selected) return;
    setFading(true);
    setTimeout(() => {
      setSelected(idx);
      setFading(false);
    }, 180);
  };

  const prev = () => goTo((selected - 1 + ITEMS.length) % ITEMS.length);
  const next = () => goTo((selected + 1) % ITEMS.length);

  const item = ITEMS[selected];

  return (
    <div className="w-full" dir="rtl">

      {/* ══════════════════════════════════════════════════════════
          LARGE MAIN DISPLAY
      ══════════════════════════════════════════════════════════ */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-5"
        style={{ background: "#060d18", boxShadow: `0 0 60px ${item.glowColor}` }}
      >
        {/* Chrome-style top bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8 bg-white/3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-amber-400/70" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-1 rounded-lg bg-white/5 border border-white/8">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.gradient}`} />
              <span className="text-gray-400 text-xs font-medium">{item.titleEn}</span>
              <span className="text-gray-600 text-xs">— المنظومة المحاسبية</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prev} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/8 transition-colors text-gray-400 hover:text-white">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={next} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/8 transition-colors text-gray-400 hover:text-white">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Screenshot */}
        <div
          className="relative w-full transition-opacity duration-200"
          style={{ opacity: fading ? 0 : 1 }}
        >
          {item.img ? (
            <Image
              src={item.img}
              alt={item.title}
              width={1456}
              height={816}
              className="w-full h-auto block"
              style={{ maxHeight: "560px", objectFit: "contain", objectPosition: "top center", background: "#060d18" }}
              priority
              unoptimized
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4" style={{ height: "420px" }}>
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-2xl`}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-xl">{item.title}</p>
                <p className="text-gray-500 text-sm mt-1">{item.titleEn}</p>
                <p className="text-gray-600 text-xs mt-3">الصورة قادمة قريباً</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom overlay badge */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-5 pt-10 pb-4 pointer-events-none">
          <div className="flex items-center gap-3">
            <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
              <span className="text-white font-black text-xs">{item.num}</span>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">{item.title}</p>
              <p className="text-gray-400 text-xs">{item.titleEn} • المنظومة المحاسبية المتكاملة</p>
            </div>
            <div className="mr-auto flex items-center gap-2">
              {/* Nav dots */}
              {ITEMS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 pointer-events-auto ${
                    i === selected
                      ? "w-5 h-2 bg-white"
                      : "w-2 h-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

        {/* ══════════════════════════════════════════════════════════
            BOTTOM SECTION LABELS (text only)
        ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ITEMS.map((card, idx) => (
            <button
              key={card.num}
              onClick={() => goTo(idx)}
              className="group relative text-right rounded-2xl border transition-all duration-300 hover:-translate-y-0.5"
              style={{
                border: idx === selected
                  ? "1px solid rgba(255,255,255,0.34)"
                  : "1px solid rgba(255,255,255,0.1)",
                boxShadow: idx === selected
                  ? `0 0 24px ${card.glowColor}, 0 4px 20px rgba(0,0,0,0.4)`
                  : "0 4px 16px rgba(0,0,0,0.2)",
                background: "rgba(6, 13, 24, 0.92)",
              }}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-black text-[10px]">{card.num.includes("–") ? "✦" : card.num}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white font-bold text-sm leading-tight">{card.title}</h4>
                    <p className="text-gray-400 text-[11px] mt-1 line-clamp-2">{card.desc}</p>
                    <p className="text-gray-500 text-[10px] mt-1">{card.titleEn}</p>
                    <p className="text-cyan-300/80 text-[10px] mt-1.5">يعرض الصورة الخاصة بهذا القسم</p>
                  </div>
                </div>
              </div>

              {idx === selected && (
                <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ border: "1px solid rgba(255,255,255,0.28)" }} />
              )}
            </button>
          ))}
        </div>
    </div>
  );
}
