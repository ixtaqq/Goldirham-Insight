const assert = require("node:assert/strict");
const { test } = require("node:test");
const { NextRequest } = require("next/server");
const load = require("./load-ts.cjs");

const timestamp = 1_790_000_000;
const stock = { c: 100, d: 2, dp: 2.04, t: timestamp };
const crypto = { usd: 100, usd_24h_change: 2, last_updated_at: timestamp };
const history = { prices: [[timestamp * 1000, 100], [(timestamp + 60) * 1000, 101]] };

function setup(fetch, entry = "lib/sources.ts") {
  let now = timestamp * 1000;
  class Clock extends Date { static now() { return now; } }
  return { api: load(entry, { fetch, clock: Clock, env: { FINNHUB_API_KEY: "fixture-only" } }), advance: (ms) => { now += ms; }, now: () => now };
}

async function getQuotes(api, query = "") {
  return (await (await api.GET(new NextRequest(`http://localhost/api/quotes${query}`))).json()).quotes;
}

// Finnhub reports each quote as observed one second before it is fetched, so a served quote's
// updatedAt shows which fetch it came from.
function quoteProvider(now, { fails = () => false } = {}) {
  const finnhubFetches = [];
  const fetch = async (url) => {
    if (!url.includes("finnhub")) {
      const ids = new URL(url).searchParams.get("ids").split(",");
      return Response.json(Object.fromEntries(ids.map((id) => [id, crypto])));
    }
    const symbol = new URL(url).searchParams.get("symbol");
    finnhubFetches.push({ symbol, at: now() });
    if (fails()) return new Response(null, { status: 500 });
    return Response.json({ ...stock, t: Math.floor(now() / 1000) - 1 });
  };
  return { fetch, finnhubFetches };
}

function maxFetchesInAnyMinute(fetches) {
  return Math.max(0, ...fetches.map(({ at }) => fetches.filter((other) => other.at >= at && other.at < at + 60_000).length));
}

function lastObservedAt(fetches, symbol) {
  const last = fetches.findLast((fetch) => fetch.symbol === symbol);
  return (Math.floor(last.at / 1000) - 1) * 1000;
}

test("full-catalog polls rotate Finnhub coverage and keep observed stocks live between turns", async () => {
  let provider;
  const { api, advance, now } = setup((url) => provider.fetch(url), "app/api/quotes/route.ts");
  provider = quoteProvider(now);
  const first = await getQuotes(api);
  const eligible = first.filter((quote) => quote.source !== "coingecko" && quote.fallback !== "no-usd-feed").map((quote) => quote.symbol);
  assert.equal(eligible.length, 145);
  const seen = new Set();
  let quotes = first;
  for (let poll = 0; poll < 20; poll++) {
    if (poll > 0) {
      advance(61_000);
      quotes = await getQuotes(api);
    }
    const live = quotes.filter((quote) => quote.source === "finnhub");
    for (const quote of live) {
      seen.add(quote.symbol);
      assert.equal(quote.updatedAt, lastObservedAt(provider.finnhubFetches, quote.symbol), quote.symbol);
    }
    if (poll >= 4) {
      assert.equal(seen.size, 145, `poll ${poll}`);
      assert.deepEqual(live.map((quote) => quote.symbol).sort(), [...eligible].sort(), `poll ${poll}`);
    }
  }
  assert.ok(maxFetchesInAnyMinute(provider.finnhubFetches) <= 30);
});

test("six-second client polling stays within the Finnhub budget and covers the catalog", async () => {
  let provider;
  const { api, advance, now } = setup((url) => provider.fetch(url), "app/api/quotes/route.ts");
  provider = quoteProvider(now);
  let quotes;
  for (let poll = 0; poll < 100; poll++) {
    quotes = await getQuotes(api);
    advance(6_000);
  }
  assert.equal(quotes.filter((quote) => quote.source === "finnhub").length, 145);
  assert.ok(maxFetchesInAnyMinute(provider.finnhubFetches) <= 30);
});

test("a few symbols on a cold cache are fetched live", async () => {
  let provider;
  const { api, now } = setup((url) => provider.fetch(url), "app/api/quotes/route.ts");
  provider = quoteProvider(now);
  const quotes = await getQuotes(api, "?symbols=NVDA,AAPL");
  assert.deepEqual(quotes.map((quote) => [quote.symbol, quote.source]), [["NVDA", "finnhub"], ["AAPL", "finnhub"]]);
});

test("an observed stock survives provider failures for 15 minutes, then falls back to labelled simulation", async () => {
  let provider;
  let failing = false;
  const { api, advance, now } = setup((url) => provider.fetch(url), "app/api/quotes/route.ts");
  provider = quoteProvider(now, { fails: () => failing });
  const observed = (await getQuotes(api, "?symbols=NVDA"))[0];
  assert.equal(observed.source, "finnhub");
  failing = true;
  advance(15 * 60_000);
  assert.deepEqual((await getQuotes(api, "?symbols=NVDA"))[0], observed);
  advance(1);
  const expired = (await getQuotes(api, "?symbols=NVDA"))[0];
  assert.equal(expired.source, "simulated");
  assert.equal(expired.fallback, "feed-unavailable");
});

test("CoinGecko quotes and charts share a rolling budget and recover without caching denials", async () => {
  let calls = 0;
  const { api, advance } = setup(async (url) => {
    calls++;
    return Response.json(url.includes("simple/price") ? { bitcoin: crypto } : history);
  });
  assert.equal((await api.fetchCryptoQuotes(["bitcoin"])).bitcoin.price, 100);
  for (const range of ["1D", "1W", "1M", "3M"]) {
    assert.deepEqual(await api.fetchCryptoChart("bitcoin", range), [{ time: timestamp, value: 100 }, { time: timestamp + 60, value: 101 }]);
  }
  advance(59_999);
  assert.equal(await api.fetchCryptoChart("bitcoin", "1Y"), null);
  assert.equal(calls, 5);
  advance(1);
  assert.deepEqual(await api.fetchCryptoChart("bitcoin", "1Y"), [{ time: timestamp, value: 100 }, { time: timestamp + 60, value: 101 }]);
  assert.equal(calls, 6);
});

test("shared requests and cache reads preserve a stock quote without spending more budget", async () => {
  let calls = 0;
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const { api, advance } = setup(async () => { calls++; await gate; return Response.json(stock); });
  const requests = [api.fetchStockQuote("NVDA"), api.fetchStockQuote("NVDA")];
  release();
  for (const result of await Promise.all(requests)) assert.deepEqual(result, { price: 100, change: 2, changePct: 2.04, updatedAt: timestamp * 1000 });
  advance(59_999);
  assert.equal((await api.fetchStockQuote("NVDA")).updatedAt, timestamp * 1000);
  assert.equal(calls, 1);
  advance(1);
  assert.equal((await api.fetchStockQuote("NVDA")).price, 100);
  assert.equal(calls, 2);
});

test("a wholly rejected crypto batch retries after the failure delay", async () => {
  let calls = 0;
  const { api, advance } = setup(async () => {
    calls++;
    return Response.json(calls === 1 ? { bitcoin: { ...crypto, usd: null } } : { bitcoin: crypto });
  });
  assert.equal(await api.fetchCryptoQuotes(["bitcoin"]), null);
  advance(11_999);
  assert.equal(await api.fetchCryptoQuotes(["bitcoin"]), null);
  assert.equal(calls, 1);
  advance(1);
  assert.equal((await api.fetchCryptoQuotes(["bitcoin"])).bitcoin.price, 100);
  assert.equal(calls, 2);
});

test("distinct concurrent stock misses cannot exceed admission and expire on a rolling window", async () => {
  let calls = 0;
  const { api, advance } = setup(async () => { calls++; return Response.json(stock); });
  const result = await Promise.all(Array.from({ length: 40 }, (_, i) => api.fetchStockQuote(`STOCK${i}`)));
  assert.equal(result.filter((quote) => quote?.price === 100).length, 30);
  assert.equal(result.filter((quote) => quote === null).length, 10);
  assert.equal(calls, 30);
  advance(59_999);
  assert.equal(await api.fetchStockQuote("NEW"), null);
  advance(1);
  assert.equal((await api.fetchStockQuote("NEW")).price, 100);
  assert.equal(calls, 31);
});

test("global pending capacity releases after completion without forgetting admitted work", async () => {
  let calls = 0;
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const { api, advance } = setup(async () => { calls++; await gate; return Response.json(stock); });
  const old = Array.from({ length: 30 }, (_, i) => api.fetchStockQuote(`OLD${i}`));
  advance(60_001);
  const next = [api.fetchStockQuote("NEW1"), api.fetchStockQuote("NEW2")];
  assert.equal(await api.fetchStockQuote("DENIED"), null);
  assert.equal(calls, 32);
  release();
  for (const result of await Promise.all([...old, ...next])) assert.equal(result.price, 100);
  assert.equal((await api.fetchStockQuote("DENIED")).price, 100);
  assert.equal(calls, 33);
});

test("an exhausted crypto budget still serves the route's labeled simulated fallback", async () => {
  let calls = 0;
  const { api } = setup(async () => { calls++; return Response.json(history); }, "app/api/chart/route.ts");
  for (const range of ["1D", "1W", "1M", "3M", "1Y"]) {
    const response = await api.GET(new NextRequest(`http://localhost/api/chart?symbol=BTC&range=${range}`));
    assert.equal((await response.json()).source, "coingecko");
  }
  const response = await api.GET(new NextRequest("http://localhost/api/chart?symbol=ETH&range=1D"));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.source, "simulated");
  assert.equal(body.symbol, "ETH");
  assert.equal(body.points.length, 96);
  assert.equal(calls, 5);
});

test("crypto quotes for different pages share one CoinGecko request instead of one per page", async () => {
  let calls = 0;
  const { api, advance } = setup(async (url) => {
    calls++;
    const ids = new URL(url).searchParams.get("ids").split(",");
    return Response.json(Object.fromEntries(ids.map((id) => [id, crypto])));
  }, "app/api/quotes/route.ts");
  for (const symbol of ["BTC", "ETH", "SOL", "XRP", "DOGE", "ADA"]) {
    const { quotes } = await (await api.GET(new NextRequest(`http://localhost/api/quotes?symbols=${symbol}`))).json();
    assert.equal(quotes[0].source, "coingecko", symbol);
    advance(5_000);
  }
  assert.equal(calls, 1);
});

test("oversized symbol inputs return an actionable error without contacting providers", async () => {
  const { api } = setup(async () => { throw new Error("Unexpected fetch"); }, "app/api/quotes/route.ts");
  const response = await api.GET(new NextRequest(`http://localhost/api/quotes?symbols=${"A".repeat(4097)}`));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Symbols query is too long" });
});
