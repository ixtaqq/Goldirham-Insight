const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");
const load = require("../tests/load-ts.cjs");
const { CATALOG } = load("lib/catalog-data.ts");
const root = path.resolve(__dirname, "..");
const directory = path.join(root, "public/logos");
const overrides = {
  "GEV": "https://www.gevernova.com/themes/custom/ge_vernova_unified/logo.svg",
  "601939.SS": "https://companiesmarketcap.com/img/company-logos/64/601939.SS.webp",
  "601288.SS": "https://companiesmarketcap.com/img/company-logos/64/601288.SS.webp",
  "601988.SS": "https://companiesmarketcap.com/img/company-logos/64/601988.SS.webp",
  "ENR.F": "https://financialmodelingprep.com/image-stock/ENR.DE.png",
  "OEWA.F": "https://financialmodelingprep.com/image-stock/VER.VI.png",
  "TAQA.AE": "https://www.tq.com/wp-content/themes/taqa_theme/assets/img/favicon/android-icon-192x192.png",
  "AXIA3.SA": "https://axia.com.br/documents/32426/91425/LOGO.svg/025cd5d7-0e5c-a74b-bd85-f00e1eb3511b?version=1.0&t=1779996625220",
  "688825.SS": "https://www.cxmt.com/statics/shuwon/assets/img/svg/logo.svg",
};

async function main() {
  const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1");
  if (!response.ok) throw new Error(`CoinGecko markets: ${response.status}`);
  const coins = await response.json();
  const sources = JSON.parse(fs.readFileSync(path.join(directory, "sources.json"), "utf8"));
  const providers = {};
  const failures = [];
  let downloaded = 0;
  let index = 0;
  async function worker() {
    while (index < CATALOG.length) {
      const entry = CATALOG[index++];
      let url = overrides[entry.symbol] ?? `https://financialmodelingprep.com/image-stock/${entry.symbol}.png`;
      if (entry.assetClass === "crypto") {
        const matches = coins.filter((coin) => coin.symbol.toUpperCase() === entry.symbol);
        const coin = matches.length === 1 ? matches[0] : matches.find((coin) => coin.name.toLowerCase() === entry.name.toLowerCase());
        if (!coin) { failures.push({ symbol: entry.symbol, reason: "CoinGecko identity not found" }); continue; }
        providers[entry.symbol] = coin.id;
        url = coin.image;
      }
      const destination = path.join(directory, entry.symbol.toLowerCase() + ".png");
      if (fs.existsSync(destination)) continue;
      try {
        const image = await fetch(url, { signal: AbortSignal.timeout(20000) });
        if (!image.ok) throw new Error(`HTTP ${image.status}`);
        const buffer = Buffer.from(await image.arrayBuffer());
        const metadata = await sharp(buffer, { density: 300 }).metadata();
        if (!metadata.width || metadata.width < 16 || !metadata.height || metadata.height < 16) throw new Error("Image too small");
        const png = await sharp(buffer, { density: 300 }).resize({ width: 256, height: 256, fit: "inside", withoutEnlargement: true }).png().toBuffer();
        fs.writeFileSync(destination, png, { flag: "wx" });
        sources[entry.symbol] = url;
        downloaded++;
      } catch (error) {
        failures.push({ symbol: entry.symbol, reason: error.message });
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  fs.writeFileSync(path.join(directory, "sources.json"), JSON.stringify(sources, null, 2) + "\n");
  fs.writeFileSync(path.join(root, "lib/catalog-providers.ts"), "export const CRYPTO_IDS: Record<string, string> = " + JSON.stringify(providers, null, 2) + ";\n");
  console.log(JSON.stringify({ downloaded, cryptoIds: Object.keys(providers).length, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
