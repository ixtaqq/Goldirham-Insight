"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { CardData } from "@/lib/card";
import { cn, formatPct, formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket, useQuote } from "./LiveMarketProvider";
import { AssetMark } from "./AssetMark";
import { Sparkline } from "./Sparkline";

const CLASS_LABEL = { stock: "Stock", etf: "ETF", crypto: "Crypto" };

export function AssetCard({ data }: { data: CardData }) {
  const quote = useQuote(data.symbol);
  const { error } = useMarket();
  const up = quote ? quote.changePct >= 0 : true;
  const sparkUp = data.spark[data.spark.length - 1] >= data.spark[0];

  return (
    <Link href={`/asset/${data.symbol}`} className="research-card">
      <div className="research-card-header">
        <AssetMark symbol={data.symbol} />
        <div className="research-card-identity"><h3>{data.name}</h3><span>{data.symbol} <i /> {CLASS_LABEL[data.assetClass]}</span></div>
        <ArrowUpRight size={16} className="card-link-icon" />
      </div>
      <p className="research-card-thesis">{data.tagline}</p>
      <div className="research-card-price">
        {quote ? (
          <><strong>{formatPrice(quote.price)}</strong><span className={cn("price-change", up ? "is-up" : "is-down")}>
            {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{formatPct(quote.changePct)}
          </span></>
        ) : error ? <span className="quote-placeholder">Quote unavailable</span> : <span className="price-skeleton" aria-label="Loading quote" />}
      </div>
      <div className="research-card-source">{quote ? sourceLabel(quote.source) : "Market quote"}{error && quote ? " · Stale" : ""}</div>
      <div className="research-card-chart"><Sparkline data={data.spark} up={sparkUp} width={280} height={46} className="w-full" /><span>Simulated trend</span></div>
      <dl className="card-scores">
        <div><dt>Upside</dt><dd>{data.scores.upside.toFixed(1)}</dd></div>
        <div><dt>Safety</dt><dd>{data.scores.safety.toFixed(1)}</dd></div>
        <div><dt>AI exposure</dt><dd>{data.scores.aiExposure.toFixed(1)}</dd></div>
      </dl>
      <div className="research-card-footer"><span>{data.tier ? `Tier ${data.tier} research` : "Research"}</span><strong>Read thesis <ArrowUpRight size={14} /></strong></div>
    </Link>
  );
}