"use client";

import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/lib/watchlist";

export function WatchButton({ symbol, showLabel = false, className }: { symbol: string; showLabel?: boolean; className?: string }) {
  const { symbols, toggle } = useWatchlist();
  const saved = symbols.includes(symbol);
  return (
    <button type="button" className={cn("watch-button", className)} aria-pressed={saved} aria-label={`Save ${symbol}`} title="Saved in this browser only" onClick={() => toggle(symbol)}>
      <Bookmark size={16} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
      {showLabel && (saved ? "Saved" : "Save")}
    </button>
  );
}
