import type { CardData } from "@/lib/card";
import { CATEGORIES } from "@/lib/categories";
import type { CategorySlug, Scores } from "@/lib/types";

export type Weights = Record<keyof Scores, number>;

export const FACTORS = [
  { key: "upside", label: "Upside" },
  { key: "safety", label: "Safety" },
  { key: "aiExposure", label: "AI exposure" },
] as const satisfies readonly { key: keyof Scores; label: string }[];

export const MAX_WEIGHT = 5;

/** Presets are fixed weights; "custom" ranks by the view's own weights. */
export const RANKINGS = [
  { id: "featured", label: "Featured", weights: null },
  { id: "upside", label: "Top upside", weights: { upside: 1, safety: 0, aiExposure: 0 } },
  { id: "safety", label: "Safest", weights: { upside: 0, safety: 1, aiExposure: 0 } },
  { id: "ai", label: "Top AI exposure", weights: { upside: 0, safety: 0, aiExposure: 1 } },
  { id: "custom", label: "Custom", weights: null },
] as const satisfies readonly { id: string; label: string; weights: Weights | null }[];

export type RankingId = (typeof RANKINGS)[number]["id"];

export interface ExplorerView {
  query: string;
  category: CategorySlug | "all";
  ranking: RankingId;
  tier1: boolean;
  /** Integers from 0 to MAX_WEIGHT with a positive sum; used only by the custom ranking. */
  weights: Weights;
}

export const DEFAULT_VIEW: ExplorerView = {
  query: "",
  category: "all",
  ranking: "featured",
  tier1: false,
  weights: { upside: 3, safety: 3, aiExposure: 3 },
};

export function rankingWeights(view: ExplorerView): Weights | null {
  return view.ranking === "custom" ? view.weights : RANKINGS.find((ranking) => ranking.id === view.ranking)!.weights;
}

function parseWeights(value: string): Weights | null {
  const parts = value.split("-");
  if (parts.length !== FACTORS.length || !parts.every((part) => /^[0-9]$/.test(part) && Number(part) <= MAX_WEIGHT)) return null;
  const [upside, safety, aiExposure] = parts.map(Number);
  return upside + safety + aiExposure > 0 ? { upside, safety, aiExposure } : null;
}

export const MAX_QUERY_LENGTH = 80;

/** Reads a view from the homepage query string; unusable values fall back to defaults and set `adjusted`. */
export function parseExplorerView(params: URLSearchParams) {
  const view = { ...DEFAULT_VIEW };
  let adjusted = false;

  const query = params.get("q");
  if (query !== null) {
    view.query = query.slice(0, MAX_QUERY_LENGTH);
    adjusted ||= query.length > MAX_QUERY_LENGTH;
  }
  const category = params.get("category");
  if (category !== null) {
    const match = CATEGORIES.find((item) => item.slug === category);
    if (match) view.category = match.slug;
    else adjusted = true;
  }
  const ranking = params.get("rank");
  if (ranking !== null) {
    const match = RANKINGS.find((item) => item.id === ranking);
    if (match) view.ranking = match.id;
    else adjusted = true;
  }
  const tier = params.get("tier");
  if (tier !== null) {
    if (tier === "1") view.tier1 = true;
    else adjusted = true;
  }
  const weights = params.get("w");
  if (weights !== null) {
    const parsed = view.ranking === "custom" ? parseWeights(weights) : null;
    if (parsed) view.weights = parsed;
    else adjusted = true;
  }

  return { view, adjusted };
}

/** Serializes a view as a homepage link; the default view is the bare homepage. */
export function explorerHref(view: ExplorerView) {
  const params = new URLSearchParams();
  if (view.query.trim()) params.set("q", view.query);
  if (view.category !== "all") params.set("category", view.category);
  if (view.ranking !== "featured") params.set("rank", view.ranking);
  if (view.tier1) params.set("tier", "1");
  if (view.ranking === "custom") params.set("w", FACTORS.map((factor) => view.weights[factor.key]).join("-"));
  // URLSearchParams.size is missing in Safari 16.4 and Chrome 111, which Next 16 supports.
  const query = params.toString();
  return query ? `/?${query}#markets` : "/";
}

export function inCategory(asset: CardData, category: CategorySlug) {
  return asset.category === category || Boolean(asset.alsoIn?.includes(category));
}

export function composite(scores: Scores, weights: Weights) {
  return (scores.upside * weights.upside + scores.safety * weights.safety + scores.aiExposure * weights.aiExposure) /
    (weights.upside + weights.safety + weights.aiExposure);
}

/** Filters and ranks cards; ties keep the incoming (featured) order because Array.sort is stable. */
export function exploreAssets(assets: readonly CardData[], view: ExplorerView) {
  const term = view.query.trim().toLowerCase();
  const matches = assets.filter((asset) =>
    (view.category === "all" || inCategory(asset, view.category)) &&
    (!view.tier1 || asset.tier === 1) &&
    (asset.name + " " + asset.symbol + " " + asset.theme).toLowerCase().includes(term)
  );
  const weights = rankingWeights(view);
  return weights ? matches.sort((a, b) => {
    if (!a.scores) return b.scores ? 1 : 0;
    if (!b.scores) return -1;
    return composite(b.scores, weights) - composite(a.scores, weights);
  }) : matches;
}
