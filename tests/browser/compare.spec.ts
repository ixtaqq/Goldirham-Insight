import { expect, test } from "@playwright/test";

const comparisonUrl = "/compare?symbols=NVDA&symbols=CEG&symbols=BTC";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== "http://127.0.0.1:3101") {
      await route.abort("blockedbyclient");
    } else if (url.pathname === "/api/quotes") {
      await route.fulfill({ json: { quotes: [] } });
    } else if (url.pathname === "/api/chart") {
      await route.fulfill({ json: { symbol: url.searchParams.get("symbol"), range: url.searchParams.get("range"), source: "simulated", points: [] } });
    } else {
      await route.continue();
    }
  });
});

test("select three assets, share, remove, navigate history, and clear", async ({ page }) => {
  await page.goto("/compare");
  await expect(page.getByRole("heading", { name: "Start with an asset you know." })).toBeVisible();
  for (const [index, symbol] of ["NVDA", "CEG", "BTC"].entries()) {
    await page.getByLabel(`Asset ${index + 1}`, { exact: true }).selectOption(symbol);
  }
  await page.getByRole("button", { name: "Compare assets", exact: true }).click();
  await expect(page).toHaveURL(comparisonUrl);
  const table = page.getByRole("table");
  await expect(table.getByRole("columnheader")).toHaveCount(4);
  await expect(table.getByText("Not reviewed", { exact: true })).toHaveCount(3);
  await expect(table.getByRole("row", { name: /^Upside / })).toContainText("8.0 / 10");
  await expect(table.getByRole("rowheader", { name: "Key risks", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Asset 2", { exact: true })).toHaveValue("CEG");
  await page.getByRole("link", { name: "Remove CEG", exact: true }).click();
  await expect(page).toHaveURL("/compare?symbols=NVDA&symbols=BTC");
  await expect(table.getByRole("columnheader")).toHaveCount(3);
  await expect(page.getByLabel("Asset 2", { exact: true })).toHaveValue("BTC");
  await page.goBack();
  await expect(page).toHaveURL(comparisonUrl);
  await expect(page.getByLabel("Asset 2", { exact: true })).toHaveValue("CEG");
  await page.goForward();
  await expect(page.getByLabel("Asset 2", { exact: true })).toHaveValue("BTC");
  await page.getByRole("link", { name: "Clear comparison" }).click();
  await expect(page).toHaveURL("/compare");
  await expect(table).toHaveCount(0);
  await expect(page.getByLabel("Asset 1", { exact: true })).toHaveValue("");
});

test("shared URLs normalize invalid, duplicate, and excess choices visibly", async ({ page }) => {
  await page.goto("/compare?symbols=unknown&symbols=nvda&symbols=NVDA&symbols=btc,CEG,MSFT");
  await expect(page.getByRole("status").filter({ hasText: "Only the first three" })).toBeVisible();
  await expect(page.getByRole("table").getByRole("columnheader")).toHaveCount(4);
  for (const [index, symbol] of ["NVDA", "BTC", "CEG"].entries()) {
    await expect(page.getByLabel(`Asset ${index + 1}`, { exact: true })).toHaveValue(symbol);
  }
  await page.goto("/compare?symbols=unknown");
  await expect(page.getByRole("table")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Start with an asset you know." })).toBeVisible();
});

test("asset page opens a preselected comparison and final removal returns to empty", async ({ page }) => {
  await page.goto("/asset/NVDA");
  await page.getByRole("link", { name: "Compare this asset" }).click();
  await expect(page).toHaveURL("/compare?symbols=NVDA");
  await expect(page.getByText("Choose another asset above to compare it with NVDA.")).toBeVisible();
  await page.getByRole("link", { name: "Remove NVDA", exact: true }).click();
  await expect(page).toHaveURL("/compare");
  await expect(page.getByRole("table")).toHaveCount(0);
});

for (const width of [320, 768, 1001, 1440]) {
  test(`comparison navigation and contained table work at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    if (width <= 1000) await page.getByRole("button", { name: "Toggle menu" }).click();
    await page.getByRole("link", { name: "Compare assets", exact: true }).filter({ visible: true }).click();
    await expect(page).toHaveURL("/compare");
    await page.goto(comparisonUrl);
    await expect(page.getByRole("table").getByText("Not reviewed", { exact: true })).toHaveCount(3);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const scroller = page.getByRole("region", { name: "Asset research comparison", exact: true });
    await scroller.focus();
    await expect(scroller).toBeFocused();
    if (width <= 768) {
      await page.getByRole("rowheader", { name: "Review status", exact: true }).scrollIntoViewIfNeeded();
      await scroller.press("ArrowRight");
      await expect.poll(() => scroller.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
      await expect(page.getByRole("rowheader", { name: "Review status", exact: true })).toBeInViewport();
      if (width === 320) {
        const visibleWidth = await scroller.evaluate((element) => element.clientWidth);
        const labelWidth = (await page.getByRole("rowheader", { name: "Review status", exact: true }).boundingBox())!.width;
        const assetWidth = (await page.getByRole("table").getByRole("columnheader").nth(1).boundingBox())!.width;
        expect(assetWidth + labelWidth).toBeLessThanOrEqual(visibleWidth + 1);
      }
    }
    const ids = await page.locator("[id]").evaluateAll((elements) => elements.map((element) => element.id));
    expect(new Set(ids).size).toBe(ids.length);
    await scroller.evaluate((element) => { element.scrollLeft = 0; });
    await page.getByRole("heading", { name: "Compare assets.", exact: true }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    const screenshot = testInfo.outputPath(`compare-${width}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    await testInfo.attach("comparison", { path: screenshot, contentType: "image/png" });
  });
}

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("native selection, comparison evidence, and removal remain usable", async ({ page }) => {
    await page.goto("/compare");
    await page.getByLabel("Asset 1", { exact: true }).selectOption("NVDA");
    await page.getByLabel("Asset 2", { exact: true }).selectOption("BTC");
    await page.getByRole("button", { name: "Compare assets", exact: true }).click();
    await expect(page.getByRole("table").getByRole("columnheader")).toHaveCount(3);
    await expect(page.getByRole("table").getByText("Not reviewed", { exact: true })).toHaveCount(2);
    await page.getByRole("link", { name: "Remove BTC", exact: true }).click();
    await expect(page).toHaveURL("/compare?symbols=NVDA");
    await expect(page.getByRole("table").getByRole("columnheader")).toHaveCount(2);
  });
});
