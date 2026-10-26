"use client";

import Link from "next/link";
import type { Quote } from "@/lib/types";
import { TICKER_ORDER } from "@/lib/symbols";
import { formatPct, formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket, usePriceTick } from "./LiveMarketProvider";
import { AssetMark } from "./AssetMark";

// A still band read at a glance or scrolled sideways; only observed prices move, by flashing when they change.
export function TickerTape() {
  const { quotes, ready, error } = useMarket();
  const items = TICKER_ORDER.map((symbol) => quotes[symbol]).filter(Boolean);

  return (
    <div className="market-tape" role="region" aria-label="Market quotes">
      {error && ready && <p className="tape-status" role="status">Quote updates unavailable. Showing last received prices. Retrying automatically…</p>}
      {ready && items.length ? (
        <div className="tape-row">
          {items.map((quote) => <TapeItem key={quote.symbol} quote={quote} stale={error} />)}
        </div>
      ) : <div className="tape-row tape-row-pending"><p className="tape-item" role={error ? "status" : undefined}><span className="asset-mark asset-mark-small" aria-hidden="true" /><span className="feed-pending-text">{error ? "Quotes unavailable. Retrying…" : "Loading market data…"}</span></p></div>}
    </div>
  );
}

function TapeItem({ quote, stale }: { quote: Quote; stale: boolean }) {
  const tick = usePriceTick(quote.symbol, quote);
  return (
    <Link href={`/asset/${quote.symbol}`} className="tape-item">
      <AssetMark symbol={quote.symbol} className="asset-mark-small" />
      <span className="ticker">{quote.symbol}</span>
      <span className="quote-figure" key={tick.count} data-source={quote.source} data-tick={tick.dir}>{formatPrice(quote.price)}</span>
      <span className={quote.changePct >= 0 ? "tape-up" : "tape-down"}>{formatPct(quote.changePct)}</span>
      <small>{sourceLabel(quote.source)}{stale ? " · Stale" : ""}</small>
    </Link>
  );
}
