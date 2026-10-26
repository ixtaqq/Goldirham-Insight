import type { ChartRange, LinePoint, Quote } from "./types";

/**
 * Deterministic market simulation.
 *
 * Used as the live fallback for stocks/ETFs (and crypto when CoinGecko is
 * unreachable). Series are seeded per-symbol so charts look stable across
 * refreshes, while a time-based tick keeps the quote gently "alive".
 */

const YEAR_SECONDS = 365 * 24 * 3600;

function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export const RANGE_CONFIG: Record<ChartRange, { points: number; step: number; cgDays: number }> = {
  "1D": { points: 96, step: 15 * 60, cgDays: 1 },
  "1W": { points: 84, step: 2 * 3600, cgDays: 7 },
  "1M": { points: 30, step: 86400, cgDays: 30 },
  "3M": { points: 90, step: 86400, cgDays: 90 },
  "1Y": { points: 183, step: 2 * 86400, cgDays: 365 },
};

/**
 * Build a deterministic price path that ENDS exactly at `basePrice`,
 * so every timeframe reconciles with the live quote on the right edge.
 */
export function simulateSeries(
  symbol: string,
  basePrice: number,
  vol: number,
  range: ChartRange,
  endTime: number = Date.now()
): LinePoint[] {
  const { points, step } = RANGE_CONFIG[range];
  const rand = mulberry32(hashStr(symbol + range));
  const stepVol = vol * Math.sqrt(step / YEAR_SECONDS);
  const drift = 0.1 * (step / YEAR_SECONDS); // ~10%/yr upward bias

  const raw: number[] = [];
  let p = 100;
  for (let i = 0; i < points; i++) {
    p *= Math.exp(drift - 0.5 * stepVol * stepVol + stepVol * gaussian(rand));
    raw.push(p);
  }
  const scale = basePrice / raw[raw.length - 1];

  const series: LinePoint[] = [];
  const endSec = Math.floor(endTime / 1000);
  for (let i = 0; i < points; i++) {
    const time = endSec - (points - 1 - i) * step;
    series.push({ time, value: round(raw[i] * scale) });
  }
  return series;
}

/**
 * A live-ish quote: wanders every few seconds around basePrice, with a
 * day-stable previous close so the % change reads sensibly.
 */
export function simulateQuote(
  symbol: string,
  basePrice: number,
  vol: number,
  currency = "USD"
): Quote {
  const now = Date.now();
  const dayVol = vol / Math.sqrt(252);

  const tickRand = mulberry32((hashStr(symbol) ^ Math.floor(now / 3000)) >>> 0);
  const dayFrac = (now % 86400000) / 86400000;
  const wave = Math.sin(dayFrac * Math.PI * 2 + (hashStr(symbol) % 100) / 16) * dayVol * 0.7;
  const noise = gaussian(tickRand) * dayVol * 0.4;
  const price = basePrice * (1 + wave + noise);

  const prevRand = mulberry32((hashStr(symbol) ^ Math.floor(now / 86400000)) >>> 0);
  const prevClose = basePrice * (1 - gaussian(prevRand) * dayVol);
  const change = price - prevClose;

  return {
    symbol,
    price: round(price),
    change: round(change),
    changePct: round((change / prevClose) * 100, 2),
    source: "simulated",
    currency,
    updatedAt: now,
  };
}

export function round(n: number, dp?: number): number {
  if (dp !== undefined) {
    const f = 10 ** dp;
    return Math.round(n * f) / f;
  }
  // sensible precision by magnitude
  const abs = Math.abs(n);
  if (abs >= 1000) return Math.round(n * 100) / 100;
  if (abs >= 1) return Math.round(n * 100) / 100;
  return Math.round(n * 1e6) / 1e6;
}
