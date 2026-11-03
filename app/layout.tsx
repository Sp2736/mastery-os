import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export const metadata: Metadata = {
  title: IS_DEMO ? "Mastery OS · Interactive Demo" : "Swayam's MasteryOS Portal",
  description: IS_DEMO
    ? "Interactive portfolio demo of Mastery OS — a database-free personal learning system powered by flat JSON and Git."
    : "Mastery OS Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
