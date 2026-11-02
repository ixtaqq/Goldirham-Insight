import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";

const quote = (symbol: string, source: string, fallback?: string) => ({ symbol, price: 100, change: 1, changePct: 1, currency: "USD", source, fallback, updatedAt: Date.now() - 120_000 });
const QUOTES = [quote("NVDA", "finnhub"), quote("BTC", "coingecko"), quote("CEG", "simulated", "feed-unavailable"), quote("ABBN.SW", "simulated", "no-usd-feed")];

test.beforeEach(async ({ page }) => {
  await page.route("**/api/quotes?**", (route) => route.fulfill({ json: { quotes: QUOTES } }));
  await page.route("**/api/chart?**", (route) => {
    const url = new URL(route.request().url());
    return route.fulfill({ json: { symbol: url.searchParams.get("symbol"), range: url.searchParams.get("range"), source: "simulated", points: [{ time: 1791504000, value: 100 }, { time: 1791590400, value: 101 }] } });
  });
});

function desk(page: Page) {
  return page.getByRole("region", { name: "Find your next conviction." });
}

function cards(page: Page) {
  return desk(page).locator('a[href^="/asset/"].asset-card');
}

test("a saved asset survives reload, filters the desk and shows on its own page", async ({ page }) => {
  await page.goto("/");
  await expect(desk(page).getByRole("button", { name: /^Saved/ })).toContainText("0");
  await desk(page).getByRole("button", { name: "Saved" }).click();
  await expect(desk(page).getByText("Nothing is saved in this browser yet.")).toBeVisible();
  await desk(page).getByRole("button", { name: "Clear filters" }).click();
  const save = desk(page).getByRole("button", { name: "Save NVDA", exact: true });
  await expect(save).toHaveAttribute("aria-pressed", "false");
  await save.click();
  await expect(save).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(desk(page).getByRole("button", { name: "Save NVDA", exact: true })).toHaveAttribute("aria-pressed", "true");
  await desk(page).getByRole("button", { name: /^Saved/ }).click();
  await expect(page).toHaveURL("/?saved=1#markets");
  await expect(cards(page)).toHaveCount(1);
  await expect(cards(page).first()).toHaveAttribute("href", "/asset/NVDA");
  await page.goto("/asset/NVDA");
  const button = page.getByRole("button", { name: "Save NVDA", exact: true }).first();
  await expect(button).toHaveText("Saved");
  await button.click();
  await expect(button).toHaveText("Save");
});

test("saving an asset does not open its page", async ({ page }) => {
  await page.goto("/");
  await desk(page).getByRole("button", { name: "Save CEG", exact: true }).click();
  await expect(page).toHaveURL("/");
});

test("live quotes only hides simulated quotes and keeps a shareable link", async ({ page }) => {
  await page.goto("/");
  const chip = desk(page).getByRole("button", { name: /^Live quotes only/ });
  await expect(chip).toContainText("2");
  await chip.click();
  await expect(page).toHaveURL("/?live=1#markets");
  await expect(desk(page).getByRole("status")).toHaveText("2 assets to explore");
  await expect(cards(page).filter({ hasText: "NVDA" })).toHaveCount(1);
  await expect(cards(page).filter({ hasText: "BTC" })).toHaveCount(1);
  await expect(cards(page).filter({ hasText: "CEG" })).toHaveCount(0);
  await page.reload();
  await expect(desk(page).getByRole("status")).toHaveText("2 assets to explore");
});

test("the current view exports with its sources and disclaimer", async ({ page }) => {
  await page.goto("/?live=1#markets");
  await expect(desk(page).getByRole("status")).toHaveText("2 assets to explore");
  const [csv] = await Promise.all([page.waitForEvent("download"), desk(page).getByRole("button", { name: "Export CSV" }).click()]);
  expect(csv.suggestedFilename()).toBe("goldirham-research-view.csv");
  const text = readFileSync(await csv.path(), "utf8");
  expect(text).toContain("educational research, not financial advice");
  expect(text).toContain("price_source");
  expect(text).toContain("Finnhub");
  expect(text).toContain("CoinGecko");
  expect(text).not.toContain("CEG");
  const [json] = await Promise.all([page.waitForEvent("download"), desk(page).getByRole("button", { name: "Export JSON" }).click()]);
  const parsed = JSON.parse(readFileSync(await json.path(), "utf8"));
  expect(parsed.disclaimer).toContain("not financial advice");
  expect(parsed.rows).toHaveLength(2);
});

test("research notices appear only with saved assets, are opt-in and stay chosen", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("checkbox", { name: /Show a notice here/ });
  await expect(toggle).toHaveCount(0);
  await desk(page).getByRole("button", { name: "Save NVDA", exact: true }).click();
  await expect(toggle).not.toBeChecked();
  await toggle.check();
  await page.reload();
  await expect(toggle).toBeChecked();
  await expect(desk(page).getByText("Research changes only, never price moves.")).toBeVisible();
});

test("blocked browser storage keeps saving for the page view", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } });
  });
  await page.goto("/");
  const save = desk(page).getByRole("button", { name: "Save NVDA", exact: true });
  await save.click();
  await expect(save).toHaveAttribute("aria-pressed", "true");
});

test("feed status shows sources, ages and why quotes are simulated", async ({ page }) => {
  await page.goto("/status");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Feed status.");
  const table = page.getByRole("region", { name: "Quote status for each asset" });
  await expect(table.locator("tbody tr")).toHaveCount(4);
  await expect(page.locator(".feed-summary")).toContainText("2 of 4");
  const nvda = table.locator("tbody tr").filter({ hasText: "NVDA" });
  await expect(nvda).toContainText("Finnhub");
  await expect(nvda).toContainText("2 min ago");
  const abb = table.locator("tbody tr").filter({ hasText: "ABBN.SW" });
  await expect(abb).toContainText("Not observed");
  await expect(abb).toContainText("International listing");
  await page.getByRole("group", { name: "Filter quotes by source" }).getByRole("button", { name: "Observed" }).click();
  await expect(table.locator("tbody tr")).toHaveCount(2);
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Feed status" })).toHaveAttribute("aria-current", "page");
});

test("feed status reports a failed quote request instead of an empty table", async ({ page }) => {
  await page.route("**/api/quotes?**", (route) => route.fulfill({ status: 503, json: { error: "Fixture unavailable" } }));
  await page.goto("/status");
  await expect(page.getByRole("status").filter({ hasText: "Quotes unavailable. Retrying…" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Quote status for each asset" })).toHaveCount(0);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("a comparison shows blend sensitivity and exports", async ({ page, request }) => {
    await page.goto("/compare?symbols=NVDA&symbols=NEE&symbols=BTC");
    const section = page.getByRole("region", { name: "How the order changes with the weights" });
    await expect(section).toContainText("Across all 215 whole-number weightings");
    await expect(section).toContainText("not what will happen");
    await expect(section.getByRole("row", { name: /Safety only/ })).toContainText("NEE");
    const csv = await request.get((await page.getByRole("link", { name: "Export CSV" }).getAttribute("href"))!);
    expect(csv.status()).toBe(200);
    expect(await csv.text()).toContain("not financial advice");
    const json = await request.get((await page.getByRole("link", { name: "Export JSON" }).getAttribute("href"))!);
    expect((await json.json()).rows).toHaveLength(3);
    await page.goto("/compare?symbols=NVDA&symbols=GEV");
    await expect(page.getByText("needs at least two assets with scores")).toBeVisible();
  });
});

test("an asset page states that no revisions are recorded", async ({ page }) => {
  await page.goto("/asset/NVDA");
  const section = page.getByRole("region", { name: "Revision history" });
  await expect(section).toContainText("No dated revisions are recorded for this thesis.");
  await expect(section.locator("time, a")).toHaveCount(0);
});

for (const width of [320, 1001, 1440]) {
  test(`new controls fit without page overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/status", "/compare?symbols=NVDA&symbols=NEE&symbols=BTC", "/asset/NVDA"]) {
      await page.goto(path);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), { message: path }).toBe(true);
    }
  });
}
