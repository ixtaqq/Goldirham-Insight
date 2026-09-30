import { sparkline } from "./market";
import type { Asset, AssetClass, CategorySlug, Scores } from "./types";

/**
 * Lightweight projection of an Asset for cards — deliberately excludes the
 * long-form `article` so client components don't ship it in their payload.
 */
export interface CardData {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  category: CategorySlug;
  alsoIn?: CategorySlug[];
  tier?: 1 | 2 | 3;
  tierLabel?: string;
  theme: string;
  tagline: string;
  entryRange: string;
  scores: Scores;
  accent: string;
  spark: number[];
}

export function toCardData(a: Asset): CardData {
  return {
    symbol: a.symbol,
    name: a.name,
    assetClass: a.assetClass,
    category: a.category,
    alsoIn: a.alsoIn,
    tier: a.tier,
    tierLabel: a.tierLabel,
    theme: a.theme,
    tagline: a.tagline,
    entryRange: a.entryRange,
    scores: a.scores,
    accent: a.accent ?? "#598bff",
    spark: sparkline(a.symbol, a.basePrice, a.vol),
  };
}
