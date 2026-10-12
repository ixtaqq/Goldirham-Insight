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
  const emptyComparison = await fetch(`${base}/compare`);
  assert.equal(emptyComparison.status, 200);
  assert.match(await emptyComparison.text(), /Start with an asset you know/);
  const comparison = await fetch(`${base}/compare?symbols=NVDA&symbols=CEG&symbols=BTC`);
  assert.equal(comparison.status, 200);
  const comparisonHtml = await comparison.text();
  assert.match(comparisonHtml, /<table/);
  assert.match(comparisonHtml, /Key risks/);
  for (const symbol of ["NVDA", "CEG", "BTC"]) {
    assert.ok(comparisonHtml.includes(`id="research-record-${symbol}"`), symbol);
    assert.ok(comparisonHtml.replace(/<!--.*?-->/g, "").includes(`Read ${symbol} research`), symbol);
  }
  const shares = [
    ["/", "/opengraph-image"],
    ["/asset/NVDA", "/asset/NVDA/opengraph-image"],
    ["/compare?symbols=NVDA&symbols=CEG&symbols=BTC", "/compare/preview?symbols=NVDA&symbols=CEG&symbols=BTC"],
  ];
  for (const [page, imagePath] of shares) {
    const html = await (await fetch(base + page)).text();
    const imageUrl = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]?.replaceAll("&amp;", "&");
    assert.ok(imageUrl?.startsWith("https://goldirham-insight.vercel.app" + imagePath), `${page} og:image ${imageUrl}`);
    assert.match(html, /<meta name="twitter:card" content="summary_large_image"/, page);
    const { pathname, search } = new URL(imageUrl);
    const image = await fetch(base + pathname + search);
    assert.equal(image.status, 200, imageUrl);
    assert.equal(image.headers.get("content-type"), "image/png", imageUrl);
    const png = Buffer.from(await image.arrayBuffer());
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1200, 630], imageUrl);
  }
  assert.doesNotMatch(await (await fetch(`${base}/compare`)).text(), /compare\/preview/);
  const comparisonHead = await (await fetch(`${base}/compare?symbols=NVDA,CEG`)).text();
  assert.match(comparisonHead, /<meta property="og:title" content="NVDA vs CEG · Goldirham Insight"/);
  const preview = await fetch(`${base}/compare/preview?symbols=NVDA&symbols=CEG`);
  assert.equal(preview.headers.get("cache-control"), "public, max-age=300, s-maxage=3600");
  const alias = await fetch(`${base}/compare/preview?symbols=nvda,NVDA,ceg&utm=x`, { redirect: "manual" });
  assert.equal(alias.status, 308);
  assert.equal(new URL(alias.headers.get("location"), base).pathname + new URL(alias.headers.get("location"), base).search, "/compare/preview?symbols=NVDA&symbols=CEG");
  assert.equal((await fetch(`${base}/compare/preview?symbols=unknown`)).status, 404);
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
  for (const symbol of ["GEV", "TAQA.AE"]) {
    const chart = await (await fetch(`${base}/api/chart?symbol=${symbol}&range=3M`)).json();
    assert.equal(chart.source, "simulated", symbol);
    assert.equal(chart.symbol, symbol);
    assert.ok(chart.points.length > 1 && chart.points.every((point) => point.value > 0), symbol);
  }
  t.diagnostic(`${ASSETS.length + CATEGORIES.length + 2} pages including comparison, empty and selected comparison states, ${ASSETS.length} asset review disclosures, five chart ranges and quote deduplication passed.`);
});
