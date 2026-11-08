const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createElement } = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { NextRequest } = require("next/server");
const load = require("./load-ts.cjs");

const { exportWatchlist, importMessage, importWatchlist, parseNoticeSettings, parseWatchlist, pendingNotices, toggleSymbol, WATCHLIST_FILE_LIMIT } = load("lib/watchlist.ts");
const { describeFreshness, formatAge, isUsMarketHours, summarizeFeed } = load("lib/feed-status.ts");
const { DEFAULT_VIEW, explorerHref, exploreAssets, parseExplorerView } = load("lib/explorer.ts");
const { blendSensitivity } = load("lib/compare.ts");
const { comparisonRows, EXPORT_DISCLAIMER, explorerRows, toCsv, toJson } = load("lib/export.ts");
const { ASSETS, getAsset } = load("lib/assets.ts");
const { toCardData } = load("lib/card.ts");
const { ResearchRevisions } = load("components/ResearchRevisions.tsx");

const cards = ASSETS.map(toCardData);
const quote = (source, updatedAt = 1_790_000_000_000) => ({ symbol: "X", price: 10, change: 1, changePct: 2, source, currency: "USD", updatedAt });
const at = (iso) => new Date(iso).getTime();

test("the stored watchlist ignores malformed values and duplicates", () => {
  for (const raw of [null, "", "not json", "{}", "3"]) assert.deepEqual(parseWatchlist(raw), []);
  assert.deepEqual(parseWatchlist('["NVDA", 4, "", "NVDA", "BTC"]'), ["NVDA", "BTC"]);
  assert.deepEqual(toggleSymbol(["NVDA"], "BTC"), ["NVDA", "BTC"]);
  assert.deepEqual(toggleSymbol(["NVDA", "BTC"], "NVDA"), ["BTC"]);
});

test("an exported watchlist imports into another browser by merging, never replacing", () => {
  const known = new Set(ASSETS.map((asset) => asset.symbol));
  const file = exportWatchlist(["NVDA", "BTC", "ABBN.SW"]);
  const result = importWatchlist(file, ["CEG", "BTC"], known);
  assert.equal(result.ok, true);
  assert.deepEqual(result.symbols, ["CEG", "BTC", "NVDA", "ABBN.SW"]);
  assert.deepEqual([result.added, result.alreadySaved], [2, 1]);
  assert.equal(importMessage(result), "Added 2 saved assets. Skipped 1: 1 already saved.");
  const empty = importWatchlist(file, [], known);
  assert.deepEqual(empty.symbols, ["NVDA", "BTC", "ABBN.SW"]);
  assert.equal(importMessage(empty), "Added 3 saved assets.");
});

test("a watchlist file is untrusted: oversized, unreadable or foreign files change nothing", () => {
  const known = new Set(ASSETS.map((asset) => asset.symbol));
  const valid = (symbols) => JSON.stringify({ format: "goldirham-watchlist", version: 1, symbols });
  const reason = (text) => importWatchlist(text, ["CEG"], known).reason;
  assert.equal(reason(valid(["NVDA"]) + " ".repeat(WATCHLIST_FILE_LIMIT)), "too-large");
  for (const text of ["", "not json", "{\"symbols\":[", "<script>alert(1)</script>"]) assert.equal(reason(text), "not-json", text);
  for (const text of ["null", "3", '["NVDA"]', '{"symbols":["NVDA"]}', '{"format":"goldirham-watchlist","version":2,"symbols":["NVDA"]}', '{"format":"goldirham-watchlist","version":1,"symbols":"NVDA"}', '{"format":"other","version":1,"symbols":["NVDA"]}']) {
    assert.equal(reason(text), "wrong-shape", text);
  }
  assert.equal(importMessage({ ok: false, reason: "too-large" }), "That file is larger than any watchlist export (64 KB), so nothing was imported.");
  assert.equal(importMessage({ ok: false, reason: "not-json" }), "That file could not be read as a watchlist export, so nothing was imported.");
  assert.equal(importMessage({ ok: false, reason: "wrong-shape" }), "That file is not a Goldirham watchlist export, so nothing was imported.");

  const mixed = importWatchlist(valid(["NVDA", "NVDA", "nvda", "NOPE", "<img src=x>", 4, "", null, { symbol: "BTC" }, "CEG", "__proto__", "BTC"]), ["CEG"], known);
  assert.deepEqual(mixed.symbols, ["CEG", "NVDA", "BTC"]);
  assert.deepEqual([mixed.added, mixed.alreadySaved, mixed.repeated, mixed.unknown, mixed.invalid], [2, 1, 1, 4, 4]);
  assert.equal(importMessage(mixed), "Added 2 saved assets. Skipped 10: 1 already saved, 1 listed twice, 4 not in the catalog, 4 not a symbol.");
  const nothing = importWatchlist(valid([]), ["CEG"], known);
  assert.deepEqual(nothing.symbols, ["CEG"]);
  assert.equal(importMessage(nothing), "The file lists no saved assets, so nothing changed.");
  assert.equal(importMessage(importWatchlist(valid(["CEG"]), ["CEG"], known)), "Added 0 saved assets. Skipped 1: 1 already saved.");
  assert.equal(importMessage(importWatchlist(valid(["NVDA"]), [], known)), "Added 1 saved asset.");
  const crafted = importWatchlist(valid([...Array(1201).fill("NVDA"), ...Array.from({ length: 2400 }, (_, index) => "TICKER" + index)]), [], known);
  assert.equal(importMessage(crafted), "Added 1 saved asset. Skipped 3,600: 1,200 listed twice, 2,400 not in the catalog.");
});

test("research notices are opt-in, start from a baseline and stay dismissed", () => {
  const revised = { ...toCardData(getAsset("NVDA")), latestRevision: { date: "2026-11-05", summary: "Thesis updated" } };
  const off = parseNoticeSettings(null);
  assert.deepEqual(pendingNotices([revised], ["NVDA"], off), []);
  const on = { enabledAt: "2026-11-01", seen: {} };
  assert.deepEqual(pendingNotices([revised], ["NVDA"], on).map((notice) => notice.symbol), ["NVDA"]);
  assert.deepEqual(pendingNotices([revised], ["BTC"], on), []);
  assert.deepEqual(pendingNotices([revised], ["NVDA"], { enabledAt: "2026-11-05", seen: {} }), []);
  assert.deepEqual(pendingNotices([revised], ["NVDA"], { ...on, seen: { NVDA: "2026-11-05" } }), []);
  assert.deepEqual(parseNoticeSettings('{"enabledAt":"yesterday"}'), off);
  assert.deepEqual(parseNoticeSettings('{"enabledAt":"2026-11-01","seen":{"NVDA":"2026-11-02","BTC":4}}'), { enabledAt: "2026-11-01", seen: { NVDA: "2026-11-02" } });
});

test("no catalog asset raises a notice while no revisions are recorded", () => {
  assert.ok(ASSETS.every((asset) => asset.revisions === undefined));
  assert.deepEqual(pendingNotices(cards, ASSETS.map((asset) => asset.symbol), { enabledAt: "2000-01-01", seen: {} }), []);
});

test("the live and saved filters narrow the view and survive a link", () => {
  const quotes = { NVDA: quote("finnhub"), BTC: quote("coingecko"), CEG: quote("simulated") };
  const symbols = (view, context) => exploreAssets(cards, { ...DEFAULT_VIEW, ...view }, context).map((card) => card.symbol).sort();
  assert.deepEqual(symbols({ live: true }, { quotes }), ["BTC", "NVDA"]);
  assert.deepEqual(symbols({ live: true }), []);
  assert.deepEqual(symbols({ saved: true }, { saved: ["CEG", "BTC"] }), ["BTC", "CEG"]);
  assert.deepEqual(symbols({ saved: true }), []);
  assert.deepEqual(symbols({ live: true, saved: true }, { quotes, saved: ["CEG", "BTC"] }), ["BTC"]);
  const href = explorerHref({ ...DEFAULT_VIEW, live: true, saved: true });
  assert.equal(href, "/?live=1&saved=1#markets");
  const { view, adjusted } = parseExplorerView(new URLSearchParams("live=1&saved=1"));
  assert.deepEqual([view.live, view.saved, adjusted], [true, true, false]);
  assert.equal(parseExplorerView(new URLSearchParams("live=yes")).adjusted, true);
});

test("US market hours follow New York time across daylight saving", () => {
  assert.equal(isUsMarketHours(at("2026-07-15T13:30:00Z")), true);
  assert.equal(isUsMarketHours(at("2026-07-15T13:29:00Z")), false);
  assert.equal(isUsMarketHours(at("2026-07-15T20:00:00Z")), false);
  assert.equal(isUsMarketHours(at("2026-12-15T14:30:00Z")), true);
  assert.equal(isUsMarketHours(at("2026-12-15T14:29:00Z")), false);
  assert.equal(isUsMarketHours(at("2026-11-01T15:00:00Z")), false);
});

test("freshness never treats a closed market's last price as a fault", () => {
  const friday = at("2026-10-30T20:00:00Z");
  assert.equal(describeFreshness(quote("finnhub", friday), at("2026-11-01T15:00:00Z")).tone, "closed");
  assert.equal(describeFreshness(quote("finnhub", at("2026-10-30T15:00:00Z")), at("2026-10-30T15:10:00Z")).tone, "current");
  assert.equal(describeFreshness(quote("finnhub", friday), at("2026-11-02T15:00:00Z")).tone, "older");
  assert.equal(describeFreshness(quote("coingecko", friday), friday + 60_000).tone, "current");
  assert.equal(describeFreshness(quote("coingecko", friday), at("2026-11-01T15:00:00Z")).tone, "older");
  assert.equal(describeFreshness(quote("simulated", friday), friday).tone, "simulated");
  assert.deepEqual(["0", 90_000, 7_200_000, 259_200_000].map((ms) => formatAge(Number(ms))), ["under a minute", "1 min", "2 h", "3 days"]);
  assert.deepEqual(summarizeFeed([quote("finnhub"), quote("coingecko"), quote("simulated"), quote("simulated")]), { total: 4, coingecko: 1, finnhub: 1, simulated: 2, observed: 2 });
});

test("simulated quotes name why no feed supplied them; observed quotes do not", async () => {
  const request = new NextRequest("http://localhost/api/quotes?symbols=ABBN.SW,AAPL,BTC");
  const offline = load("app/api/quotes/route.ts", { fetch: async () => { throw new Error("offline"); } });
  const reasons = async (route) => Object.fromEntries((await (await route.GET(request)).json()).quotes.map((item) => [item.symbol, item.fallback]));
  assert.deepEqual(await reasons(offline), { "ABBN.SW": "no-usd-feed", AAPL: "no-feed-key", BTC: "feed-unavailable" });
  const keyed = load("app/api/quotes/route.ts", { env: { FINNHUB_API_KEY: "test-only" }, fetch: async () => { throw new Error("offline"); } });
  assert.equal((await reasons(keyed)).AAPL, "feed-unavailable");
  const live = load("app/api/quotes/route.ts", { env: { FINNHUB_API_KEY: "test-only" }, fetch: async () => Response.json({ c: 100, d: 2, dp: 2, t: 1_790_000_000 }) });
  assert.equal((await reasons(live)).AAPL, undefined);
});

test("blend sensitivity counts every weighting and needs two scored assets", () => {
  const result = blendSensitivity([getAsset("NVDA"), getAsset("NEE"), getAsset("BTC")]);
  assert.equal(result.total, 215);
  assert.equal(result.leaders.reduce((sum, leader) => sum + leader.wins, result.ties), 215);
  assert.deepEqual(result.blends.map((blend) => blend.label), ["Equal weights", "Upside only", "Safety only", "AI exposure only"]);
  for (const blend of result.blends) {
    assert.equal(blend.order.length, 3);
    assert.ok(blend.order[0].value >= blend.order[1].value && blend.order[1].value >= blend.order[2].value);
  }
  assert.equal(result.blends[2].order[0].symbol, "NEE");
  assert.equal(result.blends[3].order[0].symbol, "NVDA");
  assert.equal(blendSensitivity([getAsset("NVDA")]), null);
  assert.equal(blendSensitivity([getAsset("NVDA"), getAsset("GEV")]), null);
});

test("exports keep their source labels and disclaimer, and defuse spreadsheet formulas", () => {
  const nvda = toCardData(getAsset("NVDA"));
  const gev = toCardData(getAsset("GEV"));
  const abb = toCardData(getAsset("BTC"));
  const rows = explorerRows([nvda, gev, abb], { NVDA: { ...quote("finnhub"), price: 204.64 }, GEV: quote("simulated") });
  assert.equal(rows[0].price_source, "Finnhub");
  assert.equal(rows[0].price_observed_at, new Date(1_790_000_000_000).toISOString());
  assert.equal(rows[0].price_note, null);
  assert.equal(rows[1].price_source, "Simulated");
  assert.equal(rows[1].price_observed_at, null);
  assert.match(rows[1].price_note, /not an observed price/);
  assert.equal(rows[2].price_source, "Unavailable");
  assert.equal(rows[2].price, null);
  const csv = toCsv([{ name: '=HYPERLINK("x")', note: "a, b", empty: null, change: -1.5 }]);
  assert.equal(csv, `# ${EXPORT_DISCLAIMER}\r\nname,note,empty,change\r\n"'=HYPERLINK(""x"")","a, b",,-1.5\r\n`);
  const json = JSON.parse(toJson(rows));
  assert.equal(json.disclaimer, EXPORT_DISCLAIMER);
  assert.equal(json.rows.length, 3);
  assert.equal(comparisonRows([getAsset("NVDA")])[0].review_status, "unreviewed");
});

test("the comparison export route serves files and rejects bad input", async () => {
  const { GET } = load("app/compare/export/route.ts");
  const csv = await GET(new Request("http://localhost/compare/export?symbols=NVDA&symbols=ceg"));
  assert.equal(csv.status, 200);
  assert.match(csv.headers.get("content-type"), /text\/csv/);
  assert.equal(csv.headers.get("content-disposition"), 'attachment; filename="goldirham-comparison-NVDA-CEG.csv"');
  assert.ok((await csv.text()).startsWith("# " + EXPORT_DISCLAIMER));
  const json = await GET(new Request("http://localhost/compare/export?symbols=NVDA&format=json"));
  assert.equal((await json.json()).rows[0].symbol, "NVDA");
  assert.equal((await GET(new Request("http://localhost/compare/export?symbols=NVDA&format=xml"))).status, 400);
  assert.equal((await GET(new Request("http://localhost/compare/export?symbols=NOPE"))).status, 404);
});

test("revision history invents nothing and shows recorded evidence", () => {
  const render = (props) => renderToStaticMarkup(createElement(ResearchRevisions, props));
  const empty = render({});
  assert.match(empty, /No dated revisions are recorded/);
  assert.doesNotMatch(empty, /<time|<a /);
  const html = render({ revisions: [{ date: "2026-10-01", revisedBy: "Test reviewer", summary: "Raised safety", sources: [{ title: "Filing", url: "https://example.com/filing" }], scoreChanges: { safety: { from: 7, to: 7.5 } } }] });
  for (const text of ["2026-10-01", "Test reviewer", "Raised safety", "Safety: 7.0 to 7.5", 'href="https://example.com/filing"']) assert.ok(html.includes(text), text);
});

test("any recorded revision has a real date, author, summary and source", () => {
  for (const asset of ASSETS) {
    for (const revision of asset.revisions ?? []) {
      assert.match(revision.date, /^\d{4}-\d{2}-\d{2}$/, asset.symbol);
      assert.ok(revision.revisedBy.trim() && revision.summary.trim() && revision.sources.length, asset.symbol);
    }
  }
});
