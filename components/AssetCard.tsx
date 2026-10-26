"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CardData } from "@/lib/card";
import { getCategory } from "@/lib/categories";
import { formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket, useQuote } from "./LiveMarketProvider";
import { AssetMark } from "./AssetMark";
import { QuoteChange } from "./QuoteChange";
import { ResearchStatus } from "./ResearchStatus";
import { ScoreBars } from "./ScoreBars";

const CLASS_LABEL = { stock: "Stock", etf: "ETF", crypto: "Crypto" };

export function AssetCard({ data, blend }: { data: CardData; blend?: number }) {
  const quote = useQuote(data.symbol);
  const { error } = useMarket();
  const theme = getCategory(data.category)?.name;
  return (
    <Link href={"/asset/" + data.symbol} className="asset-card" data-denom={data.category}>
      <div className="card-head">
        <AssetMark symbol={data.symbol} />
        <div className="card-identity">
          <h3 className="card-name">{data.name}</h3>
          <p className="card-meta"><span className="ticker">{data.symbol}</span>{CLASS_LABEL[data.assetClass] !== theme && <span>{CLASS_LABEL[data.assetClass]}</span>}<span className="denom-label"><i />{theme}</span></p>
        </div>
        <ArrowUpRight size={18} className="card-go" aria-hidden="true" />
      </div>
      <p className="card-thesis">{data.tagline}</p>
      <ScoreBars scores={data.scores} variant="triad" />
      {blend !== undefined && <p className="asset-blend">Your blend <strong>{blend.toFixed(1)}</strong></p>}
      <div className="card-quote">
        <span className="quote-figure" data-source={quote?.source}>{quote ? formatPrice(quote.price) : error ? "Unavailable" : "—"}</span>
        {quote && <QuoteChange changePct={quote.changePct} />}
        <span className="quote-source">{quote ? sourceLabel(quote.source) : error ? "Quote unavailable" : "Loading quote…"}{error && quote ? " · Stale" : ""}</span>
      </div>
      {!data.scores && quote?.source === "simulated" && <p className="card-note">Generic $100 demo seed · not an observed price</p>}
      {data.catalog && <p className="card-note">{data.catalog.marketCap ? `Reference cap ${data.catalog.marketCap} · 12 Oct 2026 · unverified` : "ETF theme list · not ranked by AUM"}</p>}
      <div className="card-foot">
        <ResearchStatus review={data.review} />
        <span className="card-tier">{data.tier ? "Tier " + data.tier + " research" : "Research pending"}</span>
      </div>
    </Link>
  );
}
