"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CardData } from "@/lib/card";
import { getCategory } from "@/lib/categories";
import { formatPct, formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket } from "./LiveMarketProvider";
import { AssetMark } from "./AssetMark";

const FEED_ROWS = 6;

export function MarketPulse({ assets }: { assets: CardData[] }) {
  const { quotes, ready, error } = useMarket();
  const available = assets.filter((asset) => quotes[asset.symbol]);
  const advancing = available.filter((asset) => quotes[asset.symbol].changePct >= 0).length;
  const rows = [...available].sort((a, b) => Math.abs(quotes[b.symbol].changePct) - Math.abs(quotes[a.symbol].changePct)).slice(0, FEED_ROWS);
  // Until quotes first arrive, the hidden ratio and pending rows hold the loaded height so #markets links below do not shift.
  return (
    <section id="live" className="live-section" aria-labelledby="live-heading">
      <div className="container-x">
        <div className="section-head">
          <div>
            <h2 id="live-heading" className="section-title">Today&apos;s largest moves</h2>
            <p className="section-lede">The biggest daily changes across the desk. Observed quotes print solid; simulated prices are hatched.</p>
          </div>
          <div className="ratio" aria-hidden={available.length ? undefined : true} style={available.length ? undefined : { visibility: "hidden" }}><span className="text-up">{advancing} advancing</span><span className="track"><i style={{ width: (available.length ? advancing / available.length * 100 : 0) + "%" }} /></span><span className="text-down">{available.length - advancing} declining</span></div>
        </div>
        <div className="feed">
          {error && ready && <p className="feed-state" role="status">Updates unavailable. Showing last received quotes.</p>}
          {!ready && <div className="feed-list" role="status">{Array.from({ length: FEED_ROWS }, (_, index) => <div key={index} className="feed-row feed-row-pending"><span className="asset-mark asset-mark-small" aria-hidden="true" />{index === 0 && <span className="feed-pending-text">{error ? "Quotes unavailable. Retrying…" : "Loading desk activity…"}</span>}</div>)}</div>}
          <div className="feed-list">{rows.map((asset) => {
            const quote = quotes[asset.symbol];
            return <Link key={asset.symbol} href={"/asset/" + asset.symbol} className="feed-row" data-denom={asset.category}>
              <AssetMark symbol={asset.symbol} className="asset-mark-small" />
              <span className="ticker">{asset.symbol}</span>
              <span className="feed-name">{asset.name}</span>
              <span className="feed-theme denom-label"><i />{getCategory(asset.category)?.name}</span>
              <span className="quote-figure" data-source={quote.source}>{formatPrice(quote.price)}</span>
              <span className={"feed-change " + (quote.changePct >= 0 ? "text-up" : "text-down")}>{formatPct(quote.changePct)}</span>
              <span className="feed-source">{sourceLabel(quote.source)}{error ? " · Stale" : ""}</span>
              <ArrowUpRight size={16} className="feed-go" aria-hidden="true" />
            </Link>;
          })}</div>
        </div>
      </div>
    </section>
  );
}
