"use client";

import { formatCompact, formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket, usePriceTick, useQuote } from "./LiveMarketProvider";
import { QuoteChange } from "./QuoteChange";
import { QuoteFreshness } from "./QuoteFreshness";

export function LivePrice({
  symbol,
  basePrice,
}: {
  symbol: string;
  basePrice: number;
}) {
  const quote = useQuote(symbol);
  const { error } = useMarket();
  const tick = usePriceTick(symbol, quote);

  const price = quote?.price ?? basePrice;
  const change = quote?.change ?? 0;

  return (
    <div>
      <div className="live-price-row">
        <span className="quote-figure live-price" key={tick.count} data-source={quote?.source} data-tick={tick.dir}>
          {formatPrice(price)}
        </span>
        {quote && <QuoteChange changePct={quote.changePct} change={change} />}
      </div>

      <div className="live-price-meta">
        <span role="status">
          <span className="live-dot" data-state={quote ? (quote.source === "simulated" || error ? "simulated" : "observed") : undefined} aria-hidden="true" />
          {quote
            ? `${sourceLabel(quote.source)}${error ? " · Updates unavailable" : ""}`
            : "Illustrative base price"}
        </span>
        {quote?.marketCap ? <span>Mkt cap ${formatCompact(quote.marketCap)}</span> : null}
        {quote ? (
          <span>{quote.source === "finnhub" ? "Change vs previous close" : "24h change"}</span>
        ) : (
          <span>{error ? "Quotes unavailable · Retrying…" : "Loading quote…"}</span>
        )}
      </div>
      {quote && <QuoteFreshness quote={quote} />}
    </div>
  );
}
