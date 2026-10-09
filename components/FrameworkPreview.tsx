"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import type { Asset } from "@/lib/types";
import type { ReviewStatus } from "@/lib/card";
import { avgScore } from "@/lib/utils";
import { ScoreBars } from "./ScoreBars";
import { AssetMark } from "./AssetMark";
import { ResearchStatus } from "./ResearchStatus";

type Example = Pick<Asset, "symbol" | "name" | "scores" | "entryRange" | "whyItWins"> & { review: ReviewStatus };

export function FrameworkPreview({ assets }: { assets: Example[] }) {
  const [selected, setSelected] = useState(assets[0].symbol);
  const asset = assets.find((item) => item.symbol === selected)!;
  return (
    <div className="score-card">
      <div className="segmented score-segments" role="group" aria-label="Scorecard example">{assets.map((item) => <button key={item.symbol} data-active={selected === item.symbol} aria-pressed={selected === item.symbol} onClick={() => setSelected(item.symbol)}>{item.symbol}</button>)}</div>
      <div className="score-name"><AssetMark symbol={asset.symbol} /><span>{asset.name}</span></div>
      <div className="big"><span className="score">{avgScore(asset.scores).toFixed(1)}</span><span className="of">/10 · composite</span></div>
      <ScoreBars scores={asset.scores} />
      <ResearchStatus review={asset.review} />
      <div className="val-pill">{asset.entryRange}</div>
      <ul>{asset.whyItWins.slice(0, 3).map((item) => <li key={item}><Check size={14} className="text-gain" />{item}</li>)}</ul>
      <Link href={"/asset/" + asset.symbol} className="score-link">Read {asset.symbol} research <ArrowUpRight size={14} /></Link>
    </div>
  );
}
