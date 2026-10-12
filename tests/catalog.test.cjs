const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const sharp = require("sharp");
const load = require("./load-ts.cjs");
const { ASSETS, getAsset, getAssetsByCategory } = load("lib/assets.ts");
const { CATALOG } = load("lib/catalog-data.ts");
const { DEFAULT_VIEW, exploreAssets } = load("lib/explorer.ts");
const { toCardData } = load("lib/card.ts");

test("every supplied category retains all 50 ranked entries and cross-listings", () => {
  for (const category of ["ai-utilities", "ai-companies", "mega-stocks", "etf", "crypto"]) {
    const entries = CATALOG.filter((entry) => entry.listings.some((listing) => listing.category === category));
    assert.equal(entries.length, 50, category);
    const ranks = entries.flatMap((entry) => entry.listings.filter((listing) => listing.category === category).map((listing) => listing.rank));
    assert.deepEqual(ranks.sort((a, b) => a - b), Array.from({ length: 50 }, (_, index) => index + 1));
    const actual = getAssetsByCategory(category);
    for (const entry of entries) assert.ok(actual.some((asset) => asset.symbol === entry.symbol), entry.symbol);
  }
  assert.equal(ASSETS.length, 234);
  assert.equal(ASSETS.filter((asset) => asset.tier === 1).length, 16);
  assert.ok(getAsset("GOOGL"));
  assert.ok(getAsset("GOOG"));
});

test("catalog-only assets have no invented scores, review, or tier", () => {
  for (const asset of ASSETS.filter((asset) => !asset.scores)) {
    assert.equal(asset.research, undefined, asset.symbol);
    assert.equal(asset.tier, undefined, asset.symbol);
    assert.match(asset.article, /not an observed market price/);
    if (asset.assetClass === "crypto") assert.ok(asset.coingeckoId, asset.symbol);
  }
  for (const ranking of ["upside", "safety", "ai", "custom"]) {
    const cards = exploreAssets(ASSETS.map(toCardData), { ...DEFAULT_VIEW, ranking });
    const pending = cards.findIndex((card) => !card.scores);
    assert.equal(pending, 26);
    assert.ok(cards.slice(pending).every((card) => card.scores === null));
  }
});

test("each asset has a decodable local logo and recorded source", async () => {
  const directory = path.resolve(__dirname, "../public/logos");
  const sources = JSON.parse(fs.readFileSync(path.join(directory, "sources.json"), "utf8"));
  for (const asset of ASSETS) {
    assert.ok(sources[asset.symbol], asset.symbol);
    const metadata = await sharp(path.join(directory, asset.symbol.toLowerCase() + ".png")).metadata();
    assert.equal(metadata.format, "png", asset.symbol);
    assert.ok(metadata.width > 0 && metadata.height > 0, asset.symbol);
  }
});
