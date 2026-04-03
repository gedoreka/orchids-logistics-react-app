import type { Metadata } from "next";
import Image from "next/image";
import MobileCarousel from "./MobileCarousel";
import ServiceImageSlider from "./ServiceImageSlider";
import AccountingShowcase from "./AccountingShowcase";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export const metadata: Metadata = {
  title: "Logistics Hub – نظام إدارة اللوجستيات المتكامل",
  description:
    "نظام متكامل لإدارة الموارد البشرية، الرواتب، الفواتير الضريبية، إدارة الأسطول، ومتابعة السائقين. مصمم لشركات التوصيل والخدمات اللوجستية.",
};

// ─── Placeholder component ───────────────────────────────────────────────────
function Placeholder({ label }: { label: string }) {
  return (
    <div className="relative w-full min-h-[220px] rounded-2xl border-2 border-dashed border-cyan-500/35 bg-cyan-500/5 flex flex-col items-center justify-center gap-3 p-6 my-4">
      <div className="w-12 h-12 rounded-full border-2 border-dashed border-cyan-400/50 flex items-center justify-center">
        <svg className="w-5 h-5 text-cyan-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-cyan-400/60 text-center text-sm font-medium leading-relaxed" style={{ fontFamily: "var(--font-cairo)" }}>
        [ هنا قم بوضع لقطة الشاشة الخاصة بـ {label} ]
      </p>
    </div>
  );
}

// ─── Feature bullet component ─────────────────────────────────────────────────
function Bullet({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-gray-300 text-sm">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
      <span>{text}</span>
    </li>
  );
}

// ─── Section badge ────────────────────────────────────────────────────────────
function SectionBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
      {text}
    </span>
  );
}

function ClientCard({
  name,
  role,
  blurb,
  icon,
  accent,
}: {
  name: string;
  role: string;
  blurb: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <article className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-5 hover:border-cyan-400/40 transition-all duration-300 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_55%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-start gap-4">
        <div className={`shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-extrabold text-sm leading-relaxed mb-1">{name}</h3>
          <p className="text-cyan-300 text-xs font-semibold">{role}</p>
        </div>
      </div>
      <p className="relative mt-4 text-gray-300/90 text-sm leading-7">{blurb}</p>
    </article>
  );
}

// ─── Service card ──────────────────────────────────────────────────────────────
function ServiceCard({
  number,
  title,
  subtitle,
  description,
  bullets,
  placeholderLabel,
  screenshotSrc,
  screenshotSrcs,
  gradient = "from-cyan-500 to-blue-600",
  icon,
  disableHoverLightbox,
}: {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  placeholderLabel?: string;
  screenshotSrc?: string;
  screenshotSrcs?: string[];
  gradient?: string;
  icon: React.ReactNode;
  disableHoverLightbox?: boolean;
}) {
  return (
    <div className="group relative rounded-3xl border border-white/8 bg-white/3 p-6 flex flex-col gap-4 hover:border-cyan-500/30 hover:bg-white/5 transition-all duration-300">

      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/0 to-blue-600/0 group-hover:from-cyan-500/5 group-hover:to-blue-600/5 transition-all duration-300 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-cyan-400/60">{number}</span>
          </div>
          <h3 className="text-white font-bold text-lg leading-snug mt-0.5">{title}</h3>
          <p className="text-cyan-400 text-xs font-medium">{subtitle}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>

      {/* Bullet points */}
      <ul className="space-y-2">
        {bullets.map((b, i) => <Bullet key={i} text={b} />)}
      </ul>

      {/* Screenshot — slider (multiple), single image, or placeholder */}
      {screenshotSrcs && screenshotSrcs.length > 1 ? (
          <ServiceImageSlider
            images={screenshotSrcs.map((src) => ({ src }))}
            title={title}
            disableHoverLightbox={disableHoverLightbox}
          />
        ) : screenshotSrc ? (
        <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 mt-2 shadow-2xl">
          <Image
            src={screenshotSrc}
            alt={title}
            width={1280}
            height={720}
            className="w-full h-auto object-cover rounded-2xl"
          />
        </div>
      ) : placeholderLabel ? (
        <Placeholder label={placeholderLabel} />
      ) : null}
    </div>
  );
}

// ─── Icon helpers (inline SVG) ────────────────────────────────────────────────
const icons = {
  users: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  truck: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1 1h2m6-1h2m-2 0H9m4 0h2m2 0h1l1-1V9l-2-3h-3M9 16H7" /></svg>,
  customers: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  vouchers: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  payroll: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  tax: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>,
  credit: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  fleet: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  commission: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  expenses: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  journal: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  profit: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  accounting: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  subusers: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  taxreturn: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
};

const clientPartners = [
  {
    name: "مؤسسة ليلى عسيري للخدمات اللوجستية",
    role: "مدير التشغيل",
    blurb: "شريك يعتمد على المنصة في ضبط عمليات التشغيل اليومي، ورفع كفاءة التسليم، ومتابعة مؤشرات الأداء بدقة تنفيذية.",
    icon: icons.truck,
    accent: "from-cyan-500 to-blue-600",
  },
  {
    name: "مؤسسة بندر فهد الحربي للخدمات اللوجستية",
    role: "مدير المشتريات",
    blurb: "تستفيد من النظام في توحيد إجراءات المشتريات وربطها بالتكاليف التشغيلية، لضمان قرارات شراء أكثر ذكاءً واستدامة.",
    icon: icons.vouchers,
    accent: "from-indigo-500 to-blue-600",
  },
  {
    name: "شركة قوة الدرب للخدمات اللوجستية",
    role: "المحاسب",
    blurb: "تدير الدورة المالية باحتراف عبر قيود محاسبية منظمة وتقارير لحظية تساعد الإدارة على التحكم الكامل في التدفقات النقدية.",
    icon: icons.accounting,
    accent: "from-violet-500 to-purple-600",
  },
  {
    name: "مؤسسة مستر واصل للخدمات اللوجيستية",
    role: "مدير التشغيل",
    blurb: "تعتمد على النظام لمتابعة الأسطول والسائقين بشكل فوري، مما يرفع جودة الخدمة ويقلل التحديات التشغيلية اليومية.",
    icon: icons.fleet,
    accent: "from-orange-500 to-red-600",
  },
  {
    name: "مؤسسة ذروة الطريق للخدمات اللوجستية",
    role: "مدير المشتريات",
    blurb: "تستخدم المنصة لمواءمة المشتريات مع خطط النمو، عبر رؤية مالية واضحة تربط العقود والتوريد بالأداء الفعلي.",
    icon: icons.credit,
    accent: "from-emerald-500 to-teal-600",
  },
  {
    name: "مؤسسة علي احمد علي صميلي للتجارة والتسويق",
    role: "المحاسب",
    blurb: "توظف النظام لبناء انضباط مالي متكامل يجمع بين إدارة الفواتير، المتابعات اليومية، وتحليل الربحية بدقة عالية.",
    icon: icons.profit,
    accent: "from-fuchsia-500 to-pink-600",
  },
  {
    name: "مؤسسة ثقوب السرعة للخدمات اللوجستية",
    role: "مدير التشغيل",
    blurb: "حققت موثوقية تشغيل أعلى من خلال أتمتة إجراءات المتابعة اليومية وتحويل البيانات إلى قرارات عملية سريعة.",
    icon: icons.commission,
    accent: "from-sky-500 to-cyan-600",
  },
  {
    name: "مؤسسة صعود الاعمال",
    role: "مدير المشتريات",
    blurb: "تستند في قرارات الشراء إلى تقارير النظام الدقيقة، ما عزز كفاءة التوريد وخفّض الهدر في المصروفات التشغيلية.",
    icon: icons.expenses,
    accent: "from-teal-500 to-green-600",
  },
  {
    name: "شركة تركي سليمان المزيد",
    role: "المحاسب",
    blurb: "تبني أعمالها المالية على منصة موحدة تمنح وضوحاً كاملاً للحسابات، وتضمن التزاماً محاسبياً احترافياً ومستقراً.",
    icon: icons.journal,
    accent: "from-amber-500 to-orange-600",
  },
  {
    name: "هوت ميل للخدمات اللوجستية",
    role: "مدير التشغيل",
    blurb: "تدير رحلات التشغيل اليومية عبر لوحة متابعة مرنة تعزز سرعة الاستجابة وتضمن استمرارية الأداء بجودة عالية.",
    icon: icons.users,
    accent: "from-blue-500 to-indigo-600",
  },
  {
    name: "شركة نوره مسفر العتيبي للخدمات اللوجستية",
    role: "مدير المشتريات",
    blurb: "تعتمد على النظام في ضبط دورة المشتريات من الطلب حتى الاعتماد، مع تتبع محكم للتكاليف ومصادر الإنفاق.",
    icon: icons.tax,
    accent: "from-rose-500 to-pink-600",
  },
  {
    name: "مؤسسة تركية سجدي عبدالله الدعجاني لنقل البضائع",
    role: "المحاسب",
    blurb: "تعزز موثوقية التقارير المالية عبر منصة تجمع المعاملات المحاسبية في بيئة دقيقة تدعم النمو واتخاذ القرار.",
    icon: icons.taxreturn,
    accent: "from-lime-500 to-emerald-600",
  },
  {
    name: "شركة النقل الموثوق للخدمات اللوجستية",
    role: "مدير التشغيل",
    blurb: "تستفيد من بنية النظام المتكاملة لإدارة حركة التشغيل بمرونة عالية، وتحقيق تجربة خدمة مستقرة لعملائها.",
    icon: icons.customers,
    accent: "from-purple-500 to-indigo-600",
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  return (
      <div
        className="min-h-screen text-white"
        style={{
        fontFamily: "var(--font-cairo), sans-serif",
        background: "linear-gradient(135deg, #060d18 0%, #0a1525 50%, #060d18 100%)",
      }}
    >
      {/* ── Decorative background blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/8 blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-blue-600/8 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-indigo-500/6 blur-3xl" />
      </div>

      {/* ═══════════════════════ NAVBAR ═══════════════════════ */}
      <header className="sticky top-0 z-50 border-b border-white/8 backdrop-blur-xl bg-[#060d18]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0" style={{ filter: "drop-shadow(0 0 10px rgba(6,182,212,0.5))" }}>
              <Image src="/logo.png" alt="Logistics Hub" fill className="object-contain" priority />
            </div>
            <div>
              <span className="text-white font-black text-lg leading-none bg-gradient-to-l from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Logistics Hub
              </span>
              <p className="text-gray-500 text-[10px] leading-none mt-0.5">نظام إدارة لوجستي متكامل</p>
            </div>
          </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
              <a href="#system" className="hover:text-cyan-400 transition-colors">النظام الرئيسي</a>
              <a href="#driver-app" className="hover:text-cyan-400 transition-colors">تطبيق السائق</a>
              <a href="#contact" className="hover:text-cyan-400 transition-colors">تواصل معنا</a>
            </nav>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <a
                href="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 transition-opacity"
              >
                دخول النظام
              </a>
            </div>
        </div>
      </header>

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="flex justify-center mb-6">
          <div
            className="relative w-32 h-32"
            style={{ filter: "drop-shadow(0 0 30px rgba(6,182,212,0.6))" }}
          >
            <Image src="/logo.png" alt="Logistics Hub" fill className="object-contain" priority />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          نظام محاسبي لوجستي متكامل – الإصدار 1.5
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
          <span className="bg-gradient-to-l from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Logistics Hub
          </span>
          <br />
          <span className="text-white text-3xl sm:text-4xl lg:text-5xl">
            نظام إدارة اللوجستيات المتكامل
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-gray-400 text-lg sm:text-xl leading-relaxed mb-10">
          منصة شاملة تجمع إدارة الموارد البشرية، الرواتب، الفواتير الضريبية، إدارة الأسطول، ومتابعة
          السائقين في نظام واحد. صُمم خصيصاً لشركات التوصيل والخدمات اللوجستية في المملكة العربية السعودية.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/login"
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 transition-all shadow-lg shadow-cyan-500/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
            دخول النظام الرئيسي
          </a>
          <a
            href="#driver-app"
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            تطبيق السائق
          </a>
        </div>
      </section>

      {/* ═══════════════════════ STATS BAR ═══════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "+20", label: "وحدة وظيفية متكاملة" },
            { value: "100%", label: "متوافق مع الزكاة والدخل" },
            { value: "2", label: "منصة (ويب + تطبيق)" },
            { value: "24/7", label: "متابعة فورية للسائقين" },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center p-5 rounded-2xl border border-white/8 bg-white/3"
            >
              <div className="text-3xl font-black bg-gradient-to-l from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {s.value}
              </div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ MAIN SYSTEM ═══════════════════════ */}
      <section id="system" className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {/* Section Header */}
        <div className="text-center mb-14">
          <SectionBadge text="النظام الرئيسي – Web App" />
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-3">
            كل ما تحتاجه في مكان واحد
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            عشرون وحدة وظيفية متكاملة تغطي كل جوانب إدارة شركات التوصيل والخدمات اللوجستية
          </p>
          <div className="mt-6 w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mx-auto" />
        </div>

        {/* ── HR Management ── */}
        <div className="mb-8">
            <ServiceCard
              number="01"
              title="إدارة الموارد البشرية"
              subtitle="HR Management"
              description="نظام متكامل لإدارة شؤون الموظفين من التعيين حتى نهاية الخدمة، يتيح توزيع المهام اليومية والتحكم الكامل في الباقات والعمولات."
              bullets={[
                "إدارة الباقات: إنشاء وتعديل مجموعات الموظفين والعمولات بكل سهولة",
                "تقرير سريان الهويات: تقرير شامل لصلاحية الإقامات والهويات مع تنبيهات انتهاء المدة",
                "إدارة المهام: توزيع المهام ومتابعة الإنجاز اليومي لكل موظف",
                "الخطابات الجاهزة: إنشاء وطباعة شهادات الراتب وخطابات العمل الرسمية بنقرة واحدة",
              ]}
              screenshotSrcs={[
                "/screenshots/hr-management.webp",
                "/screenshots/hr-management/01.webp",
                "/screenshots/hr-management/02.webp",
                "/screenshots/hr-management/03.webp",
                "/screenshots/hr-management/04.webp",
                "/screenshots/hr-management/05.webp",
                "/screenshots/hr-management/06.webp",
                "/screenshots/hr-management/07.webp",
                "/screenshots/hr-management/08.webp",
              ]}
              disableHoverLightbox
              gradient="from-indigo-500 to-purple-600"
              icon={icons.users}
            />
        </div>

        {/* ── Driver Tracking ── */}
        <div className="mb-8">
          <div className="group relative rounded-3xl border border-white/8 bg-white/3 p-6 hover:border-cyan-500/30 hover:bg-white/5 transition-all duration-300">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/0 to-blue-600/0 group-hover:from-cyan-500/5 group-hover:to-blue-600/5 transition-all duration-300 pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left: info */}
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                    {icons.truck}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-cyan-400/60">02</span>
                    <h3 className="text-white font-bold text-lg leading-snug mt-0.5">متابعة السائقين</h3>
                    <p className="text-cyan-400 text-xs font-medium">Drivers Tracking</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  لوحة تحكم فورية لمتابعة أداء السائقين في الوقت الفعلي، تعرض إحصاءات دقيقة للطلبات اليومية والشهرية مع نسبة التقدم نحو الهدف.
                </p>
                <ul className="space-y-2">
                  {[
                    "تتبع فعلي لعمليات التوصيل اليومية لكل سائق",
                    "معرفة عدد الطلبات اليومي والشهري ونسبة الإنجاز نحو التارقت",
                    "متابعة مبالغ المحفظة، الخطابات، الإجازات، والحوادث",
                    "يجلب البيانات بدقة مباشرة من تطبيق السائق",
                  ].map((b, i) => <Bullet key={i} text={b} />)}
                </ul>
                {/* QR Code download card */}
                <div className="mt-2 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/8 to-blue-600/5 overflow-hidden">
                  {/* Header */}
                  <div className="px-5 pt-5 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">📱</span>
                      <p className="text-white font-bold text-sm">مرتبط بتطبيق السائق</p>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      البيانات تأتي مباشرة من التطبيق الخاص بكل سائق — الطلبات، المحفظة، المشاكل، والمستندات.
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="flex items-center gap-5 px-5 pb-5">
                    {/* QR image */}
                    <div className="relative shrink-0">
                      <div className="p-3 rounded-2xl bg-white shadow-lg shadow-cyan-500/20">
                        {/* Corner decorations */}
                        <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr-md" />
                        <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-md" />
                        <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br-md" />
                        <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl-md" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://driver.accounts.iw-om.com&bgcolor=ffffff&color=0f172a&qzone=1"
                          alt="QR Code تطبيق السائق"
                          width={140}
                          height={140}
                          className="block rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Text */}
                    <div className="flex flex-col gap-3 flex-1">
                      <div>
                        <p className="text-white font-bold text-sm mb-0.5">امسح للتحميل الفوري</p>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          وجّه كاميرا هاتفك نحو الباركود لفتح تطبيق السائق مباشرة
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                          <span className="text-gray-400 text-xs">تسجيل الدخول برقم الهوية</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                          <span className="text-gray-400 text-xs">يعمل على Android و iOS</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          <span className="text-emerald-400 text-xs font-semibold">متاح الآن</span>
                        </div>
                      </div>
                      <a
                        href="https://driver.accounts.iw-om.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 transition-opacity w-fit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        فتح التطبيق
                      </a>
                    </div>
                  </div>
                </div>
                {/* Demo credentials card */}
                <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/6 to-orange-500/3 overflow-hidden">
                  {/* Top accent line */}
                  <div className="h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-white font-bold text-sm">حساب تجريبي للاستكشاف</p>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            DEMO
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          استخدم رقم الهوية التالي لتسجيل الدخول في التطبيق واستكشاف جميع الميزات
                        </p>
                      </div>
                    </div>

                    {/* ID number */}
                    <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/8">
                      <div className="shrink-0">
                        <p className="text-gray-500 text-[10px] font-semibold mb-0.5">رقم الهوية التجريبي</p>
                        <p
                          className="font-black tracking-[0.15em] text-xl"
                          style={{
                            background: "linear-gradient(90deg, #fbbf24, #f97316)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontFamily: "monospace",
                          }}
                        >
                          2222222222
                        </p>
                      </div>
                      <div className="mr-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-amber-400 text-[10px] font-bold">للتجربة فقط</span>
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="mt-3 flex items-center gap-2 text-gray-500 text-[11px]">
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-bold shrink-0">١</span>
                      <span>افتح التطبيق</span>
                      <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-bold shrink-0">٢</span>
                      <span>أدخل رقم الهوية</span>
                      <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-bold shrink-0">٣</span>
                      <span>استكشف التطبيق</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: mobile carousel */}
              <div className="flex justify-center">
                <MobileCarousel />
              </div>
            </div>
          </div>
        </div>

        {/* Grid: 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

          {/* ── Customers ── */}
          <ServiceCard
            number="03"
            title="قائمة العملاء"
            subtitle="Customers List"
            description="قاعدة بيانات احترافية للعملاء مرتبطة بالفواتير والحسابات لتسهيل عمليات الفوترة والتتبع المالي."
            bullets={[
              "إضافة العملاء وإدارة بياناتهم بالكامل",
              "ربط العملاء بالفواتير الضريبية والحسابات المالية",
            ]}
            gradient="from-emerald-500 to-teal-600"
            icon={icons.customers}
          />

          {/* ── Financial Vouchers ── */}
          <ServiceCard
            number="04"
            title="السندات المالية"
            subtitle="Financial Vouchers"
            description="أصدر سنداتك المالية بثوانٍ باستخدام قوالب جاهزة واحترافية، جاهزة للطباعة أو الإرسال الفوري."
            bullets={[
              "إيصالات بيع، سندات قبض، سندات صرف، سندات لأمر",
              "عروض الأسعار وسندات الدخل بقوالب احترافية",
              "طباعة مباشرة أو إرسال بالبريد الإلكتروني",
            ]}
            screenshotSrcs={[
              "/screenshots/vouchers/01.webp",
              "/screenshots/vouchers/02.webp",
              "/screenshots/vouchers/03.webp",
            ]}
            gradient="from-amber-500 to-orange-600"
            icon={icons.vouchers}
          />

          {/* ── Payroll ── */}
          <ServiceCard
            number="05"
            title="مسيرات الرواتب"
            subtitle="Payroll"
            description="احسب رواتب موظفيك تلقائياً سواء كانت ثابتة أو مرتبطة بالأهداف الشهرية، مع استخراج صافي الراتب لكل فرد."
            bullets={[
              "رواتب ثابتة أو تلقائية حسب التارقت الشهري للسائق",
              "حساب التارقت تلقائياً حسب الراتب والبونص المدخل",
              "استخراج صافي الرواتب حسب عدد الطلبات ومبلغ المحفظة",
            ]}
            screenshotSrcs={[
              "/screenshots/payroll/01.webp",
              "/screenshots/payroll/02.webp",
              "/screenshots/payroll/03.webp",
              "/screenshots/payroll/04.webp",
            ]}
            gradient="from-green-500 to-emerald-600"
            icon={icons.payroll}
          />

          {/* ── Tax Invoices ── */}
          <ServiceCard
            number="06"
            title="الفواتير الضريبية"
            subtitle="Tax Invoices"
            description="أصدر فواتير ضريبية متوافقة 100% مع متطلبات هيئة الزكاة والدخل للمرحلة الأولى والثانية من الفوترة الإلكترونية."
            bullets={[
              "فواتير ضريبية بالكميات أو بالقيمة الثابتة",
              "متوافقة مع هيئة الزكاة والدخل – المرحلة الأولى والثانية",
            ]}
            screenshotSrcs={[
              "/screenshots/tax-invoices/01.webp",
              "/screenshots/tax-invoices/02.webp",
              "/screenshots/tax-invoices/03.webp",
            ]}
            gradient="from-rose-500 to-pink-600"
            icon={icons.tax}
          />

          {/* ── Credit Notes ── */}
          <ServiceCard
            number="07"
            title="إشعارات الدائن"
            subtitle="Creditor Notices"
            description="أضف الخصومات والتعديلات على الفواتير الصادرة مسبقاً بإشعارات دائن رسمية مرتبطة بالفاتورة الأصلية."
            bullets={[
              "إنشاء إشعارات دائن للفواتير الضريبية المصدرة",
              "إضافة الخصومات والتعديلات بسهولة تامة",
            ]}
            gradient="from-violet-500 to-purple-600"
            icon={icons.credit}
          />

          {/* ── Commission System ── */}
          <ServiceCard
            number="09"
            title="نظام العمولة الشهرية"
            subtitle="Monthly Commission"
            description="نظام مرن لاحتساب عمولات السائقين شهرياً بأكثر من طريقة، مع تقارير تفصيلية وإرسال سندات السداد إلكترونياً."
            bullets={[
              "عمولة ثابتة، نسبة مئوية، أو مبلغ محدد لكل سائق",
              "تقارير دقيقة لكل شخص بالأيام والطلبات",
              "إرسال سند السداد الإلكتروني عبر البريد مباشرة",
            ]}
            gradient="from-sky-500 to-cyan-600"
            icon={icons.commission}
          />
        </div>

          {/* ── Fleet Management ── (wide) */}
          <div className="mb-8">
            <ServiceCard
              number="08"
              title="إدارة الأسطول"
              subtitle="Fleet Management"
              description="تحكم كامل في أسطولك من المركبات، من إضافة السيارة وربطها بالسائق حتى متابعة الصيانة وإدارة قطع الغيار والمخزون بنظام متكامل."
              bullets={[
                "إضافة المركبات وربطها بالسائقين تلقائياً",
                "معرفة المسافات المقطوعة ومواعيد الصيانة الدورية مع تنبيهات",
                "قسم خاص بالميكانيكي وقطع الغيار والمخزون",
                "إرسال أوامر صيانة إلكترونية لقسم الصيانة",
                "حركة الحسابات الكاملة والتكلفة الإجمالية لكل مركبة",
              ]}
              screenshotSrcs={[
                "/screenshots/fleet/01.webp",
                "/screenshots/fleet/02.webp",
                "/screenshots/fleet/03.webp",
                "/screenshots/fleet/04.webp",
              ]}
              disableHoverLightbox
              gradient="from-orange-500 to-red-600"
              icon={icons.fleet}
            />
          </div>

          {/* ── General Expenses (wide) ── */}
          <div className="mb-8">
            <ServiceCard
              number="10"
              title="مركز المنصرفات العامة"
              subtitle="General Expenses Center"
              description="سجّل وتتبع جميع مصروفات الشركة في هيكل منظم مرتبط بالنظام المالي، مع تقارير شاملة وتنبيهات المستقطعات."
              bullets={[
                "إضافة المنصرفات الشهرية في جداول وشجرة حسابات منظمة",
                "إضافة المستقطعات الشهرية مع تنبيهات الاستحقاق",
                "تقارير كاملة للحسابات والاستقطاعات والفواتير",
              ]}
              screenshotSrcs={[
                "/screenshots/expenses-center/01.webp",
                "/screenshots/expenses-center/02.webp",
                "/screenshots/expenses-center/03.webp",
                "/screenshots/expenses-center/04.webp",
                "/screenshots/expenses-center/05.webp",
                "/screenshots/expenses-center/06.webp",
              ]}
              gradient="from-teal-500 to-green-600"
              icon={icons.expenses}
            />
          </div>

          {/* ── Sub-users ── */}
            <div className="mb-8">
              <ServiceCard
                number="19"
                title="إدارة المستخدمين الفرعيين"
                subtitle="Sub-users Management"
                description="أضف موظفيك على النظام بصلاحيات مخصصة لكل دور، سواء محاسب، موظف موارد بشرية، مشرف، أو غيره."
                bullets={[
                  "تحديد الصلاحيات لكل موظف بشكل دقيق",
                  "أدوار جاهزة: محاسب، موارد بشرية، مشرف، مدانين",
                  "خصوصية كاملة في الوصول للبيانات الحساسة",
                ]}
                screenshotSrcs={[
                  "/screenshots/subusers/01.webp",
                  "/screenshots/subusers/02.webp",
                ]}
                gradient="from-pink-500 to-rose-600"
                icon={icons.subusers}
              />
            </div>

        {/* ── Accounting Suite ── */}
        <div className="rounded-3xl border border-white/8 bg-white/3 p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shrink-0">
              {icons.accounting}
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">المنظومة المحاسبية المتكاملة</h3>
              <p className="text-indigo-400 text-sm">Accounting Suite</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            منظومة محاسبية احترافية كاملة تمكّنك من إدارة كل الحركة المالية لشركتك وفق أعلى المعايير المحاسبية، من القيود اليومية حتى الميزانية العمومية.
          </p>

          <AccountingShowcase />
        </div>
      </section>

      {/* ═══════════════════════ DRIVER APP ═══════════════════════ */}
      <section id="driver-app" className="relative py-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionBadge text="تطبيق السائق – Driver App" />
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-3">
              بين يدي السائق في تطبيق واحد
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              تطبيق مستقل للسائقين يتيح تسجيل الدخول برقم الهوية ومتابعة كل شيء من الطلبات إلى الهدف الشهري
            </p>
            <div className="mt-6 w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: features */}
            <div className="space-y-4">
              {[
                { icon: "📦", title: "إضافة الطلبات اليومية", desc: "يسجّل السائق طلباته مباشرة عبر التطبيق بشكل فوري ودقيق" },
                { icon: "💰", title: "خصومات المحفظة والكاش", desc: "متابعة مبالغ المحفظة والكاش المخصومة بشفافية كاملة" },
                { icon: "📊", title: "التقرير اليومي", desc: "ملخص يومي شامل بعدد الطلبات والمبالغ والإنجاز" },
                { icon: "🚨", title: "الحوادث والخطابات والإجازات", desc: "تسجيل الحوادث وطلب الإجازات والخطابات بسهولة" },
                { icon: "🎯", title: "تتبع الهدف الشهري", desc: "عرض التارقت والمتبقي مع أداة تحفيزية لتشجيع الإنجاز" },
                { icon: "🪪", title: "المعرض الشخصي السريع", desc: "بطاقة هوية، رخصة القيادة، استمارة المركبة، وبطاقة السائق – متاحة فوراً" },
              ].map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-white/8 bg-white/3 hover:border-cyan-500/30 transition-colors"
                >
                  <span className="text-2xl shrink-0">{f.icon}</span>
                  <div>
                    <h4 className="text-white font-semibold text-sm">{f.title}</h4>
                    <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}

              {/* QR code in driver app section */}
              <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/8 to-blue-600/5 p-5 flex items-center gap-5">
                <div className="shrink-0 p-2.5 rounded-xl bg-white shadow-lg shadow-cyan-500/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://driver.accounts.iw-om.com&bgcolor=ffffff&color=0f172a&qzone=1"
                    alt="QR Code تطبيق السائق"
                    width={120}
                    height={120}
                    className="block rounded-lg"
                  />
                </div>
                <div>
                  <p className="text-white font-bold text-base mb-1">📲 حمّل التطبيق الآن</p>
                  <p className="text-gray-400 text-xs leading-relaxed mb-3">
                    وجّه كاميرا هاتفك نحو الباركود لفتح التطبيق فوراً. يعمل على Android و iOS.
                  </p>
                  <a
                    href="https://driver.accounts.iw-om.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    فتح رابط التطبيق
                  </a>
                </div>
              </div>
            </div>

            {/* Right: mobile carousel */}
            <div className="lg:sticky lg:top-24 flex justify-center">
              <MobileCarousel />
            </div>
          </div>
        </div>
        </section>

        {/* ═══════════════════════ OUR CLIENTS ═══════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/8 via-blue-600/5 to-transparent p-6 sm:p-8 lg:p-10 overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_45%)]" />
            <div className="relative text-center mb-10">
              <SectionBadge text="عملاؤنا" />
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-3">شركاء النجاح في قطاع الخدمات اللوجستية</h2>
              <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed text-sm sm:text-base">
                نفتخر بثقة نخبة من الشركات والمؤسسات التي تعتمد على نظام Logistics Hub لإدارة التشغيل، المشتريات، والحسابات باحترافية عالية.
              </p>
              <div className="mt-6 w-28 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full mx-auto" />
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {clientPartners.map((client) => (
                <ClientCard
                  key={client.name}
                  name={client.name}
                  role={client.role}
                  blurb={client.blurb}
                  icon={client.icon}
                  accent={client.accent}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════ WHY US ═══════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <SectionBadge text="لماذا Logistics Hub ؟" />
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-4">
            الفرق الذي تشعر به من اليوم الأول
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "⚡", title: "سرعة الأداء", desc: "واجهة سريعة الاستجابة مبنية بأحدث تقنيات الويب" },
            { icon: "🔒", title: "أمان البيانات", desc: "تشفير كامل للبيانات وصلاحيات دقيقة لكل مستخدم" },
            { icon: "📱", title: "متجاوب مع الجوال", desc: "يعمل بكفاءة على جميع الأجهزة والشاشات" },
            { icon: "🇸🇦", title: "متوافق محلياً", desc: "متوافق مع هيئة الزكاة والدخل وتنسيق التقويم الهجري" },
          ].map((f) => (
            <div
              key={f.title}
              className="text-center p-6 rounded-2xl border border-white/8 bg-white/3 hover:border-cyan-500/30 transition-colors"
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ CONTACT ═══════════════════════ */}
      <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/8 to-blue-600/5 p-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16" style={{ filter: "drop-shadow(0 0 15px rgba(6,182,212,0.5))" }}>
              <Image src="/logo.png" alt="Logistics Hub" fill className="object-contain" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            ابدأ رحلتك مع Logistics Hub
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            نظام متكامل وجاهز للاستخدام الفوري. سجّل الآن وابدأ بإدارة أعمالك بشكل احترافي
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="/register"
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 transition-all shadow-lg shadow-cyan-500/25"
            >
              إنشاء حساب مجاني
            </a>
            <a
              href="/login"
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold border border-white/20 text-gray-300 hover:text-white hover:border-white/40 transition-all"
            >
              تسجيل الدخول
            </a>
          </div>
          {/* Contact info placeholders */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <span>info@zoolspeed.com</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                <span>0534907721</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="border-t border-white/8 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8" style={{ filter: "drop-shadow(0 0 8px rgba(6,182,212,0.4))" }}>
                <Image src="/logo.png" alt="Logistics Hub" fill className="object-contain" />
              </div>
              <span className="text-gray-400 text-sm font-semibold">Logistics Hub</span>
            </div>
            <p className="text-gray-600 text-xs text-center">
              © {new Date().getFullYear()} Logistics Hub – نظام إدارة لوجستي متكامل · جميع الحقوق محفوظة
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <a href="/login" className="hover:text-gray-400 transition-colors">دخول النظام</a>
              <a href="/register" className="hover:text-gray-400 transition-colors">تسجيل</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
