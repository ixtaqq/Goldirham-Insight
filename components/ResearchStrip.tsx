"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CardData } from "@/lib/card";
import { avgScore, formatPct, formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket } from "./LiveMarketProvider";
import { AssetMark } from "./AssetMark";

export function ResearchStrip({ assets }: { assets: CardData[] }) {
  const { quotes, error } = useMarket();
  return (
    <div className="strip" role="region" aria-label="More research to explore" tabIndex={0}>
      {assets.map((asset) => {
        const quote = quotes[asset.symbol];
        return <Link className="card fresh-card" key={asset.symbol} href={"/asset/" + asset.symbol}>
          <div className="r1"><AssetMark symbol={asset.symbol} /><div><h3 className="nm">{asset.name}</h3><p className="tk">{asset.symbol}</p></div></div>
          <div className="r2"><span className="px">{quote ? formatPrice(quote.price) : "—"}</span>{quote && <span className={"chg " + (quote.changePct >= 0 ? "up" : "down")}>{formatPct(quote.changePct)}</span>}</div>
          <p className="strip-source">{quote ? sourceLabel(quote.source) : error ? "Quote unavailable" : "Loading quote…"}{error && quote ? " · Stale" : ""}</p>
          <div className="r3"><span>Score {avgScore(asset.scores).toFixed(1)}/10</span><span className="text-up">Read <ArrowUpRight size={13} /></span></div>
        </Link>;
      })}
    </div>
  );
}
