import { getAsset } from "@/lib/assets";
import type { Asset } from "@/lib/types";

export const MAX_COMPARISON_ASSETS = 3;

export function resolveComparison(value: string | string[] | undefined) {
  const assets: Asset[] = [];
  let adjusted = false;

  for (const entry of typeof value === "string" ? [value] : value ?? []) {
    for (const token of entry.split(",")) {
      const symbol = token.trim().toUpperCase();
      if (!symbol) continue;
      const asset = getAsset(symbol);
      if (!asset || assets.some((selected) => selected.symbol === symbol) || assets.length === MAX_COMPARISON_ASSETS) {
        adjusted = true;
        continue;
      }
      assets.push(asset);
    }
  }

  return { assets, adjusted };
}

export function comparisonHref(symbols: readonly string[]) {
  const query = new URLSearchParams();
  for (const symbol of symbols) query.append("symbols", symbol);
  return query.size ? `/compare?${query}` : "/compare";
}
