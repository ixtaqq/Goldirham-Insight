"use client";

import Link from "next/link";
import { TICKER_ORDER } from "@/lib/symbols";
import { cn, formatPct, formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket } from "./LiveMarketProvider";

export function TickerTape() {
  const { quotes, ready, error } = useMarket();
  const items = TICKER_ORDER.map((symbol) => quotes[symbol]).filter(Boolean);
  const row = ready && items.length ? [...items, ...items] : [];

  return (
    <div className="market-tape" aria-label="Market quotes">
      {error && <p className="tape-status" role="status">{ready ? "Quote updates unavailable. Showing last received prices." : "Market quotes unavailable."} Retrying automatically…</p>}
      {row.length ? (
        <div className="tape-row">
          {row.map((quote, index) => (
            <Link key={`${quote.symbol}-${index}`} href={`/asset/${quote.symbol}`} className="tape-item" tabIndex={index >= items.length ? -1 : undefined} aria-hidden={index >= items.length ? true : undefined}>
              <strong>{quote.symbol}</strong><span className="tape-price">{formatPrice(quote.price)}</span>
              <span className={cn(quote.changePct >= 0 ? "text-gain" : "text-loss")}>{formatPct(quote.changePct)}</span>
              <small>{sourceLabel(quote.source)}{error ? " · Stale" : ""}</small>
            </Link>
          ))}
        </div>
      ) : !error ? <p className="tape-status">Loading market data…</p> : null}
    </div>
  );
}