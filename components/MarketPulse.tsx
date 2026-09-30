"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { TICKER_ORDER } from "@/lib/symbols";
import { cn, formatPct, formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket } from "./LiveMarketProvider";
import { AssetMark } from "./AssetMark";

export function MarketPulse() {
  const { quotes, ready, error } = useMarket();
  const movers = TICKER_ORDER.map((symbol) => quotes[symbol]).filter(Boolean).sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 4);

  return (
    <div>
      <div className="section-heading"><div><p className="eyebrow">THE MARKET AT A GLANCE</p><h2>On the move.</h2><p>Largest absolute changes across the research universe. Sources shown below.</p></div></div>
      {error && !ready ? <p className="tape-status" role="status">Market quotes are unavailable. Retrying automatically…</p> : (
        <div className="pulse-grid">
          {(ready && movers.length ? movers : Array(4).fill(null)).map((quote, index) => {
            if (!quote) return <div key={index} className="pulse-item h-20 animate-pulse" aria-label="Loading market quote" />;
            const up = quote.changePct >= 0;
            return (
              <Link key={quote.symbol} href={`/asset/${quote.symbol}`} className="pulse-item">
                <AssetMark symbol={quote.symbol} />
                <span><strong>{quote.symbol}</strong><small>{sourceLabel(quote.source)}{error ? " · Stale" : ""}</small></span>
                <span className="pulse-value"><span>{formatPrice(quote.price)}</span><small className={cn(up ? "!text-gain" : "!text-loss")}>{up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{formatPct(quote.changePct)}</small></span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}