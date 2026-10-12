import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/quotes", (route) => route.fulfill({ json: { quotes: [] } }));
  await page.route("**/api/chart?**", (route) => {
    const url = new URL(route.request().url());
    return route.fulfill({ json: { symbol: url.searchParams.get("symbol"), range: url.searchParams.get("range"), source: "simulated", points: [{ time: 1791504000, value: 100 }, { time: 1791590400, value: 101 }] } });
  });
});

test("new assets can be found, show their logos, and disclose pending research", async ({ page }) => {
  await page.goto("/?q=GEV#markets");
  const card = page.locator('.asset-card[href="/asset/GEV"]');
  await expect(card).toBeVisible();
  await expect(card.getByText("Scores pending research")).toBeVisible();
  await expect(card.getByText(/Reference cap \$267.59 B/)).toBeVisible();
  await expect.poll(() => card.locator("img").evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0)).toBe(true);
  await card.click();
  await expect(page).toHaveURL("/asset/GEV");
  await expect(page.getByRole("heading", { name: /GE Vernova/ })).toBeVisible();
  await expect(page.getByText("Scores pending research", { exact: true })).toBeVisible();
  await expect(page.getByText("Not reviewed", { exact: true }).first()).toBeVisible();
  await page.goto("/compare?symbols=GEV&symbols=NVDA");
  await expect(page.locator(".compare-score").getByText("Not assessed", { exact: true })).toHaveCount(3);
});

for (const symbol of ["TAQA.AE", "AXIA3.SA", "688825.SS", "GRAM", "QQQM"]) {
  test(`catalog mark loads on ${symbol}'s page`, async ({ page }) => {
    await page.goto(`/asset/${symbol}`);
    const image = page.locator(".asset-heading img");
    await expect.poll(() => image.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0)).toBe(true);
    await expect(page.getByText("Scores pending research", { exact: true })).toBeVisible();
  });
}

for (const width of [320, 1440]) {
  test(`expanded ETF catalog and international asset fit at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/category/etf");
    await expect(page.locator("a.asset-card")).toHaveCount(52);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
    await page.goto("/asset/TAQA.AE");
    await expect(page.getByRole("heading", { name: /TAQA/ }).first()).toBeVisible();
    await expect(page.getByText("Illustrative data, not actual historical prices.")).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
    await page.screenshot({ path: testInfo.outputPath("catalog-page.png") });
  });
}
