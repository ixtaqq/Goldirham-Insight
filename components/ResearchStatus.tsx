import type { ReviewStatus } from "@/lib/card";

export function ResearchStatus({ review }: { review: ReviewStatus }) {
  return (
    <p className="research-status" aria-label="Research review status">
      {review.status === "unreviewed" ? (
        <span>Not reviewed</span>
      ) : (
        <><span>Reviewed</span> by {review.reviewedBy} · <time dateTime={review.reviewedAt}>{review.reviewedAt}</time></>
      )}
    </p>
  );
}
