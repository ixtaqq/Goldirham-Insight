const assert = require("node:assert/strict");
const { test } = require("node:test");
const { NextRequest } = require("next/server");
const load = require("./load-ts.cjs");

const timestamp = 1_790_000_000;
const crypto = { usd: 100, usd_24h_change: 2, last_updated_at: timestamp };
const stock = { c: 100, d: 2, dp: 2.04, t: timestamp };
const json = (data) => Response.json(data);
const request = (query) => new NextRequest(`http://localhost/api/${query}`);

test("one malformed crypto quote falls back without poisoning valid quotes", async () => {
  const { GET } = load("app/api/quotes/route.ts", {
    fetch: async () => json({ bitcoin: { ...crypto, usd: null }, ethereum: crypto }),
  });
  const { quotes } = await (await GET(request("quotes?symbols=BTC,ETH"))).json();
  assert.equal(quotes[0].source, "simulated");
  assert.equal(quotes[1].source, "coingecko");
  assert.ok(quotes.every((q) => q.price > 0 && Number.isFinite(q.change)));
});

test("stale or impossible crypto changes use simulation", async () => {
  for (const change of [null, undefined, -100, -101, "2"]) {
    const { GET } = load("app/api/quotes/route.ts", {
      fetch: async () => json({ bitcoin: { ...crypto, usd_24h_change: change } }),
    });
    const { quotes } = await (await GET(request("quotes?symbols=BTC"))).json();
    assert.equal(quotes[0].source, "simulated", `change: ${change}`);
  }
});

test("invalid stock fields use simulation", async () => {
  const { GET } = load("app/api/quotes/route.ts", {
    env: { FINNHUB_API_KEY: "test-only" },
    fetch: async () => json({ ...stock, d: null, dp: null }),
  });
  const { quotes } = await (await GET(request("quotes?symbols=AAPL"))).json();
  assert.equal(quotes[0].source, "simulated");
});

test("malformed chart history uses the labeled simulation fallback", async () => {
  const { GET } = load("app/api/chart/route.ts", {
    fetch: async () => json({ prices: [[timestamp * 1000, null], [(timestamp + 60) * 1000, 100]] }),
  });
  const body = await (await GET(request("chart?symbol=BTC&range=1D"))).json();
  assert.equal(body.source, "simulated");
  assert.equal(body.points.length, 96);
  assert.ok(body.points.every((p) => Number.isInteger(p.time) && p.value > 0));
});

test("duplicate symbols produce one quote and one provider request", async () => {
  let calls = 0;
  const { GET } = load("app/api/quotes/route.ts", {
    env: { FINNHUB_API_KEY: "test-only" },
    fetch: async () => { calls++; return json(stock); },
  });
  const { quotes } = await (await GET(request("quotes?symbols=nvda,NVDA,%20NVDA%20"))).json();
  assert.equal(quotes.length, 1);
  assert.equal(calls, 1);
});

test("chart histories without distinct increasing seconds use simulation", async () => {
  const histories = [
    [[timestamp * 1000, 100], [timestamp * 1000 + 500, 101]],
    [[timestamp * 1000, 100], [(timestamp - 60) * 1000, 101]],
    [[8_640_000_000_000_001, 100], [8_640_000_000_001_001, 101]],
  ];
  for (const prices of histories) {
    const { GET } = load("app/api/chart/route.ts", { fetch: async () => json({ prices }) });
    const body = await (await GET(request("chart?symbol=BTC&range=1D"))).json();
    assert.equal(body.source, "simulated");
    assert.equal(body.points.length, 96);
  }
});

test("concurrent cache misses share a single provider request", async () => {
  let calls = 0;
  const { fetchCryptoQuotes } = load("lib/sources.ts", {
    fetch: async () => { calls++; return json({ bitcoin: crypto }); },
  });
  const results = await Promise.all([fetchCryptoQuotes(["bitcoin"]), fetchCryptoQuotes(["bitcoin"])]);
  assert.ok(results.every((result) => result.bitcoin.price === 100));
  assert.equal(calls, 1);
});

test("provider failures are cached briefly, then retried after expiry", async () => {
  let calls = 0;
  let now = timestamp * 1000;
  class Clock extends Date { static now() { return now; } }
  const { fetchCryptoQuotes } = load("lib/sources.ts", {
    clock: Clock,
    fetch: async () => { calls++; return calls === 1 ? new Response(null, { status: 429 }) : json({ bitcoin: crypto }); },
  });
  assert.equal(await fetchCryptoQuotes(["bitcoin"]), null);
  assert.equal(await fetchCryptoQuotes(["bitcoin"]), null);
  assert.equal(calls, 1);
  now += 12_001;
  assert.equal((await fetchCryptoQuotes(["bitcoin"])).bitcoin.price, 100);
  assert.equal(calls, 2);
});

test("equivalent crypto ID sets share a cache entry without mutating the input", async () => {
  let calls = 0;
  const { fetchCryptoQuotes } = load("lib/sources.ts", {
    fetch: async () => { calls++; return json({ bitcoin: crypto, ethereum: crypto }); },
  });
  const ids = ["ethereum", "bitcoin", "bitcoin"];
  await fetchCryptoQuotes(ids);
  await fetchCryptoQuotes(["bitcoin", "ethereum"]);
  assert.deepEqual(ids, ["ethereum", "bitcoin", "bitcoin"]);
  assert.equal(calls, 1);
});

test("quotes retain provider timestamps across API reads", async () => {
  const { GET } = load("app/api/quotes/route.ts", {
    env: { FINNHUB_API_KEY: "test-only" },
    fetch: async (url) => json(url.includes("coingecko") ? { bitcoin: crypto } : stock),
  });
  for (let i = 0; i < 2; i++) {
    const { quotes } = await (await GET(request("quotes?symbols=BTC,AAPL"))).json();
    assert.ok(quotes.every((quote) => quote.updatedAt === timestamp * 1000));
  }
});

test("Finnhub credentials use a header instead of a request URL", async () => {
  let captured;
  const { fetchStockQuote } = load("lib/sources.ts", {
    env: { FINNHUB_API_KEY: "test-only" },
    fetch: async (url, options) => { captured = { url: new URL(url), options }; return json(stock); },
  });
  assert.equal((await fetchStockQuote("NVDA")).price, 100);
  assert.equal(captured.url.searchParams.has("token"), false);
  assert.equal(new Headers(captured.options.headers).get("X-Finnhub-Token"), "test-only");
});

test("valid chart history retains the latest provider point", async () => {
  const prices = Array.from({ length: 200 }, (_, i) => [(timestamp + i * 60) * 1000, 100 + i]);
  const { GET } = load("app/api/chart/route.ts", { fetch: async () => json({ prices }) });
  const body = await (await GET(request("chart?symbol=BTC&range=1D"))).json();
  assert.equal(body.source, "coingecko");
  assert.deepEqual(body.points.at(-1), { time: timestamp + 199 * 60, value: 299 });
});

test("unknown chart symbols return 404 without an external request", async () => {
  const { GET } = load("app/api/chart/route.ts", { fetch: async () => { throw new Error("Unexpected external request"); } });
  const response = await GET(request("chart?symbol=UNKNOWN"));
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "Unknown symbol" });
});
