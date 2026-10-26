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

// The homepage is prerendered, so the default desk is the static HTML until search params are read on the client.
export function AssetExplorer({ assets }: { assets: CardData[] }) {
  useEffect(() => {
    if (window.location.hash === "#markets") document.getElementById("markets")?.scrollIntoView();
  }, []);
  return <section id="markets" className="research-section" aria-labelledby="research-heading"><Suspense fallback={<ExplorerDesk assets={assets} view={DEFAULT_VIEW} />}><LinkedExplorer assets={assets} /></Suspense></section>;
}

function LinkedExplorer({ assets }: { assets: CardData[] }) {
  const { view: linked, adjusted } = parseExplorerView(useSearchParams());
  const linkedHref = explorerHref(linked);
  // The view lives here and the URL follows it. Next applies history writes in a transition, so
  // useSearchParams lags them; it replaces the view only when the URL changes to one this component
  // did not write (Back, Forward, or a link elsewhere on the page).
  const [state, setState] = useState(() => ({ view: linked, seen: linkedHref, written: linkedHref }));
  if (linkedHref !== state.seen) {
    setState({ view: linkedHref === state.written ? state.view : linked, seen: linkedHref, written: linkedHref });
  }
  const { view, written } = state;
  const href = explorerHref(view);

  useEffect(() => {
    if (href === written) return;
    const timer = setTimeout(() => {
      setState((current) => ({ ...current, written: href }));
      history.replaceState(null, "", href);
    }, DRAFT_SYNC_DELAY);
    return () => clearTimeout(timer);
  }, [href, written]);

  const change = (next: Partial<ExplorerView>) => {
    const target = { ...view, ...next };
    const targetHref = explorerHref(target);
    if (targetHref === href) return;
    // Settle a pending keystroke or slider step into the current entry so Back returns to it.
    if (href !== written) history.replaceState(null, "", href);
    setState((current) => ({ ...current, view: target, written: targetHref }));
    history.pushState(null, "", targetHref);
  };

  const draft = (next: Partial<Draft>) => setState((current) => ({ ...current, view: { ...current.view, ...next } }));

  return <ExplorerDesk assets={assets} view={view} adjusted={adjusted && linkedHref === written} onDraft={draft} onChange={change} />;
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
  // A new ranking or filter re-deals the cards; typing and blend steps update them in place.
  const dealKey = `${view.ranking}:${view.category}:${view.tier1}`;
  const [deal, setDeal] = useState({ key: dealKey, changed: false });
  if (deal.key !== dealKey) setDeal({ key: dealKey, changed: true });

  return (
      <div className="container-x">
        <div className="section-head">
          <div><h2 id="research-heading" className="section-title">Find your next conviction.</h2><p className="section-lede">Real businesses, clear theses and the risks that come with them. Scores are editorial opinions; every price names its source.</p></div>
          <div className="desk-search"><label htmlFor="library-search" className="field-label">Filter the desk</label><div className="field-input"><Search size={16} aria-hidden="true" /><input id="library-search" className="input" type="search" placeholder="Company or ticker…" maxLength={MAX_QUERY_LENGTH} value={view.query} onChange={(event) => onDraft({ query: event.target.value })} /></div></div>
        </div>
        <div className="desk-controls">
          <div className="segmented" role="group" aria-label="Rank research">{RANKINGS.map((item) => <button key={item.id} aria-pressed={view.ranking === item.id} onClick={() => onChange({ ranking: item.id })}>{item.label}</button>)}</div>
          <div className="chip-row">
            <div className="chips" role="group" aria-label="Filter by theme">{CATEGORIES.map((item) => <button key={item.slug} className="chip" data-denom={item.slug} aria-pressed={view.category === item.slug} onClick={() => onChange({ category: view.category === item.slug ? "all" : item.slug })}>{item.name}<span className="n">{assets.filter((asset) => inCategory(asset, item.slug)).length}</span></button>)}</div>
            <div className="chips" role="group" aria-label="Filter by tier"><button className="chip" aria-pressed={view.tier1} onClick={() => onChange({ tier1: !view.tier1 })}>Tier 1 only<span className="n">{assets.filter((asset) => asset.tier === 1).length}</span></button></div>
          </div>
        </div>
        {view.ranking === "custom" && <BlendControl weights={view.weights} reviewed={assets.some((asset) => asset.review.status === "reviewed")} onWeights={(weights) => onDraft({ weights })} />}
        {adjusted && <p className="notice">Some settings in this link were not recognized, so their defaults are shown.</p>}
        <p className="desk-results" role="status">{filtered.length} {filtered.length === 1 ? "asset" : "assets"}{term ? " matching “" + term + "”" : " to explore"}</p>
        {filtered.length ? <div className="asset-grid" key={dealKey} data-dealt={deal.changed || undefined}>{filtered.slice(0, showAll ? filtered.length : 9).map((asset) => <AssetCard key={asset.symbol} data={asset} blend={view.ranking === "custom" && asset.scores ? composite(asset.scores, view.weights) : undefined} />)}</div> : <div className="catalog-empty"><Search size={28} aria-hidden="true" /><h3>No matching research.</h3><p>Try another company, ticker, or theme.</p><button className="btn btn-primary" onClick={() => onChange(DEFAULT_VIEW)}>Clear filters</button></div>}
        {filtered.length > 9 && <div className="desk-more"><button className="btn btn-quiet" onClick={() => setExpandedFor(showAll ? null : href)} aria-expanded={showAll}>{showAll ? "Show fewer" : "Explore all " + filtered.length + " assets"}{showAll ? <ArrowUp size={16} aria-hidden="true" /> : <ArrowDown size={16} aria-hidden="true" />}</button></div>}
      </div>
  );
}

function BlendControl({ weights, reviewed, onWeights }: { weights: Weights; reviewed: boolean; onWeights: (weights: Weights) => void }) {
  return (
    <fieldset className="blend" aria-describedby="blend-note">
      <legend>Custom blend</legend>
      <div className="blend-sliders">{FACTORS.map((factor) => {
        const id = "blend-" + factor.key;
        return (
          <div key={factor.key} className="blend-slider">
            <label htmlFor={id}>{factor.label}</label>
            <input id={id} type="range" min={0} max={MAX_WEIGHT} step={1} value={weights[factor.key]} onChange={(event) => {
              const next = { ...weights, [factor.key]: Number(event.target.value) };
              if (next.upside + next.safety + next.aiExposure > 0) onWeights(next);
            }} />
            <span className="blend-value" aria-hidden="true">{weights[factor.key]}</span>
          </div>
        );
      })}</div>
      <p id="blend-note" className="blend-note">At least one factor keeps a weight. {reviewed ? "Blends weight editorial scores; each card shows its review status." : "Blends weight editorial scores that have not been reviewed."} A blend is a lens on those opinions, not a recommendation.</p>
    </fieldset>
  );
}
