import type { ChartRange, LinePoint } from "./types";
import { RANGE_CONFIG, round } from "./market";
import { isQuoteTimestamp } from "./quote-time";

/**
 * External live-data sources with graceful fallback.
 *  • Crypto  → CoinGecko public API (no key needed; key optional)
 *  • Stocks  → Finnhub quotes (only if FINNHUB_API_KEY is set)
 * Every function returns null on failure so callers can fall back to the
 * deterministic simulator in market.ts. A per-process TTL cache shares pending
 * requests and briefly caches failures to reduce repeated provider calls.
 */

const CG_BASE = "https://api.coingecko.com/api/v3";
const CG_KEY = process.env.COINGECKO_API_KEY;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const REQUEST_TIMEOUT_MS = 5000;

type CacheEntry = { at: number; data: unknown };
const cache = new Map<string, CacheEntry>();
const pending = new Map<string, Promise<unknown>>();

class ProviderResponseError extends Error {
  constructor(readonly reason: "http" | "invalid-response", readonly status?: number) {
    super(reason);
  }
}

function reportFailure(key: string, error: unknown, rejectedRecords?: number) {
  const reason = error instanceof ProviderResponseError ? error.reason
    : error instanceof SyntaxError ? "invalid-response"
      : error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name) ? "timeout"
        : "network";
  console.warn(JSON.stringify({
    event: "market_data_fallback",
    provider: key.startsWith("fh:") ? "finnhub" : "coingecko",
    operation: key.startsWith("cgc:") ? "chart" : "quotes",
    reason,
    ...(error instanceof ProviderResponseError && error.status ? { status: error.status } : {}),
    ...(rejectedRecords ? { rejectedRecords } : {}),
  }));
}

async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T | null> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.data as T | null;
  const inFlight = pending.get(key);
  if (inFlight) return inFlight as Promise<T | null>;
  const request = fn()
    .catch((error: unknown) => {
      reportFailure(key, error);
      return null;
    })
    .then((data) => {
      cache.set(key, { at: Date.now(), data });
      return data;
    })
    .finally(() => pending.delete(key));
  pending.set(key, request);
  return request;
}

function cgHeaders(): HeadersInit | undefined {
  return CG_KEY ? { "x-cg-demo-api-key": CG_KEY } : undefined;
}

export interface CryptoQuote {
  price: number;
  changePct: number;
  marketCap?: number;
  updatedAt: number;
}

/** Batch crypto quotes via /simple/price. Returns map keyed by coingecko id. */
export async function fetchCryptoQuotes(
  ids: string[]
): Promise<Record<string, CryptoQuote> | null> {
  if (ids.length === 0) return {};
  const uniqueIds = [...new Set(ids)].sort();
  const key = `cgq:${uniqueIds.join(",")}`;
  try {
    return await cached(key, 12_000, async () => {
      const url = `${CG_BASE}/simple/price?ids=${uniqueIds.join(
        ","
      )}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_last_updated_at=true`;
      const res = await fetch(url, {
        headers: cgHeaders(),
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) throw new ProviderResponseError("http", res.status);
      const json = (await res.json()) as Record<
        string,
        { usd: number; usd_24h_change: number; usd_market_cap?: number; last_updated_at: number }
      >;
      if (!json || typeof json !== "object" || Array.isArray(json)) {
        throw new ProviderResponseError("invalid-response");
      }
      const out: Record<string, CryptoQuote> = {};
      let rejectedRecords = 0;
      for (const id of uniqueIds) {
        const v = json[id];
        if (
          !v || !Number.isFinite(v.usd) || round(v.usd) <= 0 ||
          !Number.isFinite(v.usd_24h_change) || v.usd_24h_change <= -100 ||
          !Number.isFinite(v.usd / (1 + v.usd_24h_change / 100)) ||
          !Number.isSafeInteger(v.last_updated_at) || !isQuoteTimestamp(v.last_updated_at * 1000)
        ) {
          rejectedRecords++;
          continue;
        }
        out[id] = {
          price: v.usd,
          changePct: v.usd_24h_change,
          marketCap: Number.isFinite(v.usd_market_cap) && v.usd_market_cap! >= 0 ? v.usd_market_cap : undefined,
          updatedAt: v.last_updated_at * 1000,
        };
      }
      if (rejectedRecords) reportFailure(key, new ProviderResponseError("invalid-response"), rejectedRecords);
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
      if (!res.ok) throw new ProviderResponseError("http", res.status);
      const json = (await res.json()) as { prices: [number, number][] };
      const prices = json?.prices ?? [];
      if (
        !Array.isArray(prices) || prices.length < 2 ||
        prices.some((p) => !Array.isArray(p) ||
          !Number.isSafeInteger(p[0]) || p[0] <= 0 ||
          !Number.isFinite(p[1]) || round(p[1]) <= 0)
      ) throw new ProviderResponseError("invalid-response");
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
  updatedAt: number;
}

/** Live stock quote via Finnhub — only when a key is configured. */
export async function fetchStockQuote(symbol: string): Promise<StockQuote | null> {
  if (!FINNHUB_KEY) return null;
  const key = `fh:${symbol}`;
  try {
    return await cached(key, 10_000, async () => {
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}`;
      const res = await fetch(url, {
        headers: { "X-Finnhub-Token": FINNHUB_KEY },
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) throw new ProviderResponseError("http", res.status);
      const j = (await res.json()) as { c: number; d: number; dp: number; t: number };
      if (
        !j || !Number.isFinite(j.c) || round(j.c) <= 0 ||
        !Number.isFinite(j.d) || !Number.isFinite(j.dp) ||
        !Number.isSafeInteger(j.t) || !isQuoteTimestamp(j.t * 1000)
      ) throw new ProviderResponseError("invalid-response");
      return { price: j.c, change: j.d, changePct: round(j.dp, 2), updatedAt: j.t * 1000 };
    });
  } catch {
    return null;
  }
}
