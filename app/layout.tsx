import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./reference-design.css";
import { LiveMarketProvider } from "@/components/LiveMarketProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ASSETS } from "@/lib/assets";

const sans = localFont({
  src: "./fonts/inter-variable.ttf",
  weight: "100 900",
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
  title: {
    default: "Goldirham Lens — AI-era investment research",
    template: "%s · Goldirham Lens",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans">
        <LiveMarketProvider>
          <a href="#main-content" className="skip-link">Skip to content</a>
          <div className="topbar"><div className="container-x"><div className="left"><span className="dot" /><span>Independent research desk</span><span className="mono topbar-detail"> · clearly sourced</span></div><div className="right"><span className="mono">{ASSETS.length} assets · 5 themes · 3 factors</span></div></div></div>
          <Navbar assets={ASSETS.map(({ symbol, name }) => ({ symbol, name }))} />
          <main id="main-content">{children}</main>
          <Footer />
        </LiveMarketProvider>
      </body>
    </html>
  );
}
