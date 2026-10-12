"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import type { CardData } from "@/lib/card";
import { CATEGORIES } from "@/lib/categories";
import { composite, DEFAULT_VIEW, explorerHref, exploreAssets, FACTORS, inCategory, MAX_QUERY_LENGTH, MAX_WEIGHT, parseExplorerView, RANKINGS, type ExplorerView, type Weights } from "@/lib/explorer";
import { AssetCard } from "./AssetCard";

const DRAFT_SYNC_DELAY = 250;

/** Values that change on every keystroke or slider step; the URL catches up after a pause. */
type Draft = Pick<ExplorerView, "query" | "weights">;

function draftOf({ query, weights }: ExplorerView): Draft {
  return { query, weights };
}

// The homepage is prerendered, so the default desk is the static HTML until search params are read on the client.
export function AssetExplorer({ assets }: { assets: CardData[] }) {
  return <Suspense fallback={<ExplorerDesk assets={assets} view={DEFAULT_VIEW} />}><LinkedExplorer assets={assets} /></Suspense>;
}

function LinkedExplorer({ assets }: { assets: CardData[] }) {
  const { view: linked, adjusted } = parseExplorerView(useSearchParams());
  const linkedHref = explorerHref(linked);
  // Drafts stay local so inputs never wait on the router. When the URL changes to one this component
  // did not write (Back, Forward, or a link to "/"), it replaces them. Next applies history writes in a
  // transition, so a render can still see the old URL; only an actual URL change is compared.
  const [draft, setDraft] = useState(() => draftOf(linked));
  const [sync, setSync] = useState({ seen: linkedHref, written: linkedHref });
  if (linkedHref !== sync.seen) {
    setSync({ seen: linkedHref, written: linkedHref });
    if (linkedHref !== sync.written) setDraft(draftOf(linked));
  }
  const view = { ...linked, ...draft };
  const href = explorerHref(view);

  useEffect(() => {
    if (href === linkedHref) return;
    const timer = setTimeout(() => {
      setSync((current) => ({ ...current, written: href }));
      history.replaceState(null, "", href);
    }, DRAFT_SYNC_DELAY);
    return () => clearTimeout(timer);
  }, [href, linkedHref]);

  const change = (next: Partial<ExplorerView>) => {
    const target = { ...view, ...next };
    const targetHref = explorerHref(target);
    if (targetHref === href) return;
    setDraft(draftOf(target));
    setSync((current) => ({ ...current, written: targetHref }));
    history.pushState(null, "", targetHref);
  };

  return <ExplorerDesk assets={assets} view={view} adjusted={adjusted} onDraft={(next) => setDraft({ ...draft, ...next })} onChange={change} />;
}

function ExplorerDesk({ assets, view, adjusted = false, onDraft = () => {}, onChange = () => {} }: {
  assets: CardData[];
  view: ExplorerView;
  adjusted?: boolean;
  onDraft?: (next: Partial<Draft>) => void;
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
          <div className="desk-search"><label htmlFor="library-search" className="label">Filter the desk</label><div className="desk-input"><Search size={16} aria-hidden="true" /><input id="library-search" className="input" type="search" placeholder="Company or ticker…" maxLength={MAX_QUERY_LENGTH} value={view.query} onChange={(event) => onDraft({ query: event.target.value })} /></div></div>
        </div>
        <div className="toolbar">
          <div className="segmented research-segments" role="group" aria-label="Rank research">{RANKINGS.map((item) => <button key={item.id} data-active={view.ranking === item.id} aria-pressed={view.ranking === item.id} onClick={() => onChange({ ranking: item.id })}>{item.label}</button>)}</div>
          <div className="chips">
            <div className="chips" role="group" aria-label="Filter by theme">{CATEGORIES.map((item) => <button key={item.slug} className="chip" data-on={view.category === item.slug} aria-pressed={view.category === item.slug} onClick={() => onChange({ category: view.category === item.slug ? "all" : item.slug })}>{item.name}<span className="n">{assets.filter((asset) => inCategory(asset, item.slug)).length}</span></button>)}</div>
            <div className="chips" role="group" aria-label="Filter by tier"><button className="chip" data-on={view.tier1} aria-pressed={view.tier1} onClick={() => onChange({ tier1: !view.tier1 })}>Tier 1 only<span className="n">{assets.filter((asset) => asset.tier === 1).length}</span></button></div>
          </div>
        </div>
        {view.ranking === "custom" && <BlendControl weights={view.weights} onWeights={(weights) => onDraft({ weights })} />}
        {adjusted && <p className="compare-notice desk-notice">Some settings in this link were not recognized, so their defaults are shown.</p>}
        <p className="desk-results" role="status">{filtered.length} {filtered.length === 1 ? "asset" : "assets"}{term ? " matching “" + term + "”" : " to explore"}</p>
        {filtered.length ? <div className="asset-grid">{filtered.slice(0, showAll ? filtered.length : 9).map((asset) => <AssetCard key={asset.symbol} data={asset} blend={view.ranking === "custom" ? composite(asset.scores, view.weights) : undefined} />)}</div> : <div className="card catalog-empty"><Search size={28} /><h3>No matching research.</h3><p>Try another company, ticker, or theme.</p><button className="btn btn-primary" onClick={() => onChange(DEFAULT_VIEW)}>Clear filters</button></div>}
        {filtered.length > 9 && <div className="center"><button className="btn btn-secondary" onClick={() => setExpandedFor(showAll ? null : href)} aria-expanded={showAll}>{showAll ? "Show fewer" : "Explore all " + filtered.length + " assets"}{showAll ? <ArrowUp size={16} /> : <ArrowDown size={16} />}</button></div>}
      </div>
    </section>
  );
}

function BlendControl({ weights, onWeights }: { weights: Weights; onWeights: (weights: Weights) => void }) {
  const total = weights.upside + weights.safety + weights.aiExposure;
  return (
    <fieldset className="blend">
      <legend className="label">Custom blend</legend>
      <div className="blend-sliders">{FACTORS.map((factor) => {
        const id = "blend-" + factor.key;
        const value = weights[factor.key];
        return (
          <div key={factor.key} className="blend-slider">
            <label htmlFor={id}>{factor.label}</label>
            {/* The last weighted factor cannot drop to zero, so the blend always has a denominator. */}
            <input id={id} type="range" min={value === total ? 1 : 0} max={MAX_WEIGHT} step={1} value={value} onChange={(event) => onWeights({ ...weights, [factor.key]: Number(event.target.value) })} />
            <output htmlFor={id}>{value}</output>
          </div>
        );
      })}</div>
      <p className="blend-note">Blends weight editorial scores that have not been reviewed. A blend is a lens on those opinions, not a recommendation.</p>
    </fieldset>
  );
}
