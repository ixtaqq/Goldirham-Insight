import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="not-found">
      <span className="not-found-seal" aria-hidden="true">
        <Compass size={30} />
      </span>
      <h1>Off the chart</h1>
      <p>
        We couldn&apos;t find that asset or page. It may have been delisted, or the
        ticker is misspelled.
      </p>
      <Link href="/" className="btn btn-primary">
        Back to the research desk
      </Link>
    </div>
  );
}
