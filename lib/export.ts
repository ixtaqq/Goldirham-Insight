import type { CardData } from "@/lib/card";
import type { Asset, Quote } from "@/lib/types";
import { sourceLabel } from "@/lib/utils";

export type ExportRow = Record<string, string | number | null>;

export const EXPORT_DISCLAIMER = "Goldirham Insight: educational research, not financial advice. Scores are editorial opinions, not forecasts. Simulated prices are illustrations, not market data.";

function scoreColumns(scores: Asset["scores"]) {
  return { upside: scores?.upside ?? null, safety: scores?.safety ?? null, ai_exposure: scores?.aiExposure ?? null };
}

/** The current explorer view: each row keeps its price source, observation time and review status. */
export function explorerRows(cards: readonly CardData[], quotes: Record<string, Quote>): ExportRow[] {
  return cards.map((card) => {
    const quote = quotes[card.symbol];
    const simulated = quote?.source === "simulated";
    return {
      symbol: card.symbol,
      name: card.name,
      asset_class: card.assetClass,
      theme: card.category,
      tier: card.tier ?? null,
      ...scoreColumns(card.scores),
      review_status: card.review.status,
      reviewed_by: card.review.status === "reviewed" ? card.review.reviewedBy : null,
      reviewed_at: card.review.status === "reviewed" ? card.review.reviewedAt : null,
      price: quote?.price ?? null,
      change_pct: quote?.changePct ?? null,
      price_source: quote ? sourceLabel(quote.source) : "Unavailable",
      price_observed_at: quote && !simulated ? new Date(quote.updatedAt).toISOString() : null,
      price_note: simulated ? (card.scores ? "Illustration, not an observed price" : "Generic $100 demo seed, not an observed price") : null,
    };
  });
}

/** The comparison table's research. It shows no prices, so the export has none either. */
export function comparisonRows(assets: readonly Asset[]): ExportRow[] {
  return assets.map((asset) => ({
    symbol: asset.symbol,
    name: asset.name,
    theme: asset.theme,
    ...scoreColumns(asset.scores),
    review_status: asset.research ? "reviewed" : "unreviewed",
    reviewed_by: asset.research?.reviewedBy ?? null,
    reviewed_at: asset.research?.reviewedAt ?? null,
    review_sources: asset.research?.sources.map((source) => source.url).join(" | ") ?? null,
    thesis: asset.tagline,
    why_it_could_work: asset.whyItWins.join(" | "),
    key_risks: asset.risks.join(" | "),
    cycle_stage: asset.stage,
  }));
}

function csvCell(value: string | number | null): string {
  if (value === null) return "";
  if (typeof value === "number") return String(value);
  // A leading formula character would run as a formula when the file opens in a spreadsheet.
  const text = /^[=+\-@\t\r]/.test(value) ? "'" + value : value;
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}

export function toCsv(rows: readonly ExportRow[]): string {
  const columns = Object.keys(rows[0] ?? {});
  return ["# " + EXPORT_DISCLAIMER, columns.join(","), ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))].join("\r\n") + "\r\n";
}

export function toJson(rows: readonly ExportRow[]): string {
  return JSON.stringify({ disclaimer: EXPORT_DISCLAIMER, rows }, null, 2) + "\n";
}
