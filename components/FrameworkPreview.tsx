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

type Example = Pick<Asset, "symbol" | "name" | "category" | "scores" | "entryRange" | "whyItWins"> & { review: ReviewStatus };

export function FrameworkPreview({ assets }: { assets: Example[] }) {
  const [selected, setSelected] = useState(assets[0].symbol);
  const asset = assets.find((item) => item.symbol === selected)!;
  return (
    <div className="score-card" data-denom={asset.category}>
      <div className="segmented" role="group" aria-label="Scorecard example">{assets.map((item) => <button key={item.symbol} aria-pressed={selected === item.symbol} onClick={() => setSelected(item.symbol)}>{item.symbol}</button>)}</div>
      <div className="score-name"><AssetMark symbol={asset.symbol} /><span>{asset.name}</span></div>
      <div className="score-total"><span className="score-big">{asset.scores ? avgScore(asset.scores).toFixed(1) : "—"}</span><span className="score-of">/10 composite</span></div>
      <ScoreBars scores={asset.scores} />
      <ResearchStatus review={asset.review} />
      <p className="entry-range">{asset.entryRange}</p>
      <ul className="checks">{asset.whyItWins.slice(0, 3).map((item) => <li key={item}><Check size={15} aria-hidden="true" />{item}</li>)}</ul>
      <Link href={"/asset/" + asset.symbol} className="text-link">Read {asset.symbol} research <ArrowUpRight size={15} aria-hidden="true" /></Link>
    </div>
  );
}
