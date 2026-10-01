"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CardData } from "@/lib/card";
import { formatPct, formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket, useQuote } from "./LiveMarketProvider";
import { AssetMark } from "./AssetMark";
import { Sparkline } from "./Sparkline";

const CLASS_LABEL = { stock: "Stock", etf: "ETF", crypto: "Crypto" };

export function AssetCard({ data }: { data: CardData }) {
  const quote = useQuote(data.symbol);
  const { error } = useMarket();
  return (
    <Link href={"/asset/" + data.symbol} className="card asset-card">
      <div className="top"><AssetMark symbol={data.symbol} /><div className="asset-identity"><h3 className="nm">{data.name}</h3><p className="tk-line">{data.symbol} · {CLASS_LABEL[data.assetClass]}</p></div>{quote && <span className={"chg " + (quote.changePct >= 0 ? "up" : "down")}>{quote.changePct >= 0 ? "↗" : "↘"} {formatPct(quote.changePct)}</span>}</div>
      <p className="desc">{data.tagline}</p>
      <div className="px-row"><span className="px">{quote ? formatPrice(quote.price) : error ? "Unavailable" : "—"}</span><span className="sim">{quote ? sourceLabel(quote.source) : error ? "Quote unavailable" : "Loading quote…"}{error && quote ? " · Stale" : ""}</span></div>
      <div><Sparkline data={data.spark} up={data.spark.at(-1)! >= data.spark[0]} width={340} height={52} className="spark" /><span className="spark-caption">Illustrative trend · simulated</span></div>
      <dl className="scores"><div><dt className="l">Upside</dt><dd className="v">{data.scores.upside.toFixed(1)}</dd></div><div><dt className="l">Safety</dt><dd className="v">{data.scores.safety.toFixed(1)}</dd></div><div><dt className="l">AI exposure</dt><dd className="v">{data.scores.aiExposure.toFixed(1)}</dd></div></dl>
      <div className="foot"><span className="tier">{data.tier ? "Tier " + data.tier + " research" : "Research"}</span><span className="btn btn-secondary btn-xs">Read thesis <ArrowUpRight size={13} /></span></div>
    </Link>
  );
}
