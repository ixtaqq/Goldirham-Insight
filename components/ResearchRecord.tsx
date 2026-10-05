import type { ResearchReview } from "@/lib/types";

const FACTORS = [
  { key: "upside", label: "Upside" },
  { key: "safety", label: "Safety" },
  { key: "aiExposure", label: "AI exposure" },
] as const;

export function ResearchRecord({ review }: { review?: ResearchReview }) {
  return (
    <section aria-labelledby="research-record-heading" className="mb-6 border-b border-line pb-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="research-record-heading" className="text-sm font-semibold text-ink-950">Research record</h2>
        <span className="rounded-md border border-line px-2 py-1 text-xs text-muted">
          {review ? "Reviewed" : "Not reviewed"}
        </span>
      </div>
      {review ? (
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
          <p>Reviewed by {review.reviewedBy} on <time dateTime={review.reviewedAt}>{review.reviewedAt}</time>.</p>
          <div>
            <h3 className="font-semibold text-ink-950">Supporting sources</h3>
            <ul className="mt-1 space-y-1">
              {review.sources.map((source) => (
                <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer" className="break-words text-pine underline underline-offset-2">{source.title}<span className="sr-only"> (opens in a new tab)</span></a></li>
              ))}
            </ul>
          </div>
          <dl className="space-y-2">
            {FACTORS.map(({ key, label }) => <div key={key}><dt className="font-semibold text-ink-950">{label} rationale</dt><dd>{review.scoreRationale[key]}</dd></div>)}
          </dl>
          <p>Scores are editorial opinions, not forecasts.</p>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          No reviewer, review date, or supporting citations are recorded for this demo thesis.
          Scores are editorial opinions and have not been verified against cited evidence.
        </p>
      )}
    </section>
  );
}
