import type { CSSProperties } from "react";
import type { Scores } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROWS: { key: keyof Scores; label: string }[] = [
  { key: "upside", label: "Upside" },
  { key: "safety", label: "Safety" },
  { key: "aiExposure", label: "AI exposure" },
];

/** The three editorial scores; bar length is the score on its 0–10 scale, filled in the asset's theme colour. */
export function ScoreBars({
  scores,
  className,
  variant = "rows",
  size,
}: {
  scores: Scores | null;
  className?: string;
  variant?: "rows" | "triad";
  size?: "lg";
}) {
  if (!scores) return <p className={cn("scores-pending", className)}>Scores pending research</p>;
  return (
    <dl className={cn("scores", `scores-${variant}`, size && `scores-${size}`, className)}>
      {ROWS.map(({ key, label }) => (
        <div key={key} className="score">
          <dt className="score-label">{label}</dt>
          <dd className="score-value">
            <span>{scores[key].toFixed(1)}</span>
            <span className="score-bar" aria-hidden="true"><i style={{ "--v": scores[key] / 10 } as CSSProperties} /></span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
