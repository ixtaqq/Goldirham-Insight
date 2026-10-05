"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn, formatCompact, formatPct, formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket, useQuote } from "./LiveMarketProvider";
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
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prevPrice = useRef<number | null>(null);

  const price = quote?.price ?? basePrice;
  const changePct = quote?.changePct ?? 0;
  const change = quote?.change ?? 0;
  const up = changePct >= 0;

  useEffect(() => {
    if (quote == null) return;
    const prev = prevPrice.current;
    if (prev != null && prev !== quote.price) {
      setFlash(quote.price > prev ? "up" : "down");
      const t = setTimeout(() => setFlash(null), 600);
      prevPrice.current = quote.price;
      return () => clearTimeout(t);
    }
    prevPrice.current = quote.price;
  }, [quote]);

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span
          className={cn(
            "font-mono text-4xl font-bold tracking-tight transition-colors duration-300 sm:text-5xl",
            flash === "up"
              ? "text-gain"
              : flash === "down"
                ? "text-loss"
                : "text-ink-950"
          )}
        >
          {formatPrice(price)}
        </span>
        {quote && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-semibold tabular-nums",
              up ? "bg-gain/12 text-gain" : "bg-loss/12 text-loss"
            )}
          >
            {up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {formatPrice(Math.abs(change))} ({formatPct(changePct)})
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5" role="status">
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full",
              quote?.source === "simulated" || error ? "bg-gold" : "bg-line"
            )}
          />
          {quote
            ? `${sourceLabel(quote.source)}${error ? " · Updates unavailable" : ""}`
            : "Illustrative base price"}
        </span>
        {quote?.marketCap ? (
          <span>
            Mkt cap{" "}
            <span className="text-muted">${formatCompact(quote.marketCap)}</span>
          </span>
        ) : null}
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
