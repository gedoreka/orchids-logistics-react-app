import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LocaleProvider } from "@/lib/locale-context";
import { ThemeProvider } from "@/components/theme-provider";
import { PrayerProvider } from "@/components/layout/prayer-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "Logistics Systems Pro",
  description: "نظام إدارة الخدمات اللوجستية المتكامل",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await import("next/headers").then((h) => h.cookies());
  const locale = (await cookieStore).get("NEXT_LOCALE")?.value || "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html 
      lang={locale}
      dir={dir} 
      suppressHydrationWarning
      style={{ fontFeatureSettings: '"tnum" on, "lnum" on' }}
      className={`${inter.variable} ${cairo.variable}`}
    >
        <body
          className="antialiased font-cairo bg-background text-foreground"
          style={{ fontFeatureSettings: '"tnum" on, "lnum" on' }}
          suppressHydrationWarning
        >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="logistics-theme"
        >
          <LocaleProvider>
            <PrayerProvider>
              {children}
            </PrayerProvider>
            <Toaster position="top-center" richColors />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
