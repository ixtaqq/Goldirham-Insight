import type { ResearchRevision, Scores } from "@/lib/types";

const FACTORS: { key: keyof Scores; label: string }[] = [
  { key: "upside", label: "Upside" },
  { key: "safety", label: "Safety" },
  { key: "aiExposure", label: "AI exposure" },
];

export function ResearchRevisions({ revisions = [] }: { revisions?: ResearchRevision[] }) {
  return (
    <section aria-labelledby="research-revisions-heading" className="research-revisions">
      <h2 id="research-revisions-heading">Revision history</h2>
      {revisions.length ? (
        <ol>
          {revisions.map((revision) => (
            <li key={revision.date + revision.summary}>
              <p className="revision-meta"><time dateTime={revision.date}>{revision.date}</time> · {revision.revisedBy}</p>
              <p>{revision.summary}</p>
              {FACTORS.map(({ key, label }) => {
                const change = revision.scoreChanges?.[key];
                return change && <p key={key} className="revision-score">{label}: {change.from.toFixed(1)} to {change.to.toFixed(1)}</p>;
              })}
              <ul>
                {revision.sources.map((source) => (
                  <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}<span className="sr-only"> (opens in a new tab)</span></a></li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      ) : (
        <p>No dated revisions are recorded for this thesis.</p>
      )}
    </section>
  );
}
