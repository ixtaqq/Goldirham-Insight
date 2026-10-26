import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ASSETS, getAsset } from "@/lib/assets";
import { CATEGORIES } from "@/lib/categories";
import { toCardData, toReviewStatus } from "@/lib/card";
import { inCategory } from "@/lib/explorer";
import { Hero } from "@/components/Hero";
import { MarketPulse } from "@/components/MarketPulse";
import { AssetExplorer } from "@/components/AssetExplorer";
import { TickerTape } from "@/components/TickerTape";
import { FrameworkPreview } from "@/components/FrameworkPreview";
import { ResearchStrip } from "@/components/ResearchStrip";

const FEATURED = ["NVDA", "CEG", "MSFT", "BTC", "GOOGL", "VST", "AVGO", "SOL", "AAPL"];
const FACTORS = [
  { title: "The upside", question: "What could go right?", body: "The return potential if the thesis plays out, and the catalysts that could get it there." },
  { title: "The safety", question: "What could go wrong?", body: "Balance-sheet strength, business-model resilience, and how the asset behaves when the market changes its mind." },
  { title: "The AI exposure", question: "How deep is the connection?", body: "How structurally tied the asset is to the build-out of artificial intelligence." },
];

export default function HomePage() {
  const assets = [...ASSETS].sort((a, b) => {
    const first = FEATURED.indexOf(a.symbol);
    const second = FEATURED.indexOf(b.symbol);
    return (first < 0 ? FEATURED.length : first) - (second < 0 ? FEATURED.length : second);
  }).map(toCardData);
  const spotlight = ["NVDA", "CEG", "BTC"].map((symbol) => toCardData(getAsset(symbol)!));
  const examples = ["AAPL", "NVDA", "SOL"].map((symbol) => {
    const { name, category, scores, entryRange, whyItWins, research } = getAsset(symbol)!;
    return { symbol, name, category, scores, entryRange, whyItWins, review: toReviewStatus(research) };
  });
  const scoredCount = ASSETS.filter((asset) => asset.scores).length;

  return (
    <>
      <Hero assetCount={ASSETS.length} scoredCount={scoredCount} categoryCount={CATEGORIES.length} spotlight={spotlight} />
      <TickerTape />
      <MarketPulse assets={assets} />
      <AssetExplorer assets={assets} />
      <section className="discovery-section" aria-labelledby="discovery-heading">
        <div className="container-x">
          <div className="section-head"><h2 id="discovery-heading" className="section-title">More ideas on the desk.</h2><Link className="btn btn-quiet btn-sm" href="#markets">View all <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
          <ResearchStrip assets={["AMD", "NEE", "LINK", "SMH", "RENDER", "MU", "ICLN"].map((symbol) => toCardData(getAsset(symbol)!))} />
        </div>
      </section>
      <section id="approach" className="band framework" aria-labelledby="framework-heading">
        <div className="container-x framework-grid">
          <div className="framework-copy">
            <h2 id="framework-heading" className="section-title">Three lenses, the same on every asset.</h2>
            <p>A good thesis asks hard questions. Every scored asset goes through the same three lenses, so you can see the opportunity and what could go wrong, scored the same way every time.</p>
            <dl className="lens-list">{FACTORS.map((factor) => <div className="lens" key={factor.title}><dt>{factor.title}<span>{factor.question}</span></dt><dd>{factor.body}</dd></div>)}</dl>
            <Link href="/asset/AAPL" className="btn btn-on-band">See the framework in action <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
          <FrameworkPreview assets={examples} />
        </div>
      </section>
      <section id="why" className="section" aria-labelledby="legend-heading">
        <div className="container-x">
          <div className="section-head"><div><h2 id="legend-heading" className="section-title">How to read the desk.</h2><p className="section-lede">Each mark means the same thing on every card, chart and page.</p></div></div>
          <div className="legend-list">
            <div className="legend-row">
              <div className="legend-sample" aria-hidden="true"><span className="quote-figure" data-source="coingecko">$80,203.00</span><span className="quote-source">CoinGecko</span></div>
              <div><h3 className="legend-term">Observed quotes print solid</h3><p className="legend-text">Prices from CoinGecko or Finnhub carry the provider&apos;s name, and each asset page shows when the provider observed them.</p></div>
            </div>
            <div className="legend-row">
              <div className="legend-sample" aria-hidden="true"><span className="quote-figure" data-source="simulated">$100.00</span><span className="quote-source">Simulated</span></div>
              <div><h3 className="legend-term">Simulations are hatched</h3><p className="legend-text">Where no feed is available, prices and charts are labelled illustrations. They are never presented as market data, and simulated charts carry the word across the plot.</p></div>
            </div>
            <div className="legend-row">
              <div className="legend-sample" aria-hidden="true"><span className="research-status" data-review="unreviewed"><span>Not reviewed</span></span><span className="research-status" data-review="reviewed"><span>Reviewed</span></span></div>
              <div><h3 className="legend-term">A seal only for real reviews</h3><p className="legend-text">Scores and theses are editorial opinions. A thesis is shown as reviewed only when a named reviewer, the review date, supporting sources and all three score rationales are recorded.</p></div>
            </div>
            <div className="legend-row">
              <div className="legend-sample" aria-hidden="true"><span className="denom-stripe">{CATEGORIES.map((category) => <i key={category.slug} data-denom={category.slug} />)}</span></div>
              <div>
                <h3 className="legend-term">Five themes, one colour each</h3>
                <p className="legend-text">Energy, compute, platforms, baskets and crypto. Follow the whole value chain; the colour on every card names its theme.</p>
                <div className="legend-themes">{CATEGORIES.map((category) => <Link key={category.slug} href={`/category/${category.slug}`} className="theme-link" data-denom={category.slug}>{category.name}<span className="sr-only"> ({assets.filter((asset) => inCategory(asset, category.slug)).length} assets)</span></Link>)}</div>
              </div>
            </div>
          </div>
          <div className="legend-close">
            <p>Put up to three theses side by side, with their risks and review status.</p>
            <Link href="/compare" className="btn btn-primary">Open the comparison <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
