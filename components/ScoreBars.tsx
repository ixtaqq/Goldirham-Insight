import type { Scores } from "@/lib/types";
import { cn, scoreTone } from "@/lib/utils";

const TONE: Record<"high" | "mid" | "low", string> = {
  high: "from-gain/80 to-gain",
  mid: "from-gold/80 to-gold",
  low: "from-loss/80 to-loss",
};

const ROWS: { key: keyof Scores; label: string }[] = [
  { key: "upside", label: "Upside" },
  { key: "safety", label: "Safety" },
  { key: "aiExposure", label: "AI exposure" },
];

export function ScoreBars({
  scores,
  className,
  compact = false,
}: {
  scores: Scores;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {ROWS.map(({ key, label }) => {
        const value = scores[key];
        const tone = scoreTone(value);
        return (
          <div key={key} className="flex items-center gap-3">
            <span
              className={cn(
                "shrink-0 text-muted",
                compact ? "w-16 text-[11px]" : "w-24 text-xs"
              )}
            >
              {label}
            </span>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-line">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full bg-linear-to-r",
                  TONE[tone]
                )}
                style={{ width: `${value * 10}%` }}
              />
            </div>
            <span
              className={cn(
                "shrink-0 text-right font-mono tabular-nums",
                compact ? "w-9 text-[11px]" : "w-12 text-xs",
                tone === "high"
                  ? "text-gain"
                  : tone === "mid"
                    ? "text-gold"
                    : "text-loss"
              )}
            >
              {value.toFixed(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
