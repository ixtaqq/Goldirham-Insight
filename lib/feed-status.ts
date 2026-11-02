import type { Quote, QuoteFallback } from "@/lib/types";

export type FreshnessTone = "current" | "closed" | "older" | "simulated";

// Past this age a quote is worth a second look, but only while its market should be trading.
const CURRENT_MS = 30 * 60 * 1000;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export const FALLBACK_LABEL: Record<QuoteFallback, string> = {
  "no-usd-feed": "International listing. No USD feed, so it stays simulated.",
  "no-feed-key": "The Finnhub key is not configured on this deployment.",
  "feed-unavailable": "The provider failed, or this minute's request budget ran out.",
};

/** Regular US session in New York time. Holidays are not known here, so they read as "older", never as broken. */
export function isUsMarketHours(now: number): boolean {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  const minutes = Number(part("hour")) * 60 + Number(part("minute"));
  return WEEKDAYS.includes(part("weekday")) && minutes >= 9 * 60 + 30 && minutes < 16 * 60;
}

export function formatAge(ms: number): string {
  const minutes = Math.floor(Math.max(ms, 0) / 60_000);
  if (minutes < 1) return "under a minute";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} h`;
  return `${Math.floor(hours / 24)} days`;
}

/** A closed market's last price is expected, so age alone never marks a stock quote as a problem. */
export function describeFreshness(quote: Pick<Quote, "source" | "updatedAt">, now: number): { tone: FreshnessTone; label: string } {
  if (quote.source === "simulated") return { tone: "simulated", label: "Illustration, not an observed price" };
  const fresh = now - quote.updatedAt <= CURRENT_MS;
  if (quote.source === "coingecko") return fresh ? { tone: "current", label: "Current" } : { tone: "older", label: "Older than expected for a 24-hour market" };
  if (!isUsMarketHours(now)) return { tone: "closed", label: "Market closed. Last price from the provider." };
  return fresh ? { tone: "current", label: "Current" } : { tone: "older", label: "Older than expected. Possibly a holiday or a trading halt." };
}

export function summarizeFeed(quotes: readonly Quote[]) {
  const count = (source: Quote["source"]) => quotes.filter((quote) => quote.source === source).length;
  const simulated = count("simulated");
  return { total: quotes.length, coingecko: count("coingecko"), finnhub: count("finnhub"), simulated, observed: quotes.length - simulated };
}
