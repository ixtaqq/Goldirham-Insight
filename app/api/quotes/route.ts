import { NextRequest, NextResponse } from "next/server";
import { ASSETS, getAsset } from "@/lib/assets";
import { round, simulateQuote } from "@/lib/market";
import { fetchCryptoQuotes, fetchStockQuote } from "@/lib/sources";
import type { Asset, Quote } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const param = req.nextUrl.searchParams.get("symbols");
  if (param && param.length > 1024) {
    return NextResponse.json({ error: "Symbols query is too long" }, { status: 400 });
  }
  const requested = param
    ? param.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
    : ASSETS.map((a) => a.symbol);

  const assets = [...new Set(requested)]
    .map((s) => getAsset(s))
    .filter((a): a is Asset => Boolean(a));

  // One batched CoinGecko call for all crypto.
  const cryptoIds = assets
    .filter((a) => a.coingeckoId)
    .map((a) => a.coingeckoId as string);
  const cg = cryptoIds.length ? await fetchCryptoQuotes(cryptoIds) : {};

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
      if (a.assetClass !== "crypto") {
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
      return simulateQuote(a.symbol, a.basePrice, a.vol);
    })
  );

  return NextResponse.json(
    { quotes, ts: Date.now() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
