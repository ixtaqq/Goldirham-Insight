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
  return { api: load(entry, { fetch, clock: Clock, env: { FINNHUB_API_KEY: "fixture-only" } }), advance: (ms) => { now += ms; } };
}

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

test("oversized symbol inputs return an actionable error without contacting providers", async () => {
  const { api } = setup(async () => { throw new Error("Unexpected fetch"); }, "app/api/quotes/route.ts");
  const response = await api.GET(new NextRequest(`http://localhost/api/quotes?symbols=${"A".repeat(1025)}`));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Symbols query is too long" });
});
