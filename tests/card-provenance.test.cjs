const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createElement } = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const load = require("./load-ts.cjs");

const { toCardData } = load("lib/card.ts");
const { ASSETS } = load("lib/assets.ts");
const { ResearchStatus } = load("components/ResearchStatus.tsx");

test("catalog projections disclose missing reviews without inventing attribution", () => {
  for (const asset of ASSETS) {
    const card = toCardData(asset);
    assert.deepEqual(card.review, { status: "unreviewed" });
    const html = renderToStaticMarkup(createElement(ResearchStatus, { review: card.review }));
    assert.match(html, /Not reviewed/);
    assert.doesNotMatch(html, /<time|Reviewed by/);
    assert.equal(Object.hasOwn(card, "article"), false);
  }
});

test("reviewed projections retain actual attribution without sending full evidence to cards", () => {
  const card = toCardData({ ...ASSETS[0], research: {
    reviewedBy: "Fixture reviewer <name>",
    reviewedAt: "2026-10-01",
    sources: [{ title: "Fixture source", url: "https://example.com/evidence" }],
    scoreRationale: { upside: "Fixture upside", safety: "Fixture safety", aiExposure: "Fixture AI" },
  } });
  assert.deepEqual(card.review, {
    status: "reviewed", reviewedBy: "Fixture reviewer <name>", reviewedAt: "2026-10-01",
  });
  const html = renderToStaticMarkup(createElement(ResearchStatus, { review: card.review }));
  assert.match(html, /Reviewed/);
  assert.match(html, /Fixture reviewer &lt;name&gt;/);
  assert.match(html, /dateTime="2026-10-01"/);
  assert.doesNotMatch(html, /example.com|Fixture upside|Not reviewed/);
});
