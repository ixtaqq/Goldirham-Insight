import type { Metadata } from "next";
import { FeedStatus } from "@/components/FeedStatus";
import { ASSETS } from "@/lib/assets";

const DESCRIPTION = "How much of the desk is live: the source, observation age and fallback reason for every quote.";

export const metadata: Metadata = { title: "Feed status", description: DESCRIPTION, alternates: { canonical: "/status" } };

export default function StatusPage() {
  return (
    <div className="container-x status-page">
      <header className="compare-intro">
        <h1>Feed status.</h1>
        <p>How much of the desk is live right now. Each quote names its source, how old it is, and why it is simulated if no feed could supply it.</p>
      </header>
      <FeedStatus assets={ASSETS.map(({ symbol, name }) => ({ symbol, name }))} />
      <p className="compare-disclosure">An old price is not a fault when its market is closed, so stock quotes are only marked older than expected during the regular US session. That session follows the scheduled NYSE holidays and 1:00 pm early closes. Unscheduled closures, such as a national day of mourning, are not known in advance. Provider limits apply per server process, so this page can show more simulated quotes than a page that requests only a few assets.</p>
    </div>
  );
}
