const assert = require("node:assert/strict");
const { test } = require("node:test");
const load = require("./load-ts.cjs");

const { composite, DEFAULT_VIEW, explorerHref, exploreAssets, MAX_QUERY_LENGTH, parseExplorerView } = load("lib/explorer.ts");
const { ASSETS } = load("lib/assets.ts");
const { toCardData } = load("lib/card.ts");

const cards = ASSETS.map(toCardData);
const symbols = (view) => exploreAssets(cards, { ...DEFAULT_VIEW, ...view }).map((card) => card.symbol);

test("the default view keeps every asset in its incoming order", () => {
  assert.deepEqual(symbols({}), ASSETS.map((asset) => asset.symbol));
});

test("theme filtering includes cross-listed assets", () => {
  const utilities = symbols({ category: "ai-utilities" });
  assert.deepEqual(utilities.slice(0, 6), ["CEG", "VST", "NEE", "AES", "NI", "ICLN"]);
  assert.equal(utilities.length, 53);
  assert.ok(utilities.includes("GEV"));
});

test("rankings sort by one score and keep incoming order for ties", () => {
  assert.deepEqual(symbols({ ranking: "safety" }).slice(0, 4), ["NEE", "MSFT", "AAPL", "VOO"]);
  assert.deepEqual(symbols({ category: "crypto", ranking: "safety" }).slice(0, 5), ["BTC", "ETH", "SOL", "LINK", "RENDER"]);
  assert.deepEqual(symbols({ category: "crypto", ranking: "ai" }).slice(0, 5), ["RENDER", "LINK", "ETH", "SOL", "BTC"]);
});

test("the Tier 1 filter combines with any theme and ranking", () => {
  assert.deepEqual(symbols({ category: "crypto", tier1: true, ranking: "safety" }), ["BTC", "ETH"]);
  assert.deepEqual(symbols({ category: "etf", tier1: true, ranking: "upside" }), ["SMH", "QQQ", "VOO"]);
});

test("search matches name, ticker, or theme case-insensitively", () => {
  assert.deepEqual(symbols({ query: "  nvidia " }), ["NVDA"]);
  assert.deepEqual(symbols({ query: "not-a-company" }), []);
});

const parse = (search) => parseExplorerView(new URLSearchParams(search));

test("the default view links to the bare homepage", () => {
  assert.equal(explorerHref(DEFAULT_VIEW), "/");
  assert.equal(explorerHref({ ...DEFAULT_VIEW, query: "   " }), "/");
  assert.deepEqual(parse(""), { view: DEFAULT_VIEW, adjusted: false });
});

test("explorer links survive sharing in a stable parameter order", () => {
  const view = { ...DEFAULT_VIEW, query: "power & grid", category: "ai-utilities", ranking: "safety", tier1: true };
  const href = explorerHref(view);
  assert.equal(href, "/?q=power+%26+grid&category=ai-utilities&rank=safety&tier=1#markets");
  assert.deepEqual(parse(new URL(href, "https://example.com").search), { view, adjusted: false });
});

test("unusable link values fall back to defaults and are reported", () => {
  assert.deepEqual(parse("category=bonds&rank=cheapest&tier=2&q=NVDA"), {
    view: { ...DEFAULT_VIEW, query: "NVDA" },
    adjusted: true,
  });
  const long = parse("q=" + "x".repeat(MAX_QUERY_LENGTH + 5));
  assert.equal(long.view.query.length, MAX_QUERY_LENGTH);
  assert.equal(long.adjusted, true);
  assert.deepEqual(parse("utm_source=newsletter"), { view: DEFAULT_VIEW, adjusted: false });
});

test("custom weights rank by the weighted average and match the equivalent preset", () => {
  assert.deepEqual(symbols({ ranking: "custom", weights: { upside: 1, safety: 0, aiExposure: 1 } }).slice(0, 4), ["NVDA", "CEG", "VST", "PLTR"]);
  assert.deepEqual(
    symbols({ ranking: "custom", weights: { upside: 5, safety: 0, aiExposure: 5 } }),
    symbols({ ranking: "custom", weights: { upside: 1, safety: 0, aiExposure: 1 } }),
  );
  assert.deepEqual(symbols({ ranking: "custom", weights: { upside: 0, safety: 4, aiExposure: 0 } }), symbols({ ranking: "safety" }));
});

test("custom weights survive sharing and are omitted for presets", () => {
  const view = { ...DEFAULT_VIEW, ranking: "custom", weights: { upside: 1, safety: 0, aiExposure: 5 } };
  assert.equal(explorerHref(view), "/?rank=custom&w=1-0-5#markets");
  assert.deepEqual(parse("rank=custom&w=1-0-5"), { view, adjusted: false });
  assert.equal(explorerHref({ ...view, ranking: "safety" }), "/?rank=safety#markets");
  assert.deepEqual(parse("rank=custom"), { view: { ...DEFAULT_VIEW, ranking: "custom" }, adjusted: false });
});

test("unusable weights fall back to the default blend and are reported", () => {
  for (const weights of ["0-0-0", "6-1-1", "1-1", "a-b-c", "1-1-1-1", "-1-1-1", "1.5-1-1"]) {
    assert.deepEqual(parse("rank=custom&w=" + weights), { view: { ...DEFAULT_VIEW, ranking: "custom" }, adjusted: true }, weights);
  }
  assert.deepEqual(parse("rank=safety&w=1-2-3"), { view: { ...DEFAULT_VIEW, ranking: "safety" }, adjusted: true });
});

test("a blend is the weighted average of the three scores", () => {
  const scores = { upside: 8, safety: 6, aiExposure: 3 };
  assert.equal(composite(scores, { upside: 1, safety: 0, aiExposure: 1 }), 5.5);
  assert.equal(composite(scores, { upside: 2, safety: 1, aiExposure: 0 }), 22 / 3);
  assert.equal(composite(scores, { upside: 0, safety: 5, aiExposure: 0 }), 6);
});
