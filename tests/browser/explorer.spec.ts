import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== "http://127.0.0.1:3101") await route.abort("blockedbyclient");
    else if (url.pathname === "/api/quotes") await route.fulfill({ json: { quotes: [] } });
    else await route.continue();
  });
});

function desk(page: Page) {
  return page.getByRole("region", { name: "Find your next conviction." });
}

function cards(page: Page) {
  return desk(page).locator('a[href^="/asset/"]');
}

function control(page: Page, group: string, name: string) {
  return desk(page).getByRole("group", { name: group }).getByRole("button", { name, exact: true });
}

test("ranking, theme, and tier choices are restored by reload and Back", async ({ page }) => {
  await page.goto("/");
  await control(page, "Rank research", "Safest").click();
  await expect(page).toHaveURL("/?rank=safety#markets");
  await desk(page).getByRole("group", { name: "Filter by theme" }).getByRole("button", { name: /^Crypto/ }).click();
  await expect(page).toHaveURL("/?category=crypto&rank=safety#markets");
  await desk(page).getByRole("group", { name: "Filter by tier" }).getByRole("button", { name: /^Tier 1 only/ }).click();
  await expect(page).toHaveURL("/?category=crypto&rank=safety&tier=1#markets");
  await expect(cards(page)).toHaveCount(2);
  await expect(cards(page).nth(0)).toHaveAttribute("href", "/asset/BTC");

  await page.reload();
  await expect(cards(page)).toHaveCount(2);
  await expect(desk(page).getByRole("button", { name: /^Tier 1 only/ })).toHaveAttribute("aria-pressed", "true");

  await page.goBack();
  await expect(page).toHaveURL("/?category=crypto&rank=safety#markets");
  await expect(cards(page)).toHaveCount(9);
  await expect(desk(page).getByRole("button", { name: /^Tier 1 only/ })).toHaveAttribute("aria-pressed", "false");
  await page.goBack();
  await page.goBack();
  await expect(page).toHaveURL("/");
  await expect(control(page, "Rank research", "Featured")).toHaveAttribute("aria-pressed", "true");
  await expect(desk(page).getByRole("status")).toHaveText("234 assets to explore");
});

test("search updates the link without adding a history entry per keystroke", async ({ page }) => {
  await page.goto("/");
  await control(page, "Rank research", "Safest").click();
  const search = desk(page).getByRole("searchbox", { name: "Filter the desk" });
  await search.pressSequentially("microsoft", { delay: 30 });
  await expect(desk(page).getByRole("status")).toHaveText("1 asset matching “microsoft”");
  await expect(page).toHaveURL("/?q=microsoft&rank=safety#markets");

  await page.goBack();
  await expect(page).toHaveURL("/");
  await expect(search).toHaveValue("");
  await expect(desk(page).getByRole("status")).toHaveText("234 assets to explore");
  await page.goForward();
  await expect(search).toHaveValue("microsoft");
  await expect(desk(page).getByRole("status")).toHaveText("1 asset matching “microsoft”");
});

test("a link back to the homepage clears a typed search", async ({ page }) => {
  await page.goto("/?category=crypto#markets");
  const search = desk(page).getByRole("searchbox", { name: "Filter the desk" });
  await search.fill("bitcoin");
  await expect(page).toHaveURL("/?q=bitcoin&category=crypto#markets");
  await page.getByRole("link", { name: "Goldirham Insight home" }).click();
  await expect(page).toHaveURL("/");
  await expect(search).toHaveValue("");
  await expect(desk(page).getByRole("status")).toHaveText("234 assets to explore");
  await page.waitForTimeout(400);
  await expect(page).toHaveURL("/");
});

test("choices keep text typed just before them and repeated choices add no history", async ({ page }) => {
  await page.goto("/");
  await desk(page).getByRole("searchbox", { name: "Filter the desk" }).fill("bit");
  await control(page, "Rank research", "Top upside").click();
  await expect(page).toHaveURL("/?q=bit&rank=upside#markets");
  await control(page, "Rank research", "Top upside").click();
  await page.goBack();
  await expect(page).not.toHaveURL(/rank=upside/);
  await expect(control(page, "Rank research", "Featured")).toHaveAttribute("aria-pressed", "true");
});

test("search text stops at the link limit without a notice", async ({ page }) => {
  await page.goto("/");
  const search = desk(page).getByRole("searchbox", { name: "Filter the desk" });
  await search.fill("x".repeat(100));
  await expect(search).toHaveValue("x".repeat(80));
  await expect(page).toHaveURL("/?q=" + "x".repeat(80) + "#markets");
  await expect(desk(page).getByText("Some settings in this link were not recognized")).toHaveCount(0);
});

test("a shared link opens the desk with its view", async ({ page }) => {
  await page.goto("/?q=a&category=ai-utilities&rank=ai#markets");
  await expect.poll(() => desk(page).evaluate((element) => element.getBoundingClientRect().top)).toBeLessThanOrEqual(100);
  await expect(desk(page).getByRole("searchbox", { name: "Filter the desk" })).toHaveValue("a");
  await expect(control(page, "Rank research", "Top AI exposure")).toHaveAttribute("aria-pressed", "true");
  await expect(cards(page).nth(0)).toHaveAttribute("href", "/asset/CEG");
  await expect(desk(page).getByText("Some settings in this link were not recognized")).toHaveCount(0);
});

test("unrecognized link settings show defaults with a notice that clears on change", async ({ page }) => {
  await page.goto("/?category=bonds&rank=cheapest&tier=2");
  await expect(desk(page).getByText("Some settings in this link were not recognized, so their defaults are shown.")).toBeVisible();
  await expect(desk(page).getByRole("status")).toHaveText("234 assets to explore");
  await control(page, "Rank research", "Safest").click();
  await expect(page).toHaveURL("/?rank=safety#markets");
  await expect(desk(page).getByText("Some settings in this link were not recognized")).toHaveCount(0);
});

test("clearing an empty search returns to the bare homepage link", async ({ page }) => {
  await page.goto("/?q=not-a-company&tier=1#markets");
  await expect(desk(page).getByRole("heading", { name: "No matching research." })).toBeVisible();
  await desk(page).getByRole("button", { name: "Clear filters" }).click();
  await expect(page).toHaveURL("/");
  await expect(desk(page).getByRole("searchbox")).toHaveValue("");
  await expect(cards(page)).toHaveCount(9);
});

test("the prerendered desk lists research without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3101/");
  await expect(desk(page).getByRole("status")).toHaveText("234 assets to explore");
  await expect(cards(page)).toHaveCount(9);
  await context.close();
});

for (const width of [320, 768, 1001, 1440]) {
  test(`explorer controls fit without page overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?category=crypto&rank=safety&tier=1#markets");
    await expect(cards(page)).toHaveCount(2);
    await expect(desk(page).getByRole("button", { name: /^Tier 1 only/ })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  });
}

test("a custom blend ranks by its weights and is restored by reload and Back", async ({ page }) => {
  await page.goto("/");
  await control(page, "Rank research", "Safest").click();
  await control(page, "Rank research", "Custom").click();
  await expect(page).toHaveURL("/?rank=custom&w=3-3-3#markets");
  const blend = desk(page).getByRole("group", { name: "Custom blend" });
  await expect(blend.getByText("Blends weight editorial scores that have not been reviewed.", { exact: false })).toBeVisible();
  await expect(cards(page).first().getByText("Your blend", { exact: false })).toBeVisible();

  await blend.getByRole("slider", { name: "Safety" }).press("Home");
  await blend.getByRole("slider", { name: "AI exposure" }).press("Home");
  await expect(page).toHaveURL("/?rank=custom&w=3-0-0#markets");
  await expect(cards(page).nth(0)).toHaveAttribute("href", "/asset/VST");
  await expect(cards(page).nth(1)).toHaveAttribute("href", "/asset/SOL");
  await expect(cards(page).nth(0).locator(".asset-blend")).toHaveText("Your blend 8.5");

  const upside = blend.getByRole("slider", { name: "Upside" });
  await upside.press("Home");
  await expect(upside).toHaveValue("3");
  await expect(blend.getByText("At least one factor keeps a weight.", { exact: false })).toBeVisible();
  await upside.press("ArrowLeft");
  await expect(page).toHaveURL("/?rank=custom&w=2-0-0#markets");

  await page.reload();
  await expect(blend.getByRole("slider", { name: "Upside" })).toHaveValue("2");
  await expect(blend.getByRole("slider", { name: "Safety" })).toHaveValue("0");
  await expect(cards(page).nth(0)).toHaveAttribute("href", "/asset/VST");

  await page.goBack();
  await expect(page).toHaveURL("/?rank=safety#markets");
  await expect(blend).toHaveCount(0);
  await expect(cards(page).first().getByText("Your blend", { exact: false })).toHaveCount(0);
  await expect(cards(page).nth(0)).toHaveAttribute("href", "/asset/NEE");
});

for (const width of [320, 1440]) {
  test(`the custom blend fits without page overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?rank=custom&w=1-2-3#markets");
    await expect(desk(page).getByRole("slider", { name: "AI exposure" })).toHaveValue("3");
    await expect(desk(page).getByRole("slider", { name: "AI exposure" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  });
}

test("quick consecutive choices combine instead of replacing each other", async ({ page }) => {
  await page.goto("/");
  await control(page, "Rank research", "Safest").click({ noWaitAfter: true });
  await desk(page).getByRole("group", { name: "Filter by theme" }).getByRole("button", { name: /^Crypto/ }).click({ noWaitAfter: true });
  await desk(page).getByRole("group", { name: "Filter by tier" }).getByRole("button", { name: /^Tier 1 only/ }).click({ noWaitAfter: true });
  await expect(page).toHaveURL("/?category=crypto&rank=safety&tier=1#markets");
  await expect(cards(page)).toHaveCount(2);
});

test("a slider step just before a preset stays in the entry Back returns to", async ({ page }) => {
  await page.goto("/?rank=custom&w=3-3-3#markets");
  await desk(page).getByRole("slider", { name: "Upside" }).press("ArrowRight");
  await control(page, "Rank research", "Safest").click();
  await expect(page).toHaveURL("/?rank=safety#markets");
  await page.goBack();
  await expect(page).toHaveURL("/?rank=custom&w=4-3-3#markets");
  await expect(desk(page).getByRole("slider", { name: "Upside" })).toHaveValue("4");
});
