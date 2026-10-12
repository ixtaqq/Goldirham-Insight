const fs = require("node:fs");
const path = require("node:path");

const input = fs.readFileSync(process.argv[2], "utf8");
const categories = ["ai-utilities", "ai-companies", "mega-stocks", "etf", "crypto"];
const entries = new Map();
let category;
let group = "";
for (const line of input.split(/\r?\n/)) {
  const heading = line.match(/^## ([1-5])\./);
  if (heading) category = categories[Number(heading[1]) - 1];
  if (line.startsWith("## 6.")) category = undefined;
  if (!category || !line.startsWith("|")) continue;
  const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
  if (cells[0].startsWith("**")) group = cells[0].replaceAll("**", "");
  if (!/^\d+$/.test(cells[0])) continue;
  const symbol = category === "etf" ? cells[1] : cells[2];
  const entry = entries.get(symbol) ?? {
    symbol,
    name: category === "etf" ? cells[2] : cells[1],
    assetClass: category === "crypto" ? "crypto" : category === "etf" ? "etf" : "stock",
    country: category === "crypto" ? undefined : category === "etf" ? "USA" : cells[4],
    marketCap: category === "etf" ? undefined : cells[3],
    focus: category === "etf" ? cells[3] : cells[5],
    group: category === "etf" ? group : undefined,
    listings: [],
  };
  entry.listings.push({ category, rank: Number(cells[0]) });
  entries.set(symbol, entry);
}
for (const category of categories) {
  const count = [...entries.values()].filter((entry) => entry.listings.some((listing) => listing.category === category)).length;
  if (count !== 50) throw new Error(`${category}: expected 50 entries, got ${count}`);
}
const root = path.resolve(__dirname, "..");
fs.writeFileSync(path.join(root, "lib/catalog-data.ts"), 'import type { CatalogEntry } from "./catalog";\n\nexport const CATALOG: CatalogEntry[] = ' + JSON.stringify([...entries.values()], null, 2) + ';\n', { flag: "wx" });
fs.writeFileSync(path.join(root, "docs/catalog-2026-10-12.md"), input, { flag: "wx" });
console.log(`${entries.size} unique catalog entries, 50 per category.`);
