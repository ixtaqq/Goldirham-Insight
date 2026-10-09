const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { test } = require("node:test");

const tool = path.resolve(__dirname, "../tools/market-health.cjs");
const record = { event: "market_data_fallback", provider: "coingecko", operation: "quotes", reason: "invalid-response", rejectedRecords: 2 };

test("market health aggregates actual fallback records without echoing rejected input", () => {
  const input = [
    record, record,
    { event: "market_data_fallback", provider: "finnhub", operation: "quotes", reason: "http", status: 429 },
    { ...record, secret: "secret-token" },
    { ...record, provider: "https://provider.invalid?token=secret-token" },
    { ...record, reason: "secret-token" },
    { ...record, status: "secret-token" },
    { ...record, rejectedRecords: -1 },
  ].map((row) => JSON.stringify(row)).join("\n") + "\nsecret-token\n";
  const result = spawnSync(process.execPath, [tool], { input, encoding: "utf8", windowsHide: true });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    events: 3, rejectedRecords: 4, invalidLines: 6,
    groups: [
      { provider: "coingecko", operation: "quotes", reason: "invalid-response", events: 2, rejectedRecords: 4 },
      { provider: "finnhub", operation: "quotes", reason: "http", status: 429, events: 1, rejectedRecords: 0 },
    ],
  });
  assert.doesNotMatch(result.stdout + result.stderr, /secret-token|provider.invalid|https:/);
});

test("market health reports unreadable input without exposing its path", () => {
  const result = spawnSync(process.execPath, [tool, path.join(__dirname, "missing-secret-token.ndjson")], { encoding: "utf8", windowsHide: true });
  assert.equal(result.status, 1);
  assert.equal(result.stderr.trim(), "Unable to read market logs.");
  assert.doesNotMatch(result.stdout + result.stderr, /secret-token/);
});
