import type { Quote } from "@/lib/types";
import { formatQuoteTime } from "@/lib/quote-time";

export function QuoteFreshness({ quote }: { quote: Quote }) {
  const timestamp = formatQuoteTime(quote.updatedAt);
  const simulated = quote.source === "simulated";

  return (
    <div className="quote-freshness" aria-label="Quote freshness">
      <p>
        {simulated ? "Simulation generated" : "Quote observed"}{" "}
        {timestamp ? <time dateTime={timestamp.iso}>{timestamp.label}</time> : "at an unavailable time"}
      </p>
      <p>
        {simulated
          ? "Market quote unavailable. This price is an illustration."
          : "Provider observation time. Market hours and feed delays may apply."}
      </p>
    </div>
  );
}
