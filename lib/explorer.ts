import type { CardData } from "@/lib/card";
import type { CategorySlug, Scores } from "@/lib/types";

export type Weights = Record<keyof Scores, number>;

export const RANKINGS = [
  { id: "featured", label: "Featured", weights: null },
  { id: "upside", label: "Top upside", weights: { upside: 1, safety: 0, aiExposure: 0 } },
  { id: "safety", label: "Safest", weights: { upside: 0, safety: 1, aiExposure: 0 } },
  { id: "ai", label: "Top AI exposure", weights: { upside: 0, safety: 0, aiExposure: 1 } },
] as const satisfies readonly { id: string; label: string; weights: Weights | null }[];

export type RankingId = (typeof RANKINGS)[number]["id"];

export interface ExplorerView {
  query: string;
  category: CategorySlug | "all";
  ranking: RankingId;
  tier1: boolean;
}

export const DEFAULT_VIEW: ExplorerView = { query: "", category: "all", ranking: "featured", tier1: false };

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
  const { weights } = RANKINGS.find((ranking) => ranking.id === view.ranking)!;
  return weights ? matches.sort((a, b) => composite(b.scores, weights) - composite(a.scores, weights)) : matches;
}
