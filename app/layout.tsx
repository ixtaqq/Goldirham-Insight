import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LiveMarketProvider } from "@/components/LiveMarketProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ASSETS } from "@/lib/assets";

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
  title: {
    default: "Goldirham — AI-era investment research",
    template: "%s · Goldirham",
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
          <div className="site-notice"><span /> A wider perspective on the AI economy. <span /> Independent research. Clearly sourced.</div>
          <Navbar assets={ASSETS.map(({ symbol, name }) => ({ symbol, name }))} />
          <main id="main-content">{children}</main>
          <Footer />
        </LiveMarketProvider>
      </body>
    </html>
  );
}
