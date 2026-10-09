"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import type { CardData } from "@/lib/card";
import { CATEGORIES } from "@/lib/categories";
import type { CategorySlug } from "@/lib/types";
import { AssetCard } from "./AssetCard";

const FILTERS = ["All", "Top upside", "Safest", "Top AI exposure", "Tier 1", "Crypto"] as const;

export function AssetExplorer({ assets }: { assets: CardData[] }) {
  const [category, setCategory] = useState<CategorySlug | "all">("all");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [showAll, setShowAll] = useState(false);
  const term = query.trim().toLowerCase();
  const filtered = assets.filter((asset) =>
    (category === "all" || asset.category === category || asset.alsoIn?.includes(category)) &&
    (filter !== "Tier 1" || asset.tier === 1) &&
    (filter !== "Crypto" || asset.assetClass === "crypto") &&
    (asset.name + " " + asset.symbol + " " + asset.theme).toLowerCase().includes(term)
  );
  if (filter === "Top upside") filtered.sort((a, b) => b.scores.upside - a.scores.upside);
  if (filter === "Safest") filtered.sort((a, b) => b.scores.safety - a.scores.safety);
  if (filter === "Top AI exposure") filtered.sort((a, b) => b.scores.aiExposure - a.scores.aiExposure);

  return (
    <section id="markets" className="design-section research-section" aria-labelledby="research-heading">
      <div className="container-x">
        <div className="sec-head">
          <div><p className="eyebrow">The research desk</p><h2 id="research-heading" className="display">Find your next conviction.</h2><p className="sec-sub">Real businesses. Clear theses. The risks included. Prices identify their source — scores are editorial.</p></div>
          <div className="desk-search"><label htmlFor="library-search" className="label">Filter the desk</label><div className="desk-input"><Search size={16} aria-hidden="true" /><input id="library-search" className="input" type="search" placeholder="Company or ticker…" value={query} onChange={(event) => { setQuery(event.target.value); setShowAll(false); }} /></div></div>
        </div>
        <div className="toolbar">
          <div className="segmented research-segments" role="group" aria-label="Rank research">{FILTERS.map((item) => <button key={item} data-active={filter === item} aria-pressed={filter === item} onClick={() => { setFilter(item); setShowAll(false); }}>{item}</button>)}</div>
          <div className="chips" role="group" aria-label="Filter by theme">{CATEGORIES.map((item) => <button key={item.slug} className="chip" data-on={category === item.slug} aria-pressed={category === item.slug} onClick={() => { setCategory(category === item.slug ? "all" : item.slug); setShowAll(false); }}>{item.name}<span className="n">{assets.filter((asset) => asset.category === item.slug || asset.alsoIn?.includes(item.slug)).length}</span></button>)}</div>
        </div>
        <p className="desk-results" role="status">{filtered.length} {filtered.length === 1 ? "asset" : "assets"}{term ? " matching “" + query.trim() + "”" : " to explore"}</p>
        {filtered.length ? <div className="asset-grid">{filtered.slice(0, showAll ? filtered.length : 9).map((asset) => <AssetCard key={asset.symbol} data={asset} />)}</div> : <div className="card catalog-empty"><Search size={28} /><h3>No matching research.</h3><p>Try another company, ticker, or theme.</p><button className="btn btn-primary" onClick={() => { setCategory("all"); setQuery(""); setFilter("All"); setShowAll(false); }}>Clear filters</button></div>}
        {filtered.length > 9 && <div className="center"><button className="btn btn-secondary" onClick={() => setShowAll(!showAll)} aria-expanded={showAll}>{showAll ? "Show fewer" : "Explore all " + filtered.length + " assets"}{showAll ? <ArrowUp size={16} /> : <ArrowDown size={16} />}</button></div>}
      </div>
    </section>
  );
}
