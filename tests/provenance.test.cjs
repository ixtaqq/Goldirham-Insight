const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createElement } = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const load = require("./load-ts.cjs");

const { ResearchRecord } = load("components/ResearchRecord.tsx");
const { QuoteFreshness } = load("components/QuoteFreshness.tsx");
const { isQuoteTimestamp } = load("lib/quote-time.ts");
const { ASSETS } = load("lib/assets.ts");
const { CATEGORIES } = load("lib/categories.ts");
const render = (component, props) => renderToStaticMarkup(createElement(component, props));

test("missing review metadata never invents a reviewer, date or citation", () => {
  const html = render(ResearchRecord, {});
  assert.match(html, /Not reviewed/);
  assert.match(html, /No reviewer, review date, or supporting citations/);
  assert.doesNotMatch(html, /<time|<a /);
});

test("recorded reviews show their evidence and all three score rationales", () => {
  const html = render(ResearchRecord, { review: {
    reviewedBy: "Test reviewer",
    reviewedAt: "2026-10-01",
    sources: [{ title: "Fixture <source>", url: "https://example.com/filing" }],
    scoreRationale: { upside: "Upside fixture", safety: "Safety fixture", aiExposure: "AI fixture" },
  } });
  for (const text of ["Test reviewer", "2026-10-01", "Upside fixture", "Safety fixture", "AI fixture"]) {
    assert.ok(html.includes(text), text);
  }
  assert.match(html, /href="https:\/\/example.com\/filing"/);
  assert.match(html, /Fixture &lt;source&gt;/);
  assert.doesNotMatch(html, /Not reviewed/);
});

test("quote freshness shows the observation time in UTC, including an old market close", () => {
  const quote = { source: "finnhub", updatedAt: Date.parse("2026-10-02T20:00:00Z") };
  const html = render(QuoteFreshness, { quote });
  assert.match(html, /Quote observed/);
  assert.match(html, /dateTime="2026-10-02T20:00:00.000Z"/);
  assert.match(html, /2026-10-02 20:00:00 UTC/);
  assert.match(html, /Market hours and feed delays may apply/);
  assert.doesNotMatch(html, /live now|just now|Simulation generated/i);
});

test("simulated prices disclose that their timestamps are generation times", () => {
  const html = render(QuoteFreshness, { quote: { source: "simulated", updatedAt: 1_790_000_000_000 } });
  assert.match(html, /Simulation generated/);
  assert.match(html, /This price is an illustration/);
  assert.doesNotMatch(html, /Quote observed/);
});

test("missing and invalid timestamps cannot crash the freshness display", () => {
  for (const updatedAt of [undefined, null, "2026-10-05", 0, -1, NaN, Infinity, 8_640_000_000_000_001]) {
    assert.equal(isQuoteTimestamp(updatedAt), false);
    assert.match(render(QuoteFreshness, { quote: { source: "coingecko", updatedAt } }), /unavailable time/);
  }
});

test("the real catalog has unique symbols, valid categories and complete recorded reviews", () => {
  assert.equal(new Set(ASSETS.map((asset) => asset.symbol)).size, ASSETS.length);
  const categories = new Set(CATEGORIES.map((category) => category.slug));
  for (const asset of ASSETS) {
    assert.ok(categories.has(asset.category), asset.symbol);
    for (const slug of asset.alsoIn ?? []) assert.ok(categories.has(slug), asset.symbol);
    for (const value of Object.values(asset.scores)) assert.ok(value >= 0 && value <= 10, asset.symbol);
    if (!asset.research) {
      assert.match(render(ResearchRecord, { review: asset.research }), /Not reviewed/);
      continue;
    }
    const review = asset.research;
    assert.ok(review.reviewedBy.trim(), asset.symbol);
    assert.match(review.reviewedAt, /^\d{4}-\d{2}-\d{2}$/);
    const reviewedAt = new Date(review.reviewedAt);
    assert.equal(reviewedAt.toISOString().slice(0, 10), review.reviewedAt);
    assert.ok(reviewedAt.getTime() <= Date.now(), asset.symbol);
    assert.ok(review.sources.length > 0, asset.symbol);
    for (const source of review.sources) {
      assert.ok(source.title.trim(), asset.symbol);
      assert.equal(new URL(source.url).protocol, "https:");
    }
    for (const factor of ["upside", "safety", "aiExposure"]) assert.ok(review.scoreRationale[factor].trim(), asset.symbol);
  }
});
