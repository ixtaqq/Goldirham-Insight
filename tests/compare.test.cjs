const assert = require("node:assert/strict");
const { test } = require("node:test");
const load = require("./load-ts.cjs");

const { resolveComparison, comparisonHref, comparisonPreviewHref } = load("lib/compare.ts");

test("comparison starts empty and ignores blank form slots", () => {
  for (const input of [undefined, "", ["", " ", ""]]) {
    assert.deepEqual(resolveComparison(input), { assets: [], adjusted: false });
  }
});

test("comparison resolves case and spaces while preserving selected order", () => {
  const { assets, adjusted } = resolveComparison([" nvda ", "CEG", "btc"]);
  assert.deepEqual(assets.map((asset) => asset.symbol), ["NVDA", "CEG", "BTC"]);
  assert.equal(assets[0].name, "NVIDIA");
  assert.equal(assets[0].scores.upside, 8);
  assert.equal(adjusted, false);
});

test("comparison omits unknown and duplicate symbols and limits distinct assets to three", () => {
  const { assets, adjusted } = resolveComparison(["unknown", "NVDA", "nvda", "", "BTC,CEG,MSFT"]);
  assert.deepEqual(assets.map((asset) => asset.symbol), ["NVDA", "BTC", "CEG"]);
  assert.equal(adjusted, true);
  assert.deepEqual(resolveComparison("<script>"), { assets: [], adjusted: true });
});

test("comparison links survive sharing and preserve order with repeated query parameters", () => {
  assert.equal(comparisonHref([]), "/compare");
  const href = comparisonHref(["BTC", "NVDA", "CEG"]);
  assert.equal(href, "/compare?symbols=BTC&symbols=NVDA&symbols=CEG");
  const params = new URL(href, "https://example.com").searchParams;
  assert.deepEqual(resolveComparison(params.getAll("symbols")).assets.map((asset) => asset.symbol), ["BTC", "NVDA", "CEG"]);
});

test("comparison previews use the same canonical symbol order", () => {
  assert.equal(comparisonPreviewHref(["NVDA", "CEG"]), "/compare/preview?symbols=NVDA&symbols=CEG");
});
