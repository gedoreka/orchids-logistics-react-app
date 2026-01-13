import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "تسجيل الدخول - Logistics Systems Pro",
  description: "نظام إدارة الخدمات اللوجستية المتكامل",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
        <body
          className={`antialiased font-sans`}
        >
          {children}
          {/* <VisualEditsMessenger /> */}
        </body>
    </html>
  );
}
