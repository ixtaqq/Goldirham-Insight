import { getAsset } from "@/lib/assets";
import { composite, MAX_WEIGHT, type Weights } from "@/lib/explorer";
import type { Asset, Scores } from "@/lib/types";

export const MAX_COMPARISON_ASSETS = 3;

const SENSITIVITY_BLENDS: readonly { label: string; weights: Weights }[] = [
  { label: "Equal weights", weights: { upside: 1, safety: 1, aiExposure: 1 } },
  { label: "Upside only", weights: { upside: 1, safety: 0, aiExposure: 0 } },
  { label: "Safety only", weights: { upside: 0, safety: 1, aiExposure: 0 } },
  { label: "AI exposure only", weights: { upside: 0, safety: 0, aiExposure: 1 } },
];
const TIE_MARGIN = 1e-9;

/**
 * How the order of scored assets depends on the weights: who leads across every whole-number
 * weighting the custom blend allows, plus the order under four simple weightings. Null below two scored assets.
 */
export function blendSensitivity(assets: readonly Asset[]) {
  const scored = assets.flatMap((asset) => (asset.scores ? [{ symbol: asset.symbol, scores: asset.scores as Scores }] : []));
  if (scored.length < 2) return null;
  const wins = new Map(scored.map((asset) => [asset.symbol, 0]));
  let total = 0;
  let ties = 0;
  for (let upside = 0; upside <= MAX_WEIGHT; upside++) {
    for (let safety = 0; safety <= MAX_WEIGHT; safety++) {
      for (let aiExposure = 0; aiExposure <= MAX_WEIGHT; aiExposure++) {
        if (upside + safety + aiExposure === 0) continue;
        const weights = { upside, safety, aiExposure };
        const blended = scored.map((asset) => ({ symbol: asset.symbol, value: composite(asset.scores, weights) }));
        const top = Math.max(...blended.map((asset) => asset.value));
        const leaders = blended.filter((asset) => top - asset.value < TIE_MARGIN);
        total++;
        if (leaders.length === 1) wins.set(leaders[0].symbol, wins.get(leaders[0].symbol)! + 1);
        else ties++;
      }
    }
  }
  return {
    total,
    ties,
    leaders: scored.map((asset) => ({ symbol: asset.symbol, wins: wins.get(asset.symbol)! })),
    blends: SENSITIVITY_BLENDS.map(({ label, weights }) => ({
      label,
      order: scored.map((asset) => ({ symbol: asset.symbol, value: composite(asset.scores, weights) })).sort((a, b) => b.value - a.value),
    })),
  };
}

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

function symbolsQuery(symbols: readonly string[]) {
  const query = new URLSearchParams();
  for (const symbol of symbols) query.append("symbols", symbol);
  return query.toString();
}

export function comparisonHref(symbols: readonly string[]) {
  const query = symbolsQuery(symbols);
  return query ? `/compare?${query}` : "/compare";
}

export function comparisonExportHref(symbols: readonly string[], format: "csv" | "json") {
  return `/compare/export?${symbolsQuery(symbols)}&format=${format}`;
}

export function comparisonPreviewHref(symbols: readonly string[]) {
  return `/compare/preview?${symbolsQuery(symbols)}`;
}
