import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { BrandMark } from "./BrandMark";

const SOURCES = [
  { href: "https://www.coingecko.com/", label: "Crypto data · CoinGecko" },
  { href: "https://finnhub.io/", label: "Stock data · Finnhub" },
  { href: "https://www.tradingview.com/", label: "Charts by TradingView" },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-x">
        <div className="footer-main">
          <div className="footer-brand">
            <Link href="/" className="brand"><BrandMark className="brand-mark" /><span>Goldirham Insight<span className="brand-period">.</span></span></Link>
            <p>Educational research on the AI build-out. Every price names its source, and every thesis shows whether it has been reviewed.</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <div><h2>Explore the research</h2>{CATEGORIES.map((category) => <Link key={category.slug} href={`/category/${category.slug}`}>{category.name}</Link>)}</div>
            <div>
              <h2>The details</h2>
              <Link href="/#approach">Our approach</Link>
              <Link href="/#why">How to read the desk</Link>
              <Link href="/#markets">All researched assets</Link>
              {SOURCES.map((source) => (
                <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
                  {source.label}<ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </div>
          </nav>
        </div>
        <p className="footer-disclaimer">Goldirham Insight is an educational research and demonstration project. Nothing here is financial advice, a recommendation, or an offer to buy or sell any security or digital asset. Scores and theses are editorial opinions for illustration. Prices and historical charts may be simulated; each identifies its source. Do your own research and consult a licensed advisor before investing.</p>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Goldirham Insight</span><span>Educational research, not financial advice.</span></div>
      </div>
    </footer>
  );
}
