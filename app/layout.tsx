import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LiveMarketProvider } from "@/components/LiveMarketProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ASSETS } from "@/lib/assets";
import { SITE_URL } from "@/lib/site";
import { REVISION_FEED_PATH } from "./revisions.xml/feed";

const sans = localFont({
  src: "./fonts/manrope-latin-variable.woff2",
  weight: "200 800",
  variable: "--font-sans",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/jetbrains-mono-latin-variable.woff2",
  weight: "100 800",
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: "Goldirham Insight — AI-era investment research",
    template: "%s · Goldirham Insight",
  },
  description:
    "Deep-dive research, 3-factor scores and source-labeled market or simulated data across AI utilities, mega stocks, semiconductors, ETFs and crypto.",
  keywords: [
    "investing",
    "AI stocks",
    "AI utilities",
    "ETF",
    "crypto",
    "research",
    "live charts",
  ],
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f2f7f4",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      {/* Not metadata.alternates: every page sets its own alternates.canonical, which replaces the layout's alternates. */}
      <head><link rel="alternate" type="application/rss+xml" title="Goldirham Insight research revisions" href={REVISION_FEED_PATH} /></head>
      <body>
        <LiveMarketProvider>
          <a href="#main-content" className="skip-link">Skip to content</a>
          <Navbar assets={ASSETS.map(({ symbol, name }) => ({ symbol, name }))} />
          <main id="main-content">{children}</main>
          <Footer />
        </LiveMarketProvider>
      </body>
    </html>
  );
}
