import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { BrandMark } from "./BrandMark";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="footer-main">
          <div className="footer-brand"><Link href="/" className="brand"><BrandMark className="brand-mark" /><span>Goldirham Insight<span className="brand-period">.</span></span></Link><p>Independent research for a world taking shape. Connect the dots. Build your own conviction.</p></div>
          <div className="footer-links">
            <div><h2>Explore the research</h2>{CATEGORIES.map((category) => <Link key={category.slug} href={`/category/${category.slug}`}>{category.name}</Link>)}</div>
            <div><h2>The details</h2><Link href="/#approach">Our approach</Link><Link href="/#markets">All researched assets</Link><a href="https://www.coingecko.com/" target="_blank" rel="noreferrer">Crypto data · CoinGecko ↗</a><a href="https://finnhub.io/" target="_blank" rel="noreferrer">Stock data · Finnhub ↗</a><a href="https://www.tradingview.com/" target="_blank" rel="noreferrer">Charts by TradingView ↗</a></div>
          </div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Goldirham Insight. A little clarity goes a long way.</span><span>Built for research. Made for the curious.</span></div>
        <p className="footer-disclaimer">Goldirham Insight is an educational research and demonstration project. Nothing here is financial advice, a recommendation, or an offer to buy or sell any security or digital asset. Scores and theses are editorial opinions for illustration. Prices and historical charts may be simulated; each identifies its source. Do your own research and consult a licensed advisor before investing.</p>
      </div>
    </footer>
  );
}
