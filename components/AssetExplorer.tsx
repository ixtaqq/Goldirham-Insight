"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import type { CardData } from "@/lib/card";
import { CATEGORIES } from "@/lib/categories";
import { DEFAULT_VIEW, explorerHref, exploreAssets, inCategory, parseExplorerView, RANKINGS, type ExplorerView } from "@/lib/explorer";
import { AssetCard } from "./AssetCard";

const QUERY_SYNC_DELAY = 250;

// The homepage is prerendered, so the default desk is the static HTML until search params are read on the client.
export function AssetExplorer({ assets }: { assets: CardData[] }) {
  return <Suspense fallback={<ExplorerDesk assets={assets} view={DEFAULT_VIEW} />}><LinkedExplorer assets={assets} /></Suspense>;
}

function LinkedExplorer({ assets }: { assets: CardData[] }) {
  const { view: linked, adjusted } = parseExplorerView(useSearchParams());
  // Typing stays local so the input never waits on the router; the URL catches up after a pause.
  const [query, setQuery] = useState(linked.query);
  const view = { ...linked, query };
  const href = explorerHref(view);
  const linkedHref = explorerHref(linked);

  useEffect(() => {
    const restore = () => setQuery(parseExplorerView(new URLSearchParams(location.search)).view.query);
    addEventListener("popstate", restore);
    return () => removeEventListener("popstate", restore);
  }, []);

  useEffect(() => {
    if (href === linkedHref) return;
    const timer = setTimeout(() => history.replaceState(null, "", href), QUERY_SYNC_DELAY);
    return () => clearTimeout(timer);
  }, [href, linkedHref]);

  const change = (next: Partial<ExplorerView>) => {
    if (next.query !== undefined) setQuery(next.query);
    history.pushState(null, "", explorerHref({ ...view, ...next }));
  };

  return <ExplorerDesk assets={assets} view={view} adjusted={adjusted} onQuery={setQuery} onChange={change} />;
}

function ExplorerDesk({ assets, view, adjusted = false, onQuery = () => {}, onChange = () => {} }: {
  assets: CardData[];
  view: ExplorerView;
  adjusted?: boolean;
  onQuery?: (query: string) => void;
  onChange?: (next: Partial<ExplorerView>) => void;
}) {
  const [expandedFor, setExpandedFor] = useState<string | null>(null);
  const href = explorerHref(view);
  const showAll = expandedFor === href;
  const filtered = exploreAssets(assets, view);
  const term = view.query.trim();

  return (
    <section id="markets" className="design-section research-section" aria-labelledby="research-heading">
      <div className="container-x">
        <div className="sec-head">
          <div><p className="eyebrow">The research desk</p><h2 id="research-heading" className="display">Find your next conviction.</h2><p className="sec-sub">Real businesses. Clear theses. The risks included. Prices identify their source — scores are editorial.</p></div>
          <div className="desk-search"><label htmlFor="library-search" className="label">Filter the desk</label><div className="desk-input"><Search size={16} aria-hidden="true" /><input id="library-search" className="input" type="search" placeholder="Company or ticker…" value={view.query} onChange={(event) => onQuery(event.target.value)} /></div></div>
        </div>
        <div className="toolbar">
          <div className="segmented research-segments" role="group" aria-label="Rank research">{RANKINGS.map((item) => <button key={item.id} data-active={view.ranking === item.id} aria-pressed={view.ranking === item.id} onClick={() => onChange({ ranking: item.id })}>{item.label}</button>)}</div>
          <div className="chips">
            <div className="chips" role="group" aria-label="Filter by theme">{CATEGORIES.map((item) => <button key={item.slug} className="chip" data-on={view.category === item.slug} aria-pressed={view.category === item.slug} onClick={() => onChange({ category: view.category === item.slug ? "all" : item.slug })}>{item.name}<span className="n">{assets.filter((asset) => inCategory(asset, item.slug)).length}</span></button>)}</div>
            <div className="chips" role="group" aria-label="Filter by tier"><button className="chip" data-on={view.tier1} aria-pressed={view.tier1} onClick={() => onChange({ tier1: !view.tier1 })}>Tier 1 only<span className="n">{assets.filter((asset) => asset.tier === 1).length}</span></button></div>
          </div>
        </div>
        {adjusted && <p className="compare-notice desk-notice">Some settings in this link were not recognized, so their defaults are shown.</p>}
        <p className="desk-results" role="status">{filtered.length} {filtered.length === 1 ? "asset" : "assets"}{term ? " matching “" + term + "”" : " to explore"}</p>
        {filtered.length ? <div className="asset-grid">{filtered.slice(0, showAll ? filtered.length : 9).map((asset) => <AssetCard key={asset.symbol} data={asset} />)}</div> : <div className="card catalog-empty"><Search size={28} /><h3>No matching research.</h3><p>Try another company, ticker, or theme.</p><button className="btn btn-primary" onClick={() => onChange(DEFAULT_VIEW)}>Clear filters</button></div>}
        {filtered.length > 9 && <div className="center"><button className="btn btn-secondary" onClick={() => setExpandedFor(showAll ? null : href)} aria-expanded={showAll}>{showAll ? "Show fewer" : "Explore all " + filtered.length + " assets"}{showAll ? <ArrowUp size={16} /> : <ArrowDown size={16} />}</button></div>}
      </div>
    </section>
  );
}
