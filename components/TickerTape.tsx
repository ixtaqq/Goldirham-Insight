"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";
import type { Quote } from "@/lib/types";
import { TICKER_ORDER } from "@/lib/symbols";
import { formatPct, formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket, usePriceTick } from "./LiveMarketProvider";
import { AssetMark } from "./AssetMark";

// A band that drifts right to left; observed prices also flash when they change. The quotes render twice so the
// loop is seamless: the copy is inert and hidden from assistive technology, so each quote is reached once.
// Hover, focus and an off-screen band pause the drift; reduced motion keeps a still band that scrolls sideways.
export function TickerTape() {
  const { quotes, ready, error } = useMarket(TICKER_ORDER);
  const items = TICKER_ORDER.map((symbol) => quotes[symbol]).filter(Boolean);
  const band = useRef<HTMLDivElement>(null);

  // The drift is a compositor animation; pausing it off screen keeps the GPU idle.
  useEffect(() => {
    const element = band.current;
    if (!element) return;
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) delete element.dataset.paused;
      else element.dataset.paused = "";
    });
    visibility.observe(element);
    return () => visibility.disconnect();
  }, []);

  return (
    <div className="market-tape" role="region" aria-label="Market quotes" ref={band}>
      {error && ready && <p className="tape-status" role="status">Quote updates unavailable. Showing last received prices. Retrying automatically…</p>}
      {ready && items.length ? (
        <div className="tape-row">
          <div className="tape-track" style={{ "--tape-count": items.length } as CSSProperties}>
            <div className="tape-set">{items.map((quote) => <TapeItem key={quote.symbol} quote={quote} stale={error} />)}</div>
            <div className="tape-set" aria-hidden="true" inert>{items.map((quote) => <TapeItem key={quote.symbol} quote={quote} stale={error} />)}</div>
          </div>
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
