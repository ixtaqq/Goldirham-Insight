"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Sparkles } from "lucide-react";
import type { CardData } from "@/lib/card";
import { formatPct, formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket } from "./LiveMarketProvider";
import { AssetMark } from "./AssetMark";
import { Sparkline } from "./Sparkline";

export function HeroShowcase({ assets }: { assets: CardData[] }) {
  const { quotes, error } = useMarket();
  const featured = assets[0];
  const quote = quotes[featured.symbol];

  return (
    <div className="hero-showcase" aria-label="Featured research">
      <div className="showcase-orbit orbit-one" aria-hidden="true" />
      <div className="showcase-orbit orbit-two" aria-hidden="true" />
      <div className="radar-card">
        <div className="radar-heading"><span>Research radar</span><span className="small-chip">THE BIG PICTURE</span></div>
        <p>A few ideas on our desk.</p>
        <div className="radar-list">
          {assets.map((asset) => (
            <Link href={`/asset/${asset.symbol}`} key={asset.symbol}>
              <AssetMark symbol={asset.symbol} />
              <span><strong>{asset.symbol}</strong><small>{asset.name}</small></span>
              <span className="radar-score">{asset.scores.aiExposure.toFixed(1)}<small>AI exposure</small></span>
              <ArrowUpRight size={14} />
            </Link>
          ))}
        </div>
        <div className="radar-footnote"><Check size={13} /> The thesis. The upside. The risks.</div>
      </div>

      <Link className="spotlight-card" href={`/asset/${featured.symbol}`}>
        <div className="spotlight-art">
          <span className="spotlight-label">THE AI INFRASTRUCTURE PLAY</span>
          <div className="chip-art" aria-hidden="true"><span>N</span></div>
          <span className="spotlight-symbol">{featured.symbol}</span>
          <span className="spotlight-corner"><ArrowUpRight size={18} /></span>
        </div>
        <div className="spotlight-content">
          <div className="spotlight-title"><h2>{featured.name}</h2><span className="small-chip">TIER {featured.tier}</span></div>
          <p>The platform behind the intelligence.</p>
          <div className="spotlight-price">
            <strong>{quote ? formatPrice(quote.price) : "Research in focus"}</strong>
            {quote && <span className={quote.changePct >= 0 ? "text-gain" : "text-loss"}>{formatPct(quote.changePct)}</span>}
          </div>
          <div className="spotlight-source">{quote ? sourceLabel(quote.source) : error ? "Quote unavailable" : "Loading quote…"}{error && quote ? " · Updates unavailable" : ""}</div>
          <Sparkline data={featured.spark} width={280} height={45} />
          <div className="spotlight-chart-label">Illustrative trend</div>
          <div className="spotlight-cta">Read the full thesis <ArrowRight size={16} /></div>
        </div>
      </Link>
      <div className="insight-tag"><span><Sparkles size={17} /></span><div><strong>Look beyond the ticker.</strong><small>Understand what you own.</small></div></div>
    </div>
  );
}
