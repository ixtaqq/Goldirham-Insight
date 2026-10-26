"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CardData } from "@/lib/card";
import { formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket, usePriceTick } from "./LiveMarketProvider";
import { ScoreBars } from "./ScoreBars";
import { AssetMark } from "./AssetMark";
import { QuoteChange } from "./QuoteChange";
import { ResearchStatus } from "./ResearchStatus";

export function HeroShowcase({ assets }: { assets: CardData[] }) {
  const [selected, setSelected] = useState(assets[0].symbol);
  const asset = assets.find((item) => item.symbol === selected)!;
  const { quotes, error } = useMarket();
  const quote = quotes[asset.symbol];
  const tick = usePriceTick(asset.symbol, quote);
  return (
    <div className="radar" data-denom={asset.category}>
      <div className="segmented" role="group" aria-label="Featured asset">
        {assets.map((item) => <button key={item.symbol} aria-pressed={selected === item.symbol} onClick={() => setSelected(item.symbol)}>{item.symbol}</button>)}
      </div>
      <div className="specimen-identity" key={"identity-" + asset.symbol}>
        <AssetMark symbol={asset.symbol} className="asset-mark-large" />
        <div>
          <h2 className="specimen-name">{asset.name}</h2>
          <p className="specimen-sub"><span className="ticker">{asset.symbol}</span> · {asset.theme}</p>
        </div>
        {asset.tier && <span className="tier-tag">Tier {asset.tier}</span>}
      </div>
      <ScoreBars scores={asset.scores} variant="triad" size="lg" />
      <div className="specimen-quote">
        <span className="quote-figure" key={tick.count} data-source={quote?.source} data-tick={tick.dir}>{quote ? formatPrice(quote.price) : error ? "Unavailable" : "—"}</span>
        {quote && <QuoteChange changePct={quote.changePct} />}
        <span className="quote-source">{quote ? sourceLabel(quote.source) : error ? "Quote unavailable" : "Loading quote…"}{error && quote ? " · Stale" : ""}</span>
      </div>
      <ResearchStatus key={"seal-" + asset.symbol} review={asset.review} />
      <Link className="btn btn-primary btn-block" href={"/asset/" + asset.symbol}>Read the full thesis <ArrowUpRight size={16} aria-hidden="true" /></Link>
    </div>
  );
}
