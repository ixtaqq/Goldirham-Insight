import type { ResearchReview } from "@/lib/types";

const FACTORS = [
  { key: "upside", label: "Upside" },
  { key: "safety", label: "Safety" },
  { key: "aiExposure", label: "AI exposure" },
] as const;

export function ResearchRecord({ review, headingId = "research-record-heading" }: { review?: ResearchReview; headingId?: string }) {
  return (
    <section aria-labelledby={headingId} className="research-record">
      <div className="research-record-head">
        <h2 id={headingId}>Research record</h2>
        <span className="research-status" data-review={review ? "reviewed" : "unreviewed"}>
          <span>{review ? "Reviewed" : "Not reviewed"}</span>
        </span>
      </div>
      {review ? (
        <div className="research-record-body">
          <p>Reviewed by {review.reviewedBy} on <time dateTime={review.reviewedAt}>{review.reviewedAt}</time>.</p>
          <div>
            <h3>Supporting sources</h3>
            <ul className="mt-1 space-y-1">
              {review.sources.map((source) => (
                <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}<span className="sr-only"> (opens in a new tab)</span></a></li>
              ))}
            </ul>
          </div>
          <dl className="space-y-2">
            {FACTORS.map(({ key, label }) => <div key={key}><dt>{label} rationale</dt><dd>{review.scoreRationale[key]}</dd></div>)}
          </dl>
          <p>Scores are editorial opinions, not forecasts.</p>
        </div>
      ) : (
        <p className="research-record-body">
          No reviewer, review date, or supporting citations are recorded for this demo thesis.
          Scores are editorial opinions and have not been verified against cited evidence.
        </p>
      )}
    </section>
  );
}
