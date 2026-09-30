import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-canvas text-pine">
        <Compass size={30} />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink-950">
        Off the chart
      </h1>
      <p className="mt-2 text-muted">
        We couldn&apos;t find that asset or page. It may have been delisted, or the
        ticker is misspelled.
      </p>
      <Link
        href="/"
        className="button button-dark mt-8"
      >
        Back to the research desk
      </Link>
    </div>
  );
}
