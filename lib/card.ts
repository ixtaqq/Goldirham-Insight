import { sparkline } from "./market";
import type { Asset, AssetClass, CategorySlug, ResearchReview, Scores } from "./types";

export type ReviewStatus =
  | { status: "unreviewed" }
  | { status: "reviewed"; reviewedBy: string; reviewedAt: string };

export function toReviewStatus(review?: ResearchReview): ReviewStatus {
  return review
    ? { status: "reviewed", reviewedBy: review.reviewedBy, reviewedAt: review.reviewedAt }
    : { status: "unreviewed" };
}

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
  review: ReviewStatus;
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
    review: toReviewStatus(a.research),
    accent: a.accent ?? "#598bff",
    spark: sparkline(a.symbol, a.basePrice, a.vol),
  };
}
