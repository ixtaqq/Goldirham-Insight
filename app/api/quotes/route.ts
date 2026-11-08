import { NextRequest, NextResponse } from "next/server";
import { ASSETS, getAsset } from "@/lib/assets";
import { round, simulateQuote } from "@/lib/market";
import { fetchCryptoQuotes, fetchStockQuote, hasStockFeed } from "@/lib/sources";
import type { Asset, Quote, QuoteFallback } from "@/lib/types";

export const dynamic = "force-dynamic";

// The homepage requests every catalog symbol; the full list is about 1,200 characters.
const MAX_SYMBOLS_LENGTH = 4096;
// Every page asks CoinGecko for the same batch, so one cached request per minute serves all of them
// instead of each page's subset spending its own share of the provider budget.
const CRYPTO_IDS = ASSETS.flatMap((asset) => (asset.coingeckoId ? [asset.coingeckoId] : []));

export async function GET(req: NextRequest) {
  const param = req.nextUrl.searchParams.get("symbols");
  if (param && param.length > MAX_SYMBOLS_LENGTH) {
    return NextResponse.json({ error: "Symbols query is too long" }, { status: 400 });
  }
  const requested = param
    ? param.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
    : ASSETS.map((a) => a.symbol);

  const assets = [...new Set(requested)]
    .map((s) => getAsset(s))
    .filter((a): a is Asset => Boolean(a));

  const cg = assets.some((a) => a.coingeckoId) ? await fetchCryptoQuotes(CRYPTO_IDS) : {};

  const quotes: Quote[] = await Promise.all(
    assets.map(async (a): Promise<Quote> => {
      // Real crypto from CoinGecko
      if (a.coingeckoId && cg && cg[a.coingeckoId]) {
        const c = cg[a.coingeckoId];
        const prevClose = c.price / (1 + c.changePct / 100);
        return {
          symbol: a.symbol,
          price: round(c.price),
          change: round(c.price - prevClose),
          changePct: c.changePct,
          source: "coingecko",
          currency: "USD",
          marketCap: c.marketCap,
          updatedAt: c.updatedAt,
        };
      }
      // Real stock from Finnhub (only if a key is configured)
      const usListed = /^[A-Z]+(?:-[A-Z])?$/.test(a.symbol);
      if (a.assetClass !== "crypto" && usListed) {
        const fh = await fetchStockQuote(a.symbol);
        if (fh) {
          return {
            symbol: a.symbol,
            price: round(fh.price),
            change: round(fh.change),
            changePct: fh.changePct,
            source: "finnhub",
            currency: "USD",
            updatedAt: fh.updatedAt,
          };
        }
      }
      // Deterministic live-simulated fallback
      const fallback: QuoteFallback = a.assetClass === "crypto" ? "feed-unavailable" : !usListed ? "no-usd-feed" : hasStockFeed() ? "feed-unavailable" : "no-feed-key";
      return { ...simulateQuote(a.symbol, a.basePrice, a.vol), fallback };
    })
  );

  return NextResponse.json(
    { quotes, ts: Date.now() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
