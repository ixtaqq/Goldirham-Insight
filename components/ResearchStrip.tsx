"use client";

import Link from "next/link";
import type { CardData } from "@/lib/card";
import { avgScore, formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket } from "./LiveMarketProvider";
import { AssetMark } from "./AssetMark";
import { QuoteChange } from "./QuoteChange";
import { ResearchStatus } from "./ResearchStatus";

export function ResearchStrip({ assets }: { assets: CardData[] }) {
  const { quotes, error } = useMarket();
  return (
    <div className="strip" role="region" aria-label="More research to explore" tabIndex={0}>
      {assets.map((asset) => {
        const quote = quotes[asset.symbol];
        return <Link className="strip-card" key={asset.symbol} href={"/asset/" + asset.symbol} data-denom={asset.category}>
          <div className="strip-head"><AssetMark symbol={asset.symbol} /><div><h3 className="strip-name">{asset.name}</h3><p className="ticker">{asset.symbol}</p></div></div>
          <p className="strip-score">{asset.scores ? <>Composite score<strong>{avgScore(asset.scores).toFixed(1)}</strong></> : "Scores pending"}</p>
          <div className="strip-quote"><span className="quote-figure" data-source={quote?.source}>{quote ? formatPrice(quote.price) : "—"}</span>{quote && <QuoteChange changePct={quote.changePct} />}</div>
          <p className="quote-source">{quote ? sourceLabel(quote.source) : error ? "Quote unavailable" : "Loading quote…"}{error && quote ? " · Stale" : ""}</p>
          <ResearchStatus review={asset.review} />
        </Link>;
      })}
    </div>
  );
}
