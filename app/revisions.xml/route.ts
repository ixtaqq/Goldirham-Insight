import { ASSETS } from "@/lib/assets";
import { SITE_URL } from "@/lib/site";
import { revisionFeed } from "./feed";

// Revisions live in the catalog, so the feed only changes with a new build.
export const dynamic = "force-static";

export function GET() {
  return new Response(revisionFeed(ASSETS, SITE_URL), { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
