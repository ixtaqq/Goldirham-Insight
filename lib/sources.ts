import type { ChartRange, LinePoint } from "./types";
import { RANGE_CONFIG, round } from "./market";

/**
 * External live-data sources with graceful fallback.
 *  • Crypto  → CoinGecko public API (no key needed; key optional)
 *  • Stocks  → Finnhub quotes (only if FINNHUB_API_KEY is set)
 * Every function returns null on failure so callers can fall back to the
 * deterministic simulator in market.ts. A small in-memory TTL cache keeps us
 * well under free-tier rate limits.
 */

const CG_BASE = "https://api.coingecko.com/api/v3";
const CG_KEY = process.env.COINGECKO_API_KEY;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const REQUEST_TIMEOUT_MS = 5000;

type CacheEntry = { at: number; data: unknown };
const cache = new Map<string, CacheEntry>();

async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.data as T;
  const data = await fn();
  cache.set(key, { at: Date.now(), data });
  return data;
}

function cgHeaders(): HeadersInit | undefined {
  return CG_KEY ? { "x-cg-demo-api-key": CG_KEY } : undefined;
}

export interface CryptoQuote {
  price: number;
  changePct: number;
  marketCap?: number;
}

/** Batch crypto quotes via /simple/price. Returns map keyed by coingecko id. */
export async function fetchCryptoQuotes(
  ids: string[]
): Promise<Record<string, CryptoQuote> | null> {
  if (ids.length === 0) return {};
  const key = `cgq:${ids.sort().join(",")}`;
  try {
    return await cached(key, 12_000, async () => {
      const url = `${CG_BASE}/simple/price?ids=${ids.join(
        ","
      )}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;
      const res = await fetch(url, {
        headers: cgHeaders(),
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`coingecko ${res.status}`);
      const json = (await res.json()) as Record<
        string,
        { usd: number; usd_24h_change?: number; usd_market_cap?: number }
      >;
      const out: Record<string, CryptoQuote> = {};
      for (const [id, v] of Object.entries(json)) {
        out[id] = {
          price: v.usd,
          changePct: round(v.usd_24h_change ?? 0, 2),
          marketCap: v.usd_market_cap,
        };
      }
      return out;
    });
  } catch {
    return null;
  }
}

/** Crypto price history via /coins/{id}/market_chart, downsampled to range. */
export async function fetchCryptoChart(
  id: string,
  range: ChartRange
): Promise<LinePoint[] | null> {
  const { cgDays, points } = RANGE_CONFIG[range];
  const key = `cgc:${id}:${range}`;
  try {
    return await cached(key, 30_000, async () => {
      const url = `${CG_BASE}/coins/${id}/market_chart?vs_currency=usd&days=${cgDays}`;
      const res = await fetch(url, {
        headers: cgHeaders(),
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`coingecko ${res.status}`);
      const json = (await res.json()) as { prices: [number, number][] };
      const prices = json.prices ?? [];
      if (prices.length === 0) throw new Error("empty");
      // downsample evenly to ~points
      const stepN = Math.max(1, Math.floor(prices.length / points));
      const out: LinePoint[] = [];
      for (let i = 0; i < prices.length; i += stepN) {
        out.push({
          time: Math.floor(prices[i][0] / 1000),
          value: round(prices[i][1]),
        });
      }
      // always include the latest point
      const last = prices[prices.length - 1];
      if (out[out.length - 1]?.time !== Math.floor(last[0] / 1000)) {
        out.push({ time: Math.floor(last[0] / 1000), value: round(last[1]) });
      }
      return out;
    });
  } catch {
    return null;
  }
}

export interface StockQuote {
  price: number;
  change: number;
  changePct: number;
}

/** Live stock quote via Finnhub — only when a key is configured. */
export async function fetchStockQuote(symbol: string): Promise<StockQuote | null> {
  if (!FINNHUB_KEY) return null;
  const key = `fh:${symbol}`;
  try {
    return await cached(key, 10_000, async () => {
      const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`;
      const res = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`finnhub ${res.status}`);
      const j = (await res.json()) as { c: number; d: number; dp: number };
      if (!j.c) throw new Error("no price");
      return { price: j.c, change: j.d, changePct: round(j.dp, 2) };
    });
  } catch {
    return null;
  }
}
