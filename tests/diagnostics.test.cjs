const assert = require("node:assert/strict");
const { test } = require("node:test");
const load = require("./load-ts.cjs");

test("HTTP failures are recorded once per cache miss without leaking response bodies", async () => {
  const lines = [];
  const { fetchStockQuote } = load("lib/sources.ts", {
    env: { FINNHUB_API_KEY: "test-secret" },
    logger: { warn: (line) => lines.push(line) },
    fetch: async () => new Response("sensitive response body", { status: 429 }),
  });
  await Promise.all([fetchStockQuote("NVDA"), fetchStockQuote("NVDA")]);
  await fetchStockQuote("NVDA");
  assert.equal(lines.length, 1);
  assert.deepEqual(JSON.parse(lines[0]), {
    event: "market_data_fallback", provider: "finnhub", operation: "quotes", reason: "http", status: 429,
  });
  assert.doesNotMatch(lines[0], /test-secret|sensitive response|https:|token/i);
});

test("network exceptions and timeouts are classified without logging error messages", async () => {
  for (const [name, reason] of [["TypeError", "network"], ["TimeoutError", "timeout"], ["AbortError", "timeout"]]) {
    const lines = [];
    const failure = new Error("https://provider.invalid?token=test-secret");
    failure.name = name;
    const { fetchCryptoChart } = load("lib/sources.ts", {
      logger: { warn: (line) => lines.push(line) },
      fetch: async () => { throw failure; },
    });
    assert.equal(await fetchCryptoChart("bitcoin", "1D"), null);
    assert.equal(JSON.parse(lines[0]).reason, reason);
    assert.equal(JSON.parse(lines[0]).operation, "chart");
    assert.doesNotMatch(lines[0], /test-secret|provider.invalid|token/);
  }
});

test("invalid and missing crypto records are counted without discarding a valid sibling", async () => {
  const lines = [];
  const { fetchCryptoQuotes } = load("lib/sources.ts", {
    logger: { warn: (line) => lines.push(line) },
    fetch: async () => Response.json({ bitcoin: { usd: 100, usd_24h_change: 2, last_updated_at: 1_790_000_000 }, ethereum: null }),
  });
  const quotes = await fetchCryptoQuotes(["bitcoin", "ethereum", "solana"]);
  assert.equal(quotes.bitcoin.price, 100);
  assert.equal(quotes.ethereum, undefined);
  assert.equal(quotes.solana, undefined);
  assert.deepEqual(JSON.parse(lines[0]), {
    event: "market_data_fallback", provider: "coingecko", operation: "quotes", reason: "invalid-response", rejectedRecords: 2,
  });
});

test("malformed JSON and impossible provider timestamps are diagnosed", async () => {
  for (const response of [() => new Response("not-json"), () => Response.json({ c: 100, d: 2, dp: 2, t: Number.MAX_SAFE_INTEGER })]) {
    const lines = [];
    const { fetchStockQuote } = load("lib/sources.ts", {
      env: { FINNHUB_API_KEY: "test-only" },
      logger: { warn: (line) => lines.push(line) },
      fetch: async () => response(),
    });
    assert.equal(await fetchStockQuote("NVDA"), null);
    assert.equal(JSON.parse(lines[0]).reason, "invalid-response");
  }
});
