import type { Asset, AssetClass, CategorySlug } from "./types";
import { CATALOG } from "./catalog-data";
import { CRYPTO_IDS } from "./catalog-providers";

export interface CatalogEntry {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  country?: string;
  marketCap?: string;
  focus?: string;
  group?: string;
  listings: { category: CategorySlug; rank: number }[];
}

export const CATALOG_DATE = "2026-10-12";

export function mergeCatalog(researchAssets: Asset[]): Asset[] {
  const assets = researchAssets.map((asset) => ({ ...asset }));
  for (const entry of CATALOG) {
    const existing = assets.find((asset) => asset.symbol === entry.symbol);
    if (existing) {
      existing.catalog = entry;
      existing.alsoIn = [...new Set([...(existing.alsoIn ?? []), ...entry.listings.map((listing) => listing.category)])].filter((category) => category !== existing.category);
      continue;
    }
    const theme = entry.focus ?? entry.group ?? "Global market-cap reference list";
    assets.push({
      symbol: entry.symbol,
      name: entry.name,
      assetClass: entry.assetClass,
      coingeckoId: CRYPTO_IDS[entry.symbol],
      category: entry.listings[0].category,
      alsoIn: entry.listings.slice(1).map((listing) => listing.category),
      catalog: entry,
      theme,
      tagline: `${theme}${entry.country ? " · " + entry.country : ""}. Added from the reference list; research pending.`,
      entryRange: "Not assessed",
      valuationNotes: [entry.marketCap ? `Reference market cap: ${entry.marketCap} as of ${CATALOG_DATE}, supplied in the imported list; not independently verified.` : "ETF list is grouped by theme, not ranked by AUM. Fund size and fees have not been assessed."],
      whyItWins: [],
      stage: "Not assessed — catalog entry only.",
      risks: ["Investment thesis, valuation and asset-specific risks have not been reviewed."],
      scores: null,
      basePrice: 100,
      vol: entry.assetClass === "crypto" ? 0.8 : 0.4,
      article: `## Catalog reference\n${entry.name} (${entry.symbol}) was included in the supplied Top 50 by Category list dated ${CATALOG_DATE}.\n\n${theme}.\n\n${entry.marketCap ? `The supplied market cap is ${entry.marketCap}. This reference figure has not been independently verified and is separate from live market data.` : "The ETF list is grouped by theme, not ranked by assets under management. No AUM or expense ratio has been imported."}\n\n## Research pending\nNo investment thesis, entry range, scores or tier has been assigned. This entry is not a recommendation.\n\n## Market data\nWhen a live provider is unavailable, quotes and charts are simulated from a generic $100 demo seed. This seed is not an observed market price.`,
    });
  }
  return assets;
}
