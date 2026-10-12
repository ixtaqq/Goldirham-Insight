const assert = require("node:assert/strict");
const { test } = require("node:test");
const load = require("./load-ts.cjs");

const { DEFAULT_VIEW, explorerHref, exploreAssets, MAX_QUERY_LENGTH, parseExplorerView } = load("lib/explorer.ts");
const { ASSETS } = load("lib/assets.ts");
const { toCardData } = load("lib/card.ts");

const cards = ASSETS.map(toCardData);
const symbols = (view) => exploreAssets(cards, { ...DEFAULT_VIEW, ...view }).map((card) => card.symbol);

test("the default view keeps every asset in its incoming order", () => {
  assert.deepEqual(symbols({}), ASSETS.map((asset) => asset.symbol));
});

test("theme filtering includes cross-listed assets", () => {
  assert.deepEqual(symbols({ category: "ai-utilities" }), ["CEG", "VST", "NEE", "AES", "NI", "ICLN"]);
});

test("rankings sort by one score and keep incoming order for ties", () => {
  assert.deepEqual(symbols({ ranking: "safety" }).slice(0, 4), ["NEE", "MSFT", "AAPL", "VOO"]);
  assert.deepEqual(symbols({ category: "crypto", ranking: "safety" }), ["BTC", "ETH", "SOL", "LINK", "RENDER"]);
  assert.deepEqual(symbols({ category: "crypto", ranking: "ai" }), ["RENDER", "LINK", "ETH", "SOL", "BTC"]);
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
  const view = { query: "power & grid", category: "ai-utilities", ranking: "safety", tier1: true };
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
