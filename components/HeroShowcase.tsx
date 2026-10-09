"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import type { CardData } from "@/lib/card";
import { formatPct, formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket } from "./LiveMarketProvider";
import { Sparkline } from "./Sparkline";
import { ScoreBars } from "./ScoreBars";
import { AssetMark } from "./AssetMark";
import { ResearchStatus } from "./ResearchStatus";

export function HeroShowcase({ assets }: { assets: CardData[] }) {
  const [selected, setSelected] = useState(assets[0].symbol);
  const asset = assets.find((item) => item.symbol === selected)!;
  const { quotes, error } = useMarket();
  const quote = quotes[asset.symbol];
  return (
    <div className="radar-wrap">
      <div className="card radar">
        <div className="head"><span className="eyebrow"><span className="dot" />Research radar</span><span className="pill soft radar-caption">The big picture</span></div>
        <div className="segmented seg" role="group" aria-label="Featured asset">
          {assets.map((item) => <button key={item.symbol} aria-pressed={selected === item.symbol} data-active={selected === item.symbol} onClick={() => setSelected(item.symbol)}>{item.symbol}</button>)}
        </div>
        <div className="radar-body">
          <div className="name-row"><div className="radar-identity"><AssetMark symbol={asset.symbol} /><div><h2 className="name">{asset.name}</h2><p className="sub">{asset.symbol} · {asset.theme}</p></div></div><span className="tier-pill">TIER {asset.tier}</span></div>
          <div className="price-row"><span className="price">{quote ? formatPrice(quote.price) : error ? "Unavailable" : "—"}</span>{quote && <span className={"chg " + (quote.changePct >= 0 ? "up" : "down")}>{quote.changePct >= 0 ? "↗" : "↘"} {formatPct(quote.changePct)}</span>}</div>
          <p className="sim">{quote ? sourceLabel(quote.source) : error ? "Quote unavailable" : "Loading quote…"}{error && quote ? " · Stale" : ""}</p>
          <Sparkline data={asset.spark} up={asset.spark.at(-1)! >= asset.spark[0]} width={380} height={64} className="radar-spark" />
          <p className="chart-note">Illustrative trend · simulated</p>
          <ScoreBars scores={asset.scores} className="bars" />
          <ResearchStatus review={asset.review} />
        </div>
        <Link className="btn btn-primary" href={"/asset/" + asset.symbol}>Read the full thesis <ArrowUpRight size={16} /></Link>
      </div>
      <div className="card float-card"><span className="icon-tile t-green"><TrendingUp size={20} /></span><div><p className="t1">Look beyond the ticker.</p><p className="t2">Understand what you own.</p></div></div>
    </div>
  );
}
