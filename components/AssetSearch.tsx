"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Search, X } from "lucide-react";

export type SearchAsset = { symbol: string; name: string };

export function AssetSearch({ assets, onNavigate }: { assets: SearchAsset[]; onNavigate?: () => void }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const id = useId();
  const term = query.trim().toLowerCase();
  const matches = assets.filter((asset) => `${asset.symbol} ${asset.name}`.toLowerCase().includes(term)).slice(0, 6);

  function dismiss() {
    setQuery("");
    setFocused(false);
    onNavigate?.();
  }

  return (
    <div className="nav-search" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
    }}>
      <Search size={16} aria-hidden="true" />
      <input
        type="search"
        aria-label="Search assets"
        aria-controls={focused && term ? id : undefined}
        placeholder="Search assets…"
        value={query}
        onFocus={() => setFocused(true)}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") dismiss();
          if (event.key === "Enter" && term && matches[0]) {
            event.preventDefault();
            router.push(`/asset/${matches[0].symbol}`);
            dismiss();
          }
        }}
      />
      {query && <button aria-label="Clear asset search" onClick={() => setQuery("")}><X size={14} /></button>}
      {focused && term && (
        <div id={id} className="search-results">
          <p className="search-results-label" role="status">{matches.length ? "Research library" : "No matching assets"}</p>
          {matches.map((asset) => (
            <Link key={asset.symbol} href={`/asset/${asset.symbol}`} onClick={dismiss}>
              <span><strong>{asset.symbol}</strong><small>{asset.name}</small></span>
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
