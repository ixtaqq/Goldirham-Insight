"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CardData } from "@/lib/card";
import { formatPct, formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket } from "./LiveMarketProvider";
import { AssetMark } from "./AssetMark";

const FEED_ROWS = 6;

export function MarketPulse({ assets }: { assets: CardData[] }) {
  const { quotes, ready, error } = useMarket();
  const available = assets.filter((asset) => quotes[asset.symbol]);
  const advancing = available.filter((asset) => quotes[asset.symbol].changePct >= 0).length;
  const rows = [...available].sort((a, b) => Math.abs(quotes[b.symbol].changePct) - Math.abs(quotes[a.symbol].changePct)).slice(0, FEED_ROWS);
  // While quotes load, the hidden ratio and pending rows hold the loaded height so #markets links below do not shift.
  return (
    <section id="live" className="design-section live-section">
      <div className="container-x">
        <div className="sec-head"><div><p className="eyebrow">Market pulse · source-labeled</p><h2 className="display">Live on the desk, right now.</h2></div>
          <div className="ratio" aria-hidden={available.length ? undefined : true} style={available.length ? undefined : { visibility: "hidden" }}><span className="text-up">{advancing} advancing</span><span className="track"><i style={{ width: (available.length ? advancing / available.length * 100 : 0) + "%" }} /></span><span className="text-down">{available.length - advancing} declining</span></div>
        </div>
        <div className="card feed-card">
          <div className="feed-head"><span className="eyebrow"><span className="dot" />Desk activity</span><span className="feed-meta">Largest daily moves · market and simulated quotes</span></div>
          {error && <p className="feed-state" role="status">{ready ? "Updates unavailable. Showing last received quotes." : "Market quotes unavailable. Retrying automatically…"}</p>}
          {!ready && !error && <div className="feed-list" role="status">{Array.from({ length: FEED_ROWS }, (_, index) => <div key={index} className="feed-row feed-row-pending"><span className="asset-mark asset-mark-small" aria-hidden="true" />{index === 0 && "Loading the research desk…"}</div>)}</div>}
          <div className="feed-list">{rows.map((asset) => {
            const quote = quotes[asset.symbol];
            const up = quote.changePct >= 0;
            return <Link key={asset.symbol} href={"/asset/" + asset.symbol} className="feed-row">
              <AssetMark symbol={asset.symbol} className="asset-mark-small" /><strong className="tk">{asset.symbol}</strong><span className="msg">{asset.tagline}</span><span className="px">{formatPrice(quote.price)}</span><span className={"feed-change " + (up ? "text-up" : "text-down")}>{formatPct(quote.changePct)}</span><span className="feed-source">{sourceLabel(quote.source)}{error ? " · Stale" : ""}</span><span className="read">Read <ArrowUpRight size={13} /></span>
            </Link>;
          })}</div>
        </div>
      </div>
    </section>
  );
}
