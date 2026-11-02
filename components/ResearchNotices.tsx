"use client";

import Link from "next/link";
import type { CardData } from "@/lib/card";
import { pendingNotices, useNoticeSettings, useWatchlist } from "@/lib/watchlist";

// Opt-in and local: the choice stays in this browser, nothing is sent, and only recorded research changes raise a notice.
export function ResearchNotices({ assets }: { assets: CardData[] }) {
  const { symbols } = useWatchlist();
  const { settings, setEnabled, dismiss } = useNoticeSettings();
  if (!symbols.length) return null;
  const notices = pendingNotices(assets, symbols, settings);
  return (
    <section className="research-notices" aria-label="Research change notices">
      <label>
        <input type="checkbox" checked={Boolean(settings.enabledAt)} onChange={(event) => setEnabled(event.target.checked)} />
        Show a notice here when research on my saved assets changes
      </label>
      <p>Kept in this browser and never sent anywhere. Research changes only, never price moves.</p>
      {notices.length > 0 && (
        <ul>
          {notices.map((notice) => (
            <li key={notice.symbol}>
              <span><Link href={"/asset/" + notice.symbol} className="text-link">{notice.name}</Link> revised <time dateTime={notice.date}>{notice.date}</time>: {notice.summary}</span>
              <button type="button" className="btn btn-quiet btn-sm" aria-label={`Dismiss notice for ${notice.symbol}`} onClick={() => dismiss(notice.symbol, notice.date)}>Dismiss</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
