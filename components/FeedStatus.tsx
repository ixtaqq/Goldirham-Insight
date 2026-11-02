"use client";

import { useState } from "react";
import Link from "next/link";
import { describeFreshness, FALLBACK_LABEL, formatAge, summarizeFeed } from "@/lib/feed-status";
import { formatQuoteTime } from "@/lib/quote-time";
import type { Quote } from "@/lib/types";
import { sourceLabel } from "@/lib/utils";
import { useMarket } from "./LiveMarketProvider";

const FILTERS = [
  { id: "all", label: "All quotes", matches: () => true },
  { id: "observed", label: "Observed", matches: (quote: Quote) => quote.source !== "simulated" },
  { id: "simulated", label: "Simulated", matches: (quote: Quote) => quote.source === "simulated" },
] as const;

export function FeedStatus({ assets }: { assets: { symbol: string; name: string }[] }) {
  const { quotes, ready, error, asOf } = useMarket(assets.map((asset) => asset.symbol));
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const listed = assets.flatMap((asset) => (quotes[asset.symbol] ? [{ ...asset, quote: quotes[asset.symbol] }] : []));
  const summary = summarizeFeed(listed.map((item) => item.quote));
  const matches = FILTERS.find((item) => item.id === filter)!.matches;
  const rows = listed.filter((item) => matches(item.quote));

  if (!ready) return <p className="notice" role="status">{error ? "Quotes unavailable. Retrying…" : "Loading feed status…"}</p>;

  return (
    <>
      {error && <p className="notice" role="status">Updates unavailable. Showing the last received quotes.</p>}
      <dl className="feed-summary">
        <div><dt>Observed</dt><dd>{summary.observed}<small> of {summary.total}</small></dd></div>
        <div><dt>CoinGecko</dt><dd>{summary.coingecko}</dd></div>
        <div><dt>Finnhub</dt><dd>{summary.finnhub}</dd></div>
        <div><dt>Simulated</dt><dd>{summary.simulated}</dd></div>
      </dl>
      <div className="segmented" role="group" aria-label="Filter quotes by source">
        {FILTERS.map((item) => <button key={item.id} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}
      </div>
      <div className="compare-scroll feed-table-scroll" role="region" aria-label="Quote status for each asset" tabIndex={0}>
        <table className="feed-table"><caption className="sr-only">Quote status for each asset</caption>
          <thead><tr><th scope="col">Asset</th><th scope="col">Source</th><th scope="col">Observed</th><th scope="col">State</th></tr></thead>
          <tbody>
            {rows.map(({ symbol, name, quote }) => {
              const freshness = describeFreshness(quote, asOf ?? quote.updatedAt);
              const observed = quote.source === "simulated" ? null : formatQuoteTime(quote.updatedAt);
              return (
                <tr key={symbol}>
                  <th scope="row"><Link href={"/asset/" + symbol} className="ticker">{symbol}</Link><small>{name}</small></th>
                  <td>{sourceLabel(quote.source)}</td>
                  <td>{observed ? <><time dateTime={observed.iso}>{formatAge((asOf ?? quote.updatedAt) - quote.updatedAt)} ago</time><small>{observed.label}</small></> : "Not observed"}</td>
                  <td data-tone={freshness.tone}>{freshness.label}{quote.fallback && <small>{FALLBACK_LABEL[quote.fallback]}</small>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
