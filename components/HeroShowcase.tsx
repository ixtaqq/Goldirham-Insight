"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CardData } from "@/lib/card";
import { formatPrice, sourceLabel } from "@/lib/utils";
import { useMarket, usePriceTick } from "./LiveMarketProvider";
import { ScoreBars } from "./ScoreBars";
import { AssetMark } from "./AssetMark";
import { QuoteChange } from "./QuoteChange";
import { ResearchStatus } from "./ResearchStatus";

// Degrees of tilt across the card's full width or height; the card leans at most half this either way.
const TILT = 20;
// How far the card rises toward the viewer under a mouse, in pixels.
const LIFT = 40;

export function HeroShowcase({ assets }: { assets: CardData[] }) {
  const [selected, setSelected] = useState(assets[0].symbol);
  const asset = assets.find((item) => item.symbol === selected)!;
  const { quotes, error } = useMarket(assets.map((item) => item.symbol));
  const quote = quotes[asset.symbol];
  const tick = usePriceTick(asset.symbol, quote);
  const stage = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLElement>(null);

  // The card follows a mouse pointer; touch, pens and reduced motion keep its resting pose.
  useEffect(() => {
    const area = stage.current;
    const drift = float.current;
    const face = card.current;
    const light = sheen.current;
    if (!area || !drift || !face || !light) return;
    // The idle sway is a compositor animation; pausing it off screen keeps the GPU idle.
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) delete drift.dataset.paused;
      else drift.dataset.paused = "";
    });
    visibility.observe(area);
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const follow = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !fine.matches || reduce.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Measured on the flat stage, not the rotated card, so the tilt never feeds back into itself.
        const box = area.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        face.dataset.tilt = "follow";
        face.style.transform = `translateZ(${LIFT}px) rotateX(${(-y * TILT).toFixed(2)}deg) rotateY(${(x * TILT).toFixed(2)}deg)`;
        light.style.transform = `translate(${(x * 60).toFixed(1)}%, ${(y * 60).toFixed(1)}%)`;
      });
    };
    const rest = () => {
      cancelAnimationFrame(frame);
      delete face.dataset.tilt;
      face.style.transform = "";
      light.style.transform = "";
    };
    area.addEventListener("pointermove", follow);
    area.addEventListener("pointerleave", rest);
    return () => {
      rest();
      visibility.disconnect();
      area.removeEventListener("pointermove", follow);
      area.removeEventListener("pointerleave", rest);
    };
  }, []);

  return (
    <div className="radar-stage" ref={stage}>
    <div className="radar-float" ref={float}>
    <div className="radar" ref={card} data-denom={asset.category}>
      <span className="radar-sheen" aria-hidden="true"><i ref={sheen} /></span>
      <div className="segmented" role="group" aria-label="Featured asset">
        {assets.map((item) => <button key={item.symbol} aria-pressed={selected === item.symbol} onClick={() => setSelected(item.symbol)}>{item.symbol}</button>)}
      </div>
      <div className="specimen-identity" key={"identity-" + asset.symbol}>
        <AssetMark symbol={asset.symbol} className="asset-mark-large" />
        <div>
          <h2 className="specimen-name">{asset.name}</h2>
          <p className="specimen-sub"><span className="ticker">{asset.symbol}</span> · {asset.theme}</p>
        </div>
        {asset.tier && <span className="tier-tag">Tier {asset.tier}</span>}
      </div>
      <ScoreBars scores={asset.scores} variant="triad" size="lg" />
      <div className="specimen-quote">
        <span className="quote-figure" key={tick.count} data-source={quote?.source} data-tick={tick.dir}>{quote ? formatPrice(quote.price) : error ? "Unavailable" : "—"}</span>
        {quote && <QuoteChange changePct={quote.changePct} />}
        <span className="quote-source">{quote ? sourceLabel(quote.source) : error ? "Quote unavailable" : "Loading quote…"}{error && quote ? " · Stale" : ""}</span>
      </div>
      <ResearchStatus key={"seal-" + asset.symbol} review={asset.review} />
      <Link className="btn btn-primary btn-block" href={"/asset/" + asset.symbol}>Read the full thesis <ArrowUpRight size={16} aria-hidden="true" /></Link>
    </div>
    </div>
    </div>
  );
}
