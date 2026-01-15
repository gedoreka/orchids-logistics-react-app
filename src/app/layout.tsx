import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LocaleProvider } from "@/lib/locale-context";
import { ThemeProvider } from "@/components/theme-provider";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="ar" 
      dir="rtl" 
      suppressHydrationWarning
      style={{ fontFeatureSettings: '"tnum" on, "lnum" on' }}
      className={`${inter.variable} ${cairo.variable}`}
    >
      <body
        className="antialiased font-cairo bg-background text-foreground"
        style={{ fontFeatureSettings: '"tnum" on, "lnum" on' }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="logistics-theme"
        >
          <LocaleProvider>
            {children}
            <Toaster position="top-center" richColors />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
