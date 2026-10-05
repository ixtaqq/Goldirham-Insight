const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const net = require("node:net");
const path = require("node:path");
const { test } = require("node:test");
const { setTimeout: delay } = require("node:timers/promises");
const load = require("./load-ts.cjs");

test("production pages, review disclosures and market routes", { timeout: 60_000 }, async (t) => {
  const portProbe = net.createServer();
  portProbe.listen(0, "127.0.0.1");
  await once(portProbe, "listening");
  const port = portProbe.address().port;
  await new Promise((resolve) => portProbe.close(resolve));

  const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, FINNHUB_API_KEY: "", COINGECKO_API_KEY: "", NEXT_TELEMETRY_DISABLED: "1" },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let serverOutput = "";
  child.stdout.on("data", (data) => { serverOutput += data; });
  child.stderr.on("data", (data) => { serverOutput += data; });
  t.after(async () => {
    if (child.exitCode === null) {
      const exited = once(child, "exit");
      child.kill();
      await exited;
    }
  });

  const base = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 15_000;
  let ready = false;
  while (Date.now() < deadline && child.exitCode === null) {
    try {
      ready = (await fetch(base, { signal: AbortSignal.timeout(1000) })).ok;
      if (ready) break;
    } catch {
      // The server may not have opened its port yet.
    }
    await delay(100);
  }
  assert.ok(ready, `Production server did not start:\n${serverOutput}`);

  const { ASSETS } = load("lib/assets.ts");
  const { CATEGORIES } = load("lib/categories.ts");
  for (const asset of ASSETS) {
    const response = await fetch(`${base}/asset/${asset.symbol}`);
    assert.equal(response.status, 200, asset.symbol);
    const html = await response.text();
    assert.ok(html.includes("Research record"), asset.symbol);
    assert.ok(html.includes(asset.research ? "Reviewed" : "Not reviewed"), asset.symbol);
  }
  for (const category of CATEGORIES) {
    assert.equal((await fetch(`${base}/category/${category.slug}`)).status, 200, category.slug);
  }
  const { quotes } = await (await fetch(`${base}/api/quotes?symbols=nvda,NVDA`)).json();
  assert.equal(quotes.length, 1);
  assert.equal(quotes[0].source, "simulated");
  for (const range of ["1D", "1W", "1M", "3M", "1Y"]) {
    const chart = await (await fetch(`${base}/api/chart?symbol=NVDA&range=${range}`)).json();
    assert.equal(chart.source, "simulated");
    assert.equal(chart.range, range);
    assert.ok(chart.points.length > 1 && chart.points.every((p) => p.value > 0));
  }
  assert.equal((await fetch(`${base}/api/chart?symbol=UNKNOWN`)).status, 404);
  t.diagnostic(`${ASSETS.length + CATEGORIES.length + 1} pages, ${ASSETS.length} review disclosures, five chart ranges and quote deduplication passed.`);
});
