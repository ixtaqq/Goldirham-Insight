import type { Quote } from "./types";

export function sourceLabel(source: Quote["source"]): string {
  if (source === "coingecko") return "CoinGecko";
  if (source === "finnhub") return "Finnhub";
  return "Simulated";
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(value: number, currency = "USD"): string {
  const abs = Math.abs(value);
  const maxFrac = abs >= 1000 ? 2 : abs >= 1 ? 2 : abs >= 0.01 ? 4 : 6;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: maxFrac,
  }).format(value);
}

export function formatNumber(value: number, dp = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  }).format(value);
}

export function formatPct(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

export function scoreTone(score: number): "high" | "mid" | "low" {
  if (score >= 7.5) return "high";
  if (score >= 5.5) return "mid";
  return "low";
}

export function avgScore(s: { upside: number; safety: number; aiExposure: number }): number {
  return Math.round(((s.upside + s.safety + s.aiExposure) / 3) * 10) / 10;
}
