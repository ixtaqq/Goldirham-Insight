import type { Quote, QuoteFallback } from "@/lib/types";

export type FreshnessTone = "current" | "closed" | "older" | "simulated";

// Past this age a quote is worth a second look, but only while its market should be trading.
const CURRENT_MS = 30 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const FALLBACK_LABEL: Record<QuoteFallback, string> = {
  "no-usd-feed": "International listing. No USD feed, so it stays simulated.",
  "no-feed-key": "The Finnhub key is not configured on this deployment.",
  "feed-unavailable": "The provider failed, or this minute's request budget ran out.",
};

// Calendar dates are UTC midnights, so weekday and day arithmetic ignore time zones.
const calendarDate = (year: number, month: number, day: number) => Date.UTC(year, month - 1, day);
const weekday = (date: number) => new Date(date).getUTCDay();

function nthWeekday(year: number, month: number, day: number, n: number): number {
  const first = calendarDate(year, month, 1);
  return first + (((day - weekday(first) + 7) % 7) + (n - 1) * 7) * DAY_MS;
}

function lastMonday(year: number, month: number): number {
  const last = calendarDate(year, month + 1, 0);
  return last - ((weekday(last) + 6) % 7) * DAY_MS;
}

// Anonymous Gregorian computus.
function easterSunday(year: number): number {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const h = (19 * a + b - Math.floor(b / 4) - Math.floor((8 * b + 13) / 25) + 15) % 30;
  const l = (32 + 2 * (b % 4) + 2 * Math.floor(c / 4) - h - (c % 4)) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  return calendarDate(year, month, ((h + l - 7 * m + 114) % 31) + 1);
}

// NYSE observes a Saturday holiday on Friday and a Sunday holiday on Monday.
function observed(date: number): number {
  return weekday(date) === 6 ? date - DAY_MS : weekday(date) === 0 ? date + DAY_MS : date;
}

/** NYSE full-day closures. A Saturday New Year's Day is not observed on the preceding Friday. */
function nyseHolidays(year: number): number[] {
  const newYear = calendarDate(year, 1, 1);
  return [
    ...(weekday(newYear) === 6 ? [] : [observed(newYear)]),
    nthWeekday(year, 1, 1, 3),
    nthWeekday(year, 2, 1, 3),
    easterSunday(year) - 2 * DAY_MS,
    lastMonday(year, 5),
    observed(calendarDate(year, 6, 19)),
    observed(calendarDate(year, 7, 4)),
    nthWeekday(year, 9, 1, 1),
    nthWeekday(year, 11, 4, 4),
    observed(calendarDate(year, 12, 25)),
  ];
}

/** 1:00 pm closes: July 3 and Christmas Eve when they fall Monday to Thursday, and the day after Thanksgiving. */
function nyseEarlyCloses(year: number): number[] {
  const mondayToThursday = (date: number) => weekday(date) >= 1 && weekday(date) <= 4;
  return [nthWeekday(year, 11, 4, 4) + DAY_MS, ...[calendarDate(year, 7, 3), calendarDate(year, 12, 24)].filter(mondayToThursday)];
}

/**
 * Regular NYSE session in New York time, including scheduled holidays and early closes. Unscheduled
 * closures are not known here, so they read as "older", never as broken.
 */
export function isUsMarketHours(now: number): boolean {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value);
  const year = part("year");
  const date = calendarDate(year, part("month"), part("day"));
  if (weekday(date) === 0 || weekday(date) === 6 || nyseHolidays(year).includes(date)) return false;
  const minutes = part("hour") * 60 + part("minute");
  return minutes >= 9 * 60 + 30 && minutes < (nyseEarlyCloses(year).includes(date) ? 13 : 16) * 60;
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
  return fresh ? { tone: "current", label: "Current" } : { tone: "older", label: "Older than expected. Possibly a trading halt or an unscheduled closure." };
}

export function summarizeFeed(quotes: readonly Quote[]) {
  const count = (source: Quote["source"]) => quotes.filter((quote) => quote.source === source).length;
  const simulated = count("simulated");
  return { total: quotes.length, coingecko: count("coingecko"), finnhub: count("finnhub"), simulated, observed: quotes.length - simulated };
}
