"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CardData } from "@/lib/card";
import { formatPct, formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket } from "./LiveMarketProvider";
import { AssetMark } from "./AssetMark";

export function MarketPulse({ assets }: { assets: CardData[] }) {
  const { quotes, ready, error } = useMarket();
  const available = assets.filter((asset) => quotes[asset.symbol]);
  const advancing = available.filter((asset) => quotes[asset.symbol].changePct >= 0).length;
  const rows = [...available].sort((a, b) => Math.abs(quotes[b.symbol].changePct) - Math.abs(quotes[a.symbol].changePct)).slice(0, 6);
  return (
    <section id="live" className="design-section live-section">
      <div className="container-x">
        <div className="sec-head"><div><p className="eyebrow">Market pulse · source-labeled</p><h2 className="display">Live on the desk, right now.</h2></div>
          {available.length > 0 && <div className="ratio"><span className="text-up">{advancing} advancing</span><span className="track"><i style={{ width: (advancing / available.length * 100) + "%" }} /></span><span className="text-down">{available.length - advancing} declining</span></div>}
        </div>
        <div className="card feed-card">
          <div className="feed-head"><span className="eyebrow"><span className="dot" />Desk activity</span><span className="feed-meta">Largest daily moves · market and simulated quotes</span></div>
          {error && <p className="feed-state" role="status">{ready ? "Updates unavailable. Showing last received quotes." : "Market quotes unavailable. Retrying automatically…"}</p>}
          {!ready && !error && <p className="feed-state" role="status">Loading the research desk…</p>}
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
