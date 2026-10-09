import { test, expect, type Page } from "@playwright/test";

const QUOTES = {
  quotes: [
    { symbol: "NVDA", price: 123.45, change: 1.45, changePct: 1.19, currency: "USD", source: "simulated", updatedAt: 1791504000000 },
    { symbol: "BTC", price: 65432.1, change: 32.1, changePct: 0.05, currency: "USD", source: "simulated", updatedAt: 1791504000000 },
  ],
};
const POINTS = [{ time: 1791417600, value: 122 }, { time: 1791504000, value: 123.45 }];
const CLOCK_START = new Date("2026-10-09T00:00:00Z");

test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== "http://127.0.0.1:3101") {
      await route.abort("blockedbyclient");
    } else if (url.pathname === "/api/quotes") {
      await route.fulfill({ json: QUOTES });
    } else if (url.pathname === "/api/chart") {
      await route.fulfill({ json: {
        symbol: url.searchParams.get("symbol"),
        range: url.searchParams.get("range"),
        source: "simulated",
        points: POINTS,
      } });
    } else {
      await route.continue();
    }
  });
});

function desk(page: Page) {
  return page.getByRole("region", { name: "Find your next conviction." });
}

function cards(page: Page) {
  return desk(page).locator('a[href^="/asset/"]');
}

async function setVisibility(page: Page, state: "hidden" | "visible") {
  await page.evaluate((next) => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => next });
    Object.defineProperty(document, "hidden", { configurable: true, get: () => next === "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  }, state);
}

test("desktop search reopens after Escape and after Enter navigation", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Search assets" });
  await search.fill("nvda");
  await expect(page.getByRole("status", { name: "" }).filter({ hasText: "Research library" })).toBeVisible();
  await search.press("Escape");
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
  await search.fill("nvda");
  await expect(page.locator(".search-results").getByRole("link", { name: /NVDA/ })).toBeVisible();
  await search.press("Enter");
  await expect(page).toHaveURL("/asset/NVDA");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/^NVIDIA\s*NVDA$/);
  await expect(search).toHaveValue("");
  await search.fill("btc");
  await expect(page.locator(".search-results").getByRole("link", { name: /BTC/ })).toBeVisible();
  await search.press("Enter");
  await expect(page).toHaveURL("/asset/BTC");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/^Bitcoin\s*BTC$/);
});

for (const width of [850, 900, 1000]) {
  test(`menu search and Escape work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Toggle menu" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const menu = page.locator("#mobile-navigation");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: "Research", exact: true })).toBeVisible();
    const search = menu.getByRole("searchbox", { name: "Search assets" });
    await search.fill("nvda");
    await expect(menu.getByRole("link", { name: /NVDA/ })).toBeVisible();
    await search.press("Escape");
    await expect(menu).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    await toggle.click();
    await menu.getByRole("searchbox").fill("btc");
    await menu.getByRole("searchbox").press("Enter");
    await expect(page).toHaveURL("/asset/BTC");
    await expect(menu).toBeHidden();
  });
}

test("desktop navigation returns above the menu breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 1001, height: 900 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav.getByRole("button", { name: "Toggle menu" })).toBeHidden();
  await expect(nav.getByRole("link", { name: "Research", exact: true })).toBeVisible();
  await expect(nav.getByRole("searchbox", { name: "Search assets" })).toBeVisible();
});

test("theme filtering includes cross-listed assets and clears empty results", async ({ page }) => {
  await page.goto("/");
  await expect(desk(page).getByRole("status")).toHaveText("26 assets to explore");
  await desk(page).getByRole("button", { name: "AI Utilities" }).click();
  await expect(desk(page).getByRole("status")).toHaveText("6 assets to explore");
  await expect(cards(page)).toHaveCount(6);
  await expect(cards(page).filter({ hasText: "ICLN" })).toBeVisible();
  await expect(cards(page).filter({ hasText: "NVDA" })).toHaveCount(0);
  await desk(page).getByRole("button", { name: "AI Companies" }).click();
  await expect(desk(page).getByRole("status")).toHaveText("12 assets to explore");
  await desk(page).getByRole("button", { name: "Explore all 12 assets" }).click();
  await expect(cards(page).filter({ hasText: "LINK" })).toBeVisible();
  await expect(cards(page).filter({ hasText: "RENDER" })).toBeVisible();
  await desk(page).getByRole("searchbox", { name: "Filter the desk" }).fill("not-a-company");
  await expect(desk(page).getByRole("status")).toHaveText("0 assets matching “not-a-company”");
  await expect(desk(page).getByRole("heading", { name: "No matching research." })).toBeVisible();
  await desk(page).getByRole("button", { name: "Clear filters" }).click();
  await expect(desk(page).getByRole("searchbox")).toHaveValue("");
  await expect(desk(page).getByRole("status")).toHaveText("26 assets to explore");
  await expect(cards(page)).toHaveCount(9);
  await expect(desk(page).getByRole("button", { name: "AI Companies" })).toHaveAttribute("aria-pressed", "false");
});

test("ranking orders filtered research by the selected score", async ({ page }) => {
  await page.goto("/");
  const rank = desk(page).getByRole("group", { name: "Rank research" });
  await rank.getByRole("button", { name: "Safest", exact: true }).click();
  await expect(cards(page).nth(0)).toHaveAttribute("href", "/asset/NEE");
  await expect(cards(page).nth(1)).toHaveAttribute("href", "/asset/MSFT");
  await expect(cards(page).nth(2)).toHaveAttribute("href", "/asset/AAPL");
  await desk(page).getByRole("group", { name: "Filter by theme" }).getByRole("button", { name: "Crypto" }).click();
  await rank.getByRole("button", { name: "Top upside", exact: true }).click();
  await expect(cards(page)).toHaveCount(5);
  await expect(cards(page).nth(0)).toHaveAttribute("href", "/asset/SOL");
  await expect(cards(page).nth(1)).toHaveAttribute("href", "/asset/RENDER");
  await expect(cards(page).nth(0).getByText("8.5", { exact: true })).toBeVisible();
  await rank.getByRole("button", { name: "Top AI exposure", exact: true }).click();
  await expect(cards(page).nth(0)).toHaveAttribute("href", "/asset/RENDER");
  await expect(cards(page).nth(1)).toHaveAttribute("href", "/asset/LINK");
});

test("all catalog and ranked cards disclose missing human review", async ({ page }) => {
  await page.goto("/");
  await desk(page).getByRole("button", { name: "Explore all 26 assets" }).click();
  await expect(cards(page)).toHaveCount(26);
  await expect(cards(page).getByText("Not reviewed", { exact: true })).toHaveCount(26);
  await desk(page).getByRole("button", { name: "Safest", exact: true }).click();
  await expect(cards(page).getByText("Not reviewed", { exact: true })).toHaveCount(9);
  await page.goto("/category/mega-stocks");
  const categoryCards = page.locator('main a.asset-card');
  await expect(categoryCards).toHaveCount(8);
  await expect(categoryCards.getByText("Not reviewed", { exact: true })).toHaveCount(8);
});

for (const width of [320, 768, 1440]) {
  test(`score disclosures remain visible at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const radar = page.locator(".radar");
    await expect(radar.getByText("Not reviewed", { exact: true })).toBeVisible();
    await radar.getByRole("button", { name: "BTC", exact: true }).click();
    await expect(radar.getByRole("heading", { name: "Bitcoin", exact: true })).toBeVisible();
    await expect(radar.getByText("Not reviewed", { exact: true })).toBeVisible();
    const strip = page.getByRole("region", { name: "More research to explore" });
    await expect(strip.getByText("Not reviewed", { exact: true })).toHaveCount(7);
    await expect(strip.getByText("Not reviewed", { exact: true }).first()).toBeVisible();
    const framework = page.locator(".score-card");
    await framework.getByRole("button", { name: "SOL", exact: true }).click();
    await expect(framework.getByText("Solana", { exact: true })).toBeVisible();
    await expect(framework.getByText("Not reviewed", { exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const screenshot = testInfo.outputPath("provenance.png");
    await page.screenshot({ path: screenshot });
    await testInfo.attach("provenance", { path: screenshot, contentType: "image/png" });
  });
}

for (const failure of ["http", "empty"] as const) {
  test(`chart recovers from ${failure} on Retry`, async ({ page }) => {
    let attempts = 0;
    await page.route("**/api/chart?**", async (route) => {
      attempts++;
      if (attempts === 1 && failure === "http") {
        await route.fulfill({ status: 503, json: { error: "Fixture unavailable" } });
      } else {
        await route.fulfill({ json: { symbol: "BTC", range: "3M", source: "simulated", points: attempts === 1 ? [] : POINTS } });
      }
    });
    await page.goto("/asset/BTC");
    await expect(page.getByText(failure === "http" ? "Unable to load price history. Please try again." : "No price history available for this range.")).toBeVisible();
    await expect(page.getByRole("img", { name: "BTC 3M price history", exact: true })).toBeHidden();
    await page.getByRole("button", { name: "Retry chart" }).click();
    await expect(page.getByRole("img", { name: "BTC 3M price history (simulated)" })).toBeVisible();
    await expect(page.getByText("Illustrative data, not actual historical prices.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry chart" })).toHaveCount(0);
    expect(attempts).toBe(2);
  });
}

test("rapid chart ranges ignore an older delayed response", async ({ page }) => {
  let release: (() => void) | undefined;
  const delayed = new Promise<void>((resolve) => { release = resolve; });
  let olderStarted = false;
  await page.route("**/api/chart?**", async (route) => {
    const range = new URL(route.request().url()).searchParams.get("range");
    if (range === "1D") {
      olderStarted = true;
      await delayed;
    }
    await route.fulfill({ json: { symbol: "BTC", range, source: range === "1D" ? "coingecko" : "simulated", points: POINTS } });
  });
  await page.goto("/asset/BTC");
  await expect(page.getByRole("img", { name: "BTC 3M price history (simulated)" })).toBeVisible();
  const ranges = page.getByRole("group", { name: "Chart time range" });
  await ranges.getByRole("button", { name: "1D", exact: true }).click();
  await expect.poll(() => olderStarted).toBe(true);
  await ranges.getByRole("button", { name: "1Y", exact: true }).click();
  await expect(page.getByRole("img", { name: "BTC 1Y price history (simulated)" })).toBeVisible();
  release?.();
  await expect(ranges.getByRole("button", { name: "1Y", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status").filter({ hasText: "Simulated · Price history" })).toBeVisible();
  await expect(page.getByRole("img", { name: "BTC 1Y price history (simulated)" })).toBeVisible();
});

test("quote failure retains the last price and recovers on the next poll", async ({ page }) => {
  let attempts = 0;
  await page.clock.install({ time: CLOCK_START });
  await page.route("**/api/quotes", async (route) => {
    attempts++;
    if (attempts === 2) {
      await route.fulfill({ status: 503, json: { error: "Fixture unavailable" } });
    } else {
      await route.fulfill({ json: { quotes: [{ ...QUOTES.quotes[0], price: attempts === 1 ? 123.45 : 124.5 }] } });
    }
  });
  await page.goto("/");
  const nvda = cards(page).filter({ hasText: "NVDA" });
  await expect(nvda.getByText("$123.45", { exact: true })).toBeVisible();
  await page.clock.pauseAt(new Date(CLOCK_START.getTime() + 1000));
  await page.clock.runFor(6100);
  await expect(nvda.getByText("Simulated · Stale", { exact: true })).toBeVisible();
  await expect(nvda.getByText("$123.45", { exact: true })).toBeVisible();
  await page.clock.runFor(6100);
  await expect(nvda.getByText("$124.50", { exact: true })).toBeVisible();
  await expect(nvda.getByText("Simulated", { exact: true })).toBeVisible();
  expect(attempts).toBe(3);
});

test("initially hidden tabs fetch once on resume and stop polling while hidden", async ({ page }) => {
  let attempts = 0;
  await page.clock.install({ time: CLOCK_START });
  await page.addInitScript(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
  });
  await page.route("**/api/quotes", async (route) => { attempts++; await route.fulfill({ json: QUOTES }); });
  await page.goto("/");
  await desk(page).getByRole("button", { name: "Safest", exact: true }).click();
  await expect(cards(page).nth(0)).toHaveAttribute("href", "/asset/NEE");
  await desk(page).getByRole("button", { name: "All", exact: true }).click();
  await expect(cards(page).filter({ hasText: "NVDA" })).toBeVisible();
  await page.clock.pauseAt(new Date(CLOCK_START.getTime() + 1000));
  await page.clock.runFor(30000);
  expect(attempts).toBe(0);
  await setVisibility(page, "visible");
  const nvda = cards(page).filter({ hasText: "NVDA" });
  await expect(nvda.getByText("$123.45", { exact: true })).toBeVisible();
  expect(attempts).toBe(1);
  await setVisibility(page, "hidden");
  await page.clock.runFor(30000);
  expect(attempts).toBe(1);
  await expect(nvda.getByText("$123.45", { exact: true })).toBeVisible();
  await setVisibility(page, "visible");
  await expect.poll(() => attempts).toBe(2);
  await setVisibility(page, "visible");
  expect(attempts).toBe(2);
  await page.clock.runFor(6100);
  await expect.poll(() => attempts).toBe(3);
});

test("hiding aborts an in-flight poll and resume does not create duplicate polling", async ({ page }) => {
  let attempts = 0;
  let release: (() => void) | undefined;
  const delayed = new Promise<void>((resolve) => { release = resolve; });
  await page.clock.install({ time: CLOCK_START });
  await page.route("**/api/quotes", async (route) => {
    attempts++;
    const attempt = attempts;
    if (attempt === 2) await delayed;
    await route.fulfill({ json: { quotes: [{ ...QUOTES.quotes[0], price: attempt === 2 ? 999 : attempt === 3 ? 124.5 : 123.45 }] } });
  });
  await page.goto("/");
  const nvda = cards(page).filter({ hasText: "NVDA" });
  await expect(nvda.getByText("$123.45", { exact: true })).toBeVisible();
  await page.clock.pauseAt(new Date(CLOCK_START.getTime() + 1000));
  await page.clock.runFor(6100);
  await expect.poll(() => attempts).toBe(2);
  const aborted = page.waitForEvent("requestfailed", { predicate: (request) => new URL(request.url()).pathname === "/api/quotes" });
  await setVisibility(page, "hidden");
  await aborted;
  release?.();
  await page.clock.runFor(30000);
  expect(attempts).toBe(2);
  await expect(nvda.getByText("$123.45", { exact: true })).toBeVisible();
  await expect(nvda.getByText("Simulated", { exact: true })).toBeVisible();
  await setVisibility(page, "visible");
  await expect(nvda.getByText("$124.50", { exact: true })).toBeVisible();
  expect(attempts).toBe(3);
  await page.clock.runFor(6100);
  await expect.poll(() => attempts).toBe(4);
});
