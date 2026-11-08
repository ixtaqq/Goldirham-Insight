const assert = require("node:assert/strict");
const { test } = require("node:test");
const load = require("./load-ts.cjs");

const { describeFreshness, isUsMarketHours } = load("lib/feed-status.ts");

// Full-day closures published at https://www.nyse.com/markets/hours-calendars (read 2026-11-08).
const NYSE_CLOSURES = [
  "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25", "2026-06-19", "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25",
  "2027-01-01", "2027-01-18", "2027-02-15", "2027-03-26", "2027-05-31", "2027-06-18", "2027-07-05", "2027-09-06", "2027-11-25", "2027-12-24",
  "2028-01-17", "2028-02-21", "2028-04-14", "2028-05-29", "2028-06-19", "2028-07-04", "2028-09-04", "2028-11-23", "2028-12-25",
];
// 1:00 pm closes from the same page, as New York offsets.
const NYSE_EARLY_CLOSES = ["2026-11-27T13:00-05:00", "2026-12-24T13:00-05:00", "2027-11-26T13:00-05:00", "2028-07-03T13:00-04:00", "2028-11-24T13:00-05:00"];

// 16:00 UTC is 11:00 am or noon in New York, inside the session even on an early-close day.
const midday = (date) => Date.parse(`${date}T16:00:00Z`);

test("NYSE full-day holidays are outside market hours", () => {
  for (const date of NYSE_CLOSURES) assert.equal(isUsMarketHours(midday(date)), false, date);
});

test("weekdays next to holidays and unobserved weekend holidays stay trading days", () => {
  for (const date of ["2026-01-02", "2026-07-02", "2026-12-24", "2027-07-02", "2027-12-23", "2027-12-31", "2028-01-03", "2028-07-03"]) {
    assert.equal(isUsMarketHours(midday(date)), true, date);
  }
});

test("published early closes end the session at 1:00 pm New York time", () => {
  for (const close of NYSE_EARLY_CLOSES) {
    assert.equal(isUsMarketHours(Date.parse(close) - 60_000), true, close);
    assert.equal(isUsMarketHours(Date.parse(close)), false, close);
  }
});

test("days without a published early close keep the 4:00 pm close", () => {
  for (const afternoon of ["2026-07-02T15:59-04:00", "2027-07-02T15:59-04:00", "2027-12-23T15:59-05:00", "2026-11-25T15:59-05:00"]) {
    assert.equal(isUsMarketHours(Date.parse(afternoon)), true, afternoon);
  }
});

test("a stock quote on a holiday reads as market closed instead of older than expected", () => {
  const lastClose = Date.parse("2026-11-25T16:00-05:00");
  const freshness = describeFreshness({ source: "finnhub", updatedAt: lastClose }, midday("2026-11-26"));
  assert.equal(freshness.tone, "closed");
});
