import Link from "next/link";
import { ArrowRight, ArrowUpRight, ClipboardList, Gauge, Globe2, Layers } from "lucide-react";
import { ASSETS, getAsset } from "@/lib/assets";
import { CATEGORIES } from "@/lib/categories";
import { toCardData } from "@/lib/card";
import { Hero } from "@/components/Hero";
import { MarketPulse } from "@/components/MarketPulse";
import { AssetExplorer } from "@/components/AssetExplorer";
import { TickerTape } from "@/components/TickerTape";
import { FrameworkPreview } from "@/components/FrameworkPreview";
import { ResearchStrip } from "@/components/ResearchStrip";

const FEATURED = ["NVDA", "CEG", "MSFT", "BTC", "GOOGL", "VST", "AVGO", "SOL", "AAPL"];
const FACTORS = [
  { title: "The upside", question: "What could go right?", body: "The return potential if the thesis plays out — and the catalysts that could get it there." },
  { title: "The safety", question: "What could go wrong?", body: "Balance-sheet strength, business-model resilience, and how the asset behaves when the market changes its mind." },
  { title: "The AI exposure", question: "How deep is the connection?", body: "How structurally tied the asset is to the build-out of artificial intelligence." },
];
const PRINCIPLES = [
  { icon: Layers, tone: "t-green", title: "Independent thinking", body: "Scores and theses are editorial opinions. Explore the reasoning and make up your own mind." },
  { icon: ClipboardList, tone: "t-blue", title: "Clearly sourced", body: "Every quote and chart identifies its source. Simulated illustrations are always labeled." },
  { icon: Gauge, tone: "t-amber", title: "Consistent scorecard", body: "Upside, safety, AI exposure — the same three lenses on every single asset." },
  { icon: Globe2, tone: "t-gray", title: "Wider perspective", body: "Energy, compute, platforms, baskets, crypto — follow the whole value chain." },
];

export default function HomePage() {
  const assets = [...ASSETS].sort((a, b) => {
    const first = FEATURED.indexOf(a.symbol);
    const second = FEATURED.indexOf(b.symbol);
    return (first < 0 ? FEATURED.length : first) - (second < 0 ? FEATURED.length : second);
  }).map(toCardData);
  const spotlight = ["NVDA", "CEG", "BTC"].map((symbol) => toCardData(getAsset(symbol)!));
  const examples = ["AAPL", "NVDA", "SOL"].map((symbol) => {
    const { name, scores, entryRange, whyItWins } = getAsset(symbol)!;
    return { symbol, name, scores, entryRange, whyItWins };
  });

  return (
    <>
      <Hero assetCount={ASSETS.length} categoryCount={CATEGORIES.length} spotlight={spotlight} />
      <TickerTape />
      <MarketPulse assets={assets} />
      <AssetExplorer assets={assets} />
      <section className="design-section discovery-section">
        <div className="container-x"><div className="sec-head"><div><p className="eyebrow">Beyond the usual names</p><h2 className="display">More ideas on the desk.</h2></div><Link className="btn btn-secondary btn-sm" href="#markets">View all <ArrowUpRight size={14} /></Link></div><ResearchStrip assets={["AMD", "NEE", "LINK", "SMH", "RENDER", "MU", "ICLN"].map((symbol) => toCardData(getAsset(symbol)!))} /></div>
      </section>
      <section id="approach" className="design-section">
        <div className="container-x"><div className="panel-dark">
          <div className="glow g1" aria-hidden="true" /><div className="glow g2" aria-hidden="true" />
          <div className="panel-grid"><div><p className="eyebrow">A framework, not a forecast</p><h2 className="display">Less noise.<br />More perspective.</h2><p>A good thesis asks hard questions. We put every asset through the same three lenses, so you can see the opportunity and what could go wrong — scored the same way, every time.</p><div className="factor-list">{FACTORS.map((factor, index) => <div className="factor" key={factor.title}><span className="no">0{index + 1}</span><div><h3 className="t">{factor.title}</h3><div className="q">{factor.question}</div><div className="d">{factor.body}</div></div></div>)}</div><Link href="/asset/AAPL" className="btn btn-white framework-cta">See the framework in action <ArrowUpRight size={16} /></Link></div><FrameworkPreview assets={examples} /></div>
        </div></div>
      </section>
      <section id="why" className="design-section why-section"><div className="container-x"><div className="sec-head"><div><p className="eyebrow">Why Goldirham Lens</p><h2 className="display">A new lens for the AI economy.</h2><p className="sec-sub">Independent research for a world taking shape. Connect the dots. Build your own conviction.</p></div></div><div className="why-grid">{PRINCIPLES.map((item) => <div className="card why-card" key={item.title}><span className={"icon-tile " + item.tone}><item.icon size={20} aria-hidden="true" /></span><h3 className="t">{item.title}</h3><p className="d">{item.body}</p></div>)}</div></div></section>
      <section className="design-section cta-band"><div className="container-x"><div className="panel-dark"><div className="glow g1" aria-hidden="true" /><div className="cta-inner"><div><p className="eyebrow">Conviction starts with curiosity</p><h2 className="display">Understand the shift.<br />Find your place in it.</h2></div><Link href="#markets" className="btn btn-white">Explore the research <ArrowRight size={16} /></Link></div></div></div></section>
    </>
  );
}
