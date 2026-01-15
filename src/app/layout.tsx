import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

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
  const locale = await getLocale();
  const messages = await getMessages();
  const isRTL = locale === 'ar';

  return (
    <html 
      lang={locale} 
      dir={isRTL ? "rtl" : "ltr"} 
      style={{ fontFeatureSettings: '"tnum" on, "lnum" on' }}
      className={`${inter.variable} ${cairo.variable}`}
    >
      <body
        className={`antialiased ${isRTL ? 'font-cairo' : 'font-inter'}`}
        style={{ fontFeatureSettings: '"tnum" on, "lnum" on' }}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
