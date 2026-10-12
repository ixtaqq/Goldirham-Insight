"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CardData } from "@/lib/card";
import { formatPct, formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket, useQuote } from "./LiveMarketProvider";
import { AssetMark } from "./AssetMark";
import { Sparkline } from "./Sparkline";
import { ResearchStatus } from "./ResearchStatus";

const CLASS_LABEL = { stock: "Stock", etf: "ETF", crypto: "Crypto" };

export function AssetCard({ data, blend }: { data: CardData; blend?: number }) {
  const quote = useQuote(data.symbol);
  const { error } = useMarket();
  return (
    <Link href={"/asset/" + data.symbol} className="card asset-card">
      <div className="top"><AssetMark symbol={data.symbol} /><div className="asset-identity"><h3 className="nm">{data.name}</h3><p className="tk-line">{data.symbol} · {CLASS_LABEL[data.assetClass]}</p></div>{quote && <span className={"chg " + (quote.changePct >= 0 ? "up" : "down")}>{quote.changePct >= 0 ? "↗" : "↘"} {formatPct(quote.changePct)}</span>}</div>
      <p className="desc">{data.tagline}</p>
      <div className="px-row"><span className="px">{quote ? formatPrice(quote.price) : error ? "Unavailable" : "—"}</span><span className="sim">{quote ? sourceLabel(quote.source) : error ? "Quote unavailable" : "Loading quote…"}{error && quote ? " · Stale" : ""}</span></div>
      {!data.scores && quote?.source === "simulated" && <p className="spark-caption">Generic $100 demo seed · not an observed price</p>}
      <div><Sparkline data={data.spark} up={data.spark.at(-1)! >= data.spark[0]} width={340} height={52} className="spark" /><span className="spark-caption">Illustrative trend · simulated</span></div>
      {data.catalog && <p className="spark-caption">{data.catalog.marketCap ? `Reference cap ${data.catalog.marketCap} · 12 Oct 2026 · unverified` : "ETF theme list · not ranked by AUM"}</p>}
      {data.scores ? <dl className="scores"><div><dt className="l">Upside</dt><dd className="v">{data.scores.upside.toFixed(1)}</dd></div><div><dt className="l">Safety</dt><dd className="v">{data.scores.safety.toFixed(1)}</dd></div><div><dt className="l">AI exposure</dt><dd className="v">{data.scores.aiExposure.toFixed(1)}</dd></div></dl> : <p className="spark-caption">Scores pending research</p>}
      {blend !== undefined && <p className="asset-blend">Your blend <strong>{blend.toFixed(1)}</strong></p>}
      <ResearchStatus review={data.review} />
      <div className="foot"><span className="tier">{data.tier ? "Tier " + data.tier + " research" : "Research pending"}</span><span className="btn btn-secondary btn-xs">{data.scores ? "Read thesis" : "View asset"} <ArrowUpRight size={13} /></span></div>
    </Link>
  );
}
