import type { Asset } from "@/lib/types";

export const REVISION_FEED_PATH = "/revisions.xml";

const ENTITIES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };

/** Escapes text for XML (and HTML) and drops characters XML 1.0 forbids. */
function escape(text: string): string {
  return [...text]
    .filter((char) => {
      const code = char.codePointAt(0) ?? 0;
      return code === 0x9 || code === 0xa || code === 0xd || (code >= 0x20 && code !== 0xfffe && code !== 0xffff);
    })
    .join("")
    .replace(/[&<>"']/g, (char) => ENTITIES[char]);
}

function isWebLink(url: string): boolean {
  return URL.canParse(url) && ["http:", "https:"].includes(new URL(url).protocol);
}

/**
 * RSS 2.0 rather than Atom: Atom requires a feed-level <updated>, and with no revisions recorded there is no
 * honest value for it (a build time would misstate it). RSS needs no channel date. Revisions record a day, not a
 * time, so entries carry Dublin Core <dc:date> (which allows a bare date) instead of an RSS <pubDate> time.
 */
export function revisionFeed(assets: readonly Pick<Asset, "symbol" | "name" | "revisions">[], site: URL): string {
  const entries = assets
    .flatMap((asset) => (asset.revisions ?? []).map((revision, index, all) => ({ asset, revision, number: all.length - index })))
    .sort((a, b) => b.revision.date.localeCompare(a.revision.date));
  const items = entries.map(({ asset, revision, number }) => {
    const page = new URL("/asset/" + asset.symbol, site).href;
    const sources = revision.sources
      .map((source) => (isWebLink(source.url) ? `<li><a href="${escape(source.url)}">${escape(source.title)}</a></li>` : `<li>${escape(source.title)}</li>`))
      .join("");
    const description = `<p>${escape(revision.summary)}</p><p>Sources:</p><ul>${sources}</ul>`;
    return [
      "<item>",
      `<title>${escape(`${asset.name} (${asset.symbol}): ${revision.summary}`)}</title>`,
      `<link>${escape(page)}</link>`,
      `<guid isPermaLink="false">${escape(`${page}#revision-${number}`)}</guid>`,
      `<dc:date>${escape(revision.date)}</dc:date>`,
      `<dc:creator>${escape(revision.revisedBy)}</dc:creator>`,
      `<description>${escape(description)}</description>`,
      "</item>",
    ].join("\n");
  });
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "<channel>",
    "<title>Goldirham Insight research revisions</title>",
    `<link>${escape(new URL("/", site).href)}</link>`,
    "<description>Recorded changes to Goldirham Insight research theses and scores, newest first. Educational research, not financial advice.</description>",
    "<language>en</language>",
    `<atom:link href="${escape(new URL(REVISION_FEED_PATH, site).href)}" rel="self" type="application/rss+xml"/>`,
    ...items,
    "</channel>",
    "</rss>",
    "",
  ].join("\n");
}
