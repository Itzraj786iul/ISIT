/**
 * Root layout. AI-first learning routes: /subjects, /subject/*, /topic/*, /session/*.
 * Legacy marketplace: /courses, /course/*, /lesson/*, /checkout (docs/AI_FIRST_MIGRATION.md).
 * Route protection: `src/proxy.ts` (edge; JWT cookie — set `JWT_SECRET` in prod).
 */
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";

const themeAndLangBootstrap = `(function(){try{var t=localStorage.getItem('isit-theme');var dark=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);var l=localStorage.getItem('isit-language')||localStorage.getItem('isit-locale');document.documentElement.lang=l==='hi'?'hi':'en';}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ISIT - Indian School of Innovation and Thinking",
  description: "Learn and grow with industry-focused courses.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <Script
          id="isit-theme-lang-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeAndLangBootstrap }}
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
