"use client";

import { useState } from "react";
import { ArrowDown, Search, SlidersHorizontal, X } from "lucide-react";
import type { CardData } from "@/lib/card";
import { CATEGORIES } from "@/lib/categories";
import { avgScore, cn } from "@/lib/utils";
import { AssetCard } from "./AssetCard";

export function AssetExplorer({ assets }: { assets: CardData[] }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [limit, setLimit] = useState(8);
  const term = query.trim().toLowerCase();
  const filtered = assets.filter((asset) =>
    (category === "all" || asset.category === category || asset.alsoIn?.includes(category as CardData["category"])) &&
    `${asset.name} ${asset.symbol} ${asset.theme}`.toLowerCase().includes(term)
  );
  if (sort === "score") filtered.sort((a, b) => avgScore(b.scores) - avgScore(a.scores));
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

  function reset() {
    setCategory("all");
    setQuery("");
    setSort("featured");
    setLimit(8);
  }

  return (
    <section id="markets" className="site-container section-space" aria-labelledby="research-heading">
      <div className="section-heading">
        <div><p className="eyebrow">THE RESEARCH DESK</p><h2 id="research-heading">Find your next conviction.</h2><p>Real businesses. Clear theses. The risks included.</p></div>
        <span className="library-count">{assets.length} assets. One wider perspective.</span>
      </div>
      <div className="explorer-toolbar">
        <div className="category-tabs" role="group" aria-label="Filter by category">
          {[{ slug: "all", name: "All assets" }, ...CATEGORIES].map((item) => (
            <button key={item.slug} onClick={() => { setCategory(item.slug); setLimit(8); }} aria-pressed={category === item.slug} className={cn("category-tab", category === item.slug && "is-active")}>{item.name}</button>
          ))}
        </div>
        <div className="explorer-controls">
          <div className="catalog-search"><Search size={16} /><input type="search" aria-label="Search research library" placeholder="Company or ticker" value={query} onChange={(event) => { setQuery(event.target.value); setLimit(8); }} />{query && <button aria-label="Clear library search" onClick={() => setQuery("")}><X size={14} /></button>}</div>
          <label className="catalog-sort"><SlidersHorizontal size={15} /><span className="sr-only">Sort assets</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured first</option><option value="score">Highest score</option><option value="name">Name A–Z</option></select></label>
        </div>
      </div>
      <p className="results-count" role="status">{filtered.length} {filtered.length === 1 ? "asset" : "assets"}{category !== "all" ? ` in ${CATEGORIES.find((item) => item.slug === category)?.name}` : " to explore"}{term ? ` matching “${query.trim()}”` : ""}<span>Prices identify their source. Scores are editorial.</span></p>
      {filtered.length ? (
        <div className="research-grid">{filtered.slice(0, limit).map((asset) => <AssetCard key={asset.symbol} data={asset} />)}</div>
      ) : (
        <div className="catalog-empty"><Search size={28} /><h3>No matching research.</h3><p>Try a company name, ticker, or a different category.</p><button className="button button-dark" onClick={reset}>Clear filters</button></div>
      )}
      {filtered.length > limit && <div className="explorer-more"><button className="button button-white" onClick={() => setLimit(filtered.length)}>Explore all {filtered.length} assets <ArrowDown size={16} /></button></div>}
    </section>
  );
}
