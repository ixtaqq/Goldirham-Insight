export function isQuoteTimestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) &&
    value > 0 && value <= 8_640_000_000_000_000;
}

export function formatQuoteTime(value: number): { iso: string; label: string } | null {
  if (!isQuoteTimestamp(value)) return null;
  const iso = new Date(value).toISOString();
  return { iso, label: iso.replace("T", " ").replace(/\.\d{3}Z$/, " UTC") };
}
