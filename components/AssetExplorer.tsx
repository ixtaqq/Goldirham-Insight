"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import type { CardData } from "@/lib/card";
import { CATEGORIES } from "@/lib/categories";
import { DEFAULT_VIEW, exploreAssets, inCategory, RANKINGS, type ExplorerView } from "@/lib/explorer";
import { AssetCard } from "./AssetCard";

export function AssetExplorer({ assets }: { assets: CardData[] }) {
  const [view, setView] = useState(DEFAULT_VIEW);
  const [showAll, setShowAll] = useState(false);
  const filtered = exploreAssets(assets, view);
  const term = view.query.trim();
  const update = (next: Partial<ExplorerView>) => { setView({ ...view, ...next }); setShowAll(false); };

  return (
    <section id="markets" className="design-section research-section" aria-labelledby="research-heading">
      <div className="container-x">
        <div className="sec-head">
          <div><p className="eyebrow">The research desk</p><h2 id="research-heading" className="display">Find your next conviction.</h2><p className="sec-sub">Real businesses. Clear theses. The risks included. Prices identify their source — scores are editorial.</p></div>
          <div className="desk-search"><label htmlFor="library-search" className="label">Filter the desk</label><div className="desk-input"><Search size={16} aria-hidden="true" /><input id="library-search" className="input" type="search" placeholder="Company or ticker…" value={view.query} onChange={(event) => update({ query: event.target.value })} /></div></div>
        </div>
        <div className="toolbar">
          <div className="segmented research-segments" role="group" aria-label="Rank research">{RANKINGS.map((item) => <button key={item.id} data-active={view.ranking === item.id} aria-pressed={view.ranking === item.id} onClick={() => update({ ranking: item.id })}>{item.label}</button>)}</div>
          <div className="chips">
            <div className="chips" role="group" aria-label="Filter by theme">{CATEGORIES.map((item) => <button key={item.slug} className="chip" data-on={view.category === item.slug} aria-pressed={view.category === item.slug} onClick={() => update({ category: view.category === item.slug ? "all" : item.slug })}>{item.name}<span className="n">{assets.filter((asset) => inCategory(asset, item.slug)).length}</span></button>)}</div>
            <div className="chips" role="group" aria-label="Filter by tier"><button className="chip" data-on={view.tier1} aria-pressed={view.tier1} onClick={() => update({ tier1: !view.tier1 })}>Tier 1 only<span className="n">{assets.filter((asset) => asset.tier === 1).length}</span></button></div>
          </div>
        </div>
        <p className="desk-results" role="status">{filtered.length} {filtered.length === 1 ? "asset" : "assets"}{term ? " matching “" + term + "”" : " to explore"}</p>
        {filtered.length ? <div className="asset-grid">{filtered.slice(0, showAll ? filtered.length : 9).map((asset) => <AssetCard key={asset.symbol} data={asset} />)}</div> : <div className="card catalog-empty"><Search size={28} /><h3>No matching research.</h3><p>Try another company, ticker, or theme.</p><button className="btn btn-primary" onClick={() => update(DEFAULT_VIEW)}>Clear filters</button></div>}
        {filtered.length > 9 && <div className="center"><button className="btn btn-secondary" onClick={() => setShowAll(!showAll)} aria-expanded={showAll}>{showAll ? "Show fewer" : "Explore all " + filtered.length + " assets"}{showAll ? <ArrowUp size={16} /> : <ArrowDown size={16} />}</button></div>}
      </div>
    </section>
  );
}
