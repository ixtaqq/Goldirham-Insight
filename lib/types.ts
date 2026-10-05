export type CategorySlug =
  | "ai-utilities"
  | "ai-companies"
  | "mega-stocks"
  | "etf"
  | "crypto";

export type AssetClass = "stock" | "etf" | "crypto";

export interface Scores {
  /** Return potential 0–10 */
  upside: number;
  /** Drawdown / balance-sheet resilience 0–10 */
  safety: number;
  /** Structural exposure to the AI buildout 0–10 */
  aiExposure: number;
}

export interface ResearchReview {
  reviewedBy: string;
  /** Date of the actual editorial review, YYYY-MM-DD. */
  reviewedAt: string;
  sources: [{ title: string; url: string }, ...{ title: string; url: string }[]];
  scoreRationale: Record<keyof Scores, string>;
}

export interface Asset {
  /** Ticker or coin symbol, e.g. "CEG", "BTC" */
  symbol: string;
  /** CoinGecko id for crypto, used by the price API */
  coingeckoId?: string;
  name: string;
  assetClass: AssetClass;
  category: CategorySlug;
  /** Optional secondary categories for cross-listing */
  alsoIn?: CategorySlug[];
  tier?: 1 | 2 | 3;
  tierLabel?: string;
  theme: string;
  /** One-line hook shown on cards */
  tagline: string;
  /** Valuation / entry guidance */
  entryRange: string;
  valuationNotes: string[];
  /** Bullet points: why the thesis wins */
  whyItWins: string[];
  /** Where the asset is in its cycle */
  stage: string;
  /** Risks to keep honest */
  risks: string[];
  scores: Scores;
  /** Long-form research article (markdown-ish, rendered by ArticleBody) */
  article: string;
  /** Omit until a review and its supporting evidence have been recorded. */
  research?: ResearchReview;
  /** Base price used to seed the live-simulated feed (USD) */
  basePrice: number;
  /** Rough realised vol used by the simulator (annualised, e.g. 0.45) */
  vol: number;
  /** Accent color hint */
  accent?: string;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  short: string;
  blurb: string;
  icon: string;
  accent: string;
}

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  source: "coingecko" | "finnhub" | "simulated";
  currency: string;
  marketCap?: number;
  high?: number;
  low?: number;
  updatedAt: number;
}

export interface LinePoint {
  /** unix seconds */
  time: number;
  value: number;
}

export type ChartRange = "1D" | "1W" | "1M" | "3M" | "1Y";

export interface ChartResponse {
  symbol: string;
  range: ChartRange;
  source: "coingecko" | "finnhub" | "simulated";
  points: LinePoint[];
}
