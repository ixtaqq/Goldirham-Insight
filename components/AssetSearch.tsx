"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Search, X } from "lucide-react";
import { AssetMark } from "./AssetMark";

export type SearchAsset = { symbol: string; name: string };

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

export function AssetSearch({ assets, onNavigate, shortcut = false }: { assets: SearchAsset[]; onNavigate?: () => void; shortcut?: boolean }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const id = useId();
  const term = query.trim().toLowerCase();
  const matches = assets.filter((asset) => `${asset.symbol} ${asset.name}`.toLowerCase().includes(term)).slice(0, 6);

  useEffect(() => {
    if (!shortcut) return;
    const onKeyDown = (event: KeyboardEvent) => {
      // "/" jumps to search from anywhere except a field the visitor is typing in.
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
      if (!input.current?.offsetParent) return;
      event.preventDefault();
      input.current.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [shortcut]);

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
        ref={input}
        type="search"
        aria-label="Search assets"
        aria-keyshortcuts={shortcut ? "/" : undefined}
        aria-controls={focused && term ? id : undefined}
        placeholder="Search assets…"
        value={query}
        onFocus={() => setFocused(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setFocused(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") dismiss();
          if (event.key === "Enter" && term && matches[0]) {
            event.preventDefault();
            router.push(`/asset/${matches[0].symbol}`);
            dismiss();
          }
        }}
      />
      {query ? <button aria-label="Clear asset search" onClick={() => setQuery("")}><X size={14} /></button> : shortcut && <kbd className="search-kbd" aria-hidden="true">/</kbd>}
      {focused && term && (
        <div id={id} className="search-results">
          <p className="search-results-label" role="status">{matches.length ? "Research library" : "No matching assets"}</p>
          {matches.map((asset) => (
            <Link key={asset.symbol} href={`/asset/${asset.symbol}`} onClick={dismiss}>
              <span className="search-identity"><AssetMark symbol={asset.symbol} className="asset-mark-small" /><span><strong className="ticker">{asset.symbol}</strong><small>{asset.name}</small></span></span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
