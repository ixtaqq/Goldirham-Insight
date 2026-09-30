import Link from "next/link";
import { ArrowUpRight, MoveUpRight } from "lucide-react";
import { ASSETS, getAsset, getAssetsByCategory } from "@/lib/assets";
import { CATEGORIES } from "@/lib/categories";
import { toCardData } from "@/lib/card";
import { Hero } from "@/components/Hero";
import { MarketPulse } from "@/components/MarketPulse";
import { CategoryGrid } from "@/components/CategoryGrid";
import { AssetExplorer } from "@/components/AssetExplorer";
import { TickerTape } from "@/components/TickerTape";

const FEATURED = ["NVDA", "CEG", "MSFT", "BTC", "GOOGL", "VST", "AVGO", "SOL"];

export default function HomePage() {
  const counts = Object.fromEntries(CATEGORIES.map((category) => [category.slug, getAssetsByCategory(category.slug).length]));
  const assets = [...ASSETS].sort((a, b) => {
    const first = FEATURED.indexOf(a.symbol);
    const second = FEATURED.indexOf(b.symbol);
    return (first < 0 ? FEATURED.length : first) - (second < 0 ? FEATURED.length : second);
  }).map(toCardData);
  const spotlight = ["NVDA", "CEG", "BTC"].map((symbol) => toCardData(getAsset(symbol)!));

  return (
    <>
      <Hero assetCount={ASSETS.length} categoryCount={CATEGORIES.length} spotlight={spotlight} />
      <TickerTape />
      <AssetExplorer assets={assets} />
      <section className="site-container section-space themes-section">
        <div className="section-heading"><div><p className="eyebrow">CONNECT THE DOTS</p><h2>Five angles. One changing world.</h2><p>Follow the value chain, from energy to intelligence.</p></div><MoveUpRight size={34} strokeWidth={1} className="section-arrow" /></div>
        <CategoryGrid counts={counts} />
      </section>
      <section id="approach" className="site-container section-space">
        <div className="approach-panel">
          <div className="approach-copy"><p className="eyebrow">A FRAMEWORK, NOT A FORECAST</p><h2>Less noise.<br />More perspective.</h2><p>A good thesis asks hard questions. We put every asset through the same three lenses, so you can see the opportunity and what could go wrong.</p><Link href="/asset/NVDA" className="text-link">See the framework in action <ArrowUpRight size={16} /></Link><span className="approach-watermark" aria-hidden="true">3</span></div>
          <div className="approach-factors">
            {[{ number: "01", title: "The upside", detail: "What could go right?", body: "The return potential if the thesis plays out — and the catalysts that could get it there." }, { number: "02", title: "The safety", detail: "What could go wrong?", body: "The balance sheet, business model, and resilience when the market changes its mind." }, { number: "03", title: "The AI exposure", detail: "How deep is the connection?", body: "A clear view of how structurally tied the asset is to the build-out of artificial intelligence." }].map((factor) => (
              <div className="approach-factor" key={factor.number}><span>{factor.number}</span><div><h3>{factor.title}<small>{factor.detail}</small></h3><p>{factor.body}</p></div><ArrowUpRight size={18} /></div>
            ))}
          </div>
        </div>
      </section>
      <section className="site-container section-space"><MarketPulse /></section>
      <section className="site-container closing-section"><div><p className="eyebrow">CONVICTION STARTS WITH CURIOSITY</p><h2>Understand the shift.<br />Find your place in it.</h2></div><Link href="#markets" className="button button-dark">Explore the research <ArrowUpRight size={18} /></Link></section>
    </>
  );
}