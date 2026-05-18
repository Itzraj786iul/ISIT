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
import { AnimatedCursor } from "@/components/AnimatedCursor";
import { SkipLink } from "@/components/SkipLink";
import { getPublicSiteUrl } from "@/lib/public-site-url";

const themeAndLangBootstrap = `(function(){try{var t=localStorage.getItem('isit-theme');var dark=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var mode=dark?'dark':'light';document.documentElement.classList.toggle('dark',dark);document.documentElement.setAttribute('data-theme',mode);document.documentElement.style.colorScheme=mode;var l=localStorage.getItem('isit-language')||localStorage.getItem('isit-locale');document.documentElement.lang=l==='hi'?'hi':'en';}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getPublicSiteUrl(),
  title: {
    default:
      "Indian School of Innovation and Curiosity (ISIC) — Adaptive learning & AI tutor",
    template: "%s · Indian School of Innovation and Curiosity",
  },
  description:
    "Personalized learning with an AI tutor, curriculum mastery tracking, and tools for schools, teachers, and families.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Indian School of Innovation and Curiosity",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Indian School of Innovation and Curiosity (ISIC) — Adaptive learning & AI tutor",
    description:
      "Personalized learning with an AI tutor, mastery tracking, and tools for schools and families.",
  },
  keywords: [
    "AI tutor",
    "adaptive learning",
    "India education",
    "online learning",
    "school curriculum",
    "ISIC",
    "Indian School of Innovation and Curiosity",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`isit-app ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          id="isit-theme-lang-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeAndLangBootstrap }}
        />
        <SkipLink />
        <AnimatedCursor />
        <AppProviders>
          <div id="main-content" className="site-motion-layer outline-none" tabIndex={-1}>
            {children}
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
