# Research tools

Seven reader tools added in November 2026. None needs a database, a login, or a paid service.

## Watchlist

The bookmark on each card and asset page saves that asset to this browser's `localStorage` under `goldirham:watchlist`. Nothing leaves the browser, so saved assets do not follow a reader to another device, and clearing site data removes them. If storage is blocked, saving still works until the page reloads.

To move saved assets to another device, use **Export watchlist** on the homepage desk. It downloads `goldirham-watchlist.json`, built in the browser:

```json
{ "format": "goldirham-watchlist", "version": 1, "symbols": ["NVDA", "BTC"] }
```

**Import watchlist** on the other device reads that file locally and merges it: catalog symbols that are not saved yet are added, and nothing already saved is removed. The file is treated as untrusted. Anything over 64 KB, anything that is not JSON, and any other shape is rejected without changing the list. Within a valid file, symbols that are already saved, listed twice, not in the catalog, or not strings are skipped, and the desk says how many were added and why the rest were skipped. Nothing from the file is rendered except those counts. The file is the only copy that leaves the browser; import also works when storage is blocked, until the page reloads.

## Desk filters

| Parameter | Value | Shows |
| --- | --- | --- |
| `live` | `1` | Assets whose current quote comes from CoinGecko or Finnhub |
| `saved` | `1` | Assets on this browser's watchlist |

A shared `saved=1` link shows the recipient's own watchlist, not the sender's.

"Live quotes only" can only show what the feeds supply. The homepage requests every asset, and Finnhub is capped at 30 calls per minute per server process, so with a key the stocks rotate through that budget, the ones observed longest ago first. Each keeps its last observed quote for up to 15 minutes between refreshes, so all 145 eligible stocks and 51 crypto assets are live within about five minutes. Asset pages request only their own few assets. "Today's largest moves" already ranks observed quotes only, so it has no toggle.

## Feed status

`/status` lists every asset's source, quote age and state.

| State | Meaning |
| --- | --- |
| Current | Observed in the last 30 minutes |
| Market closed | A stock quote outside the regular NYSE session, 9:30 to 16:00 New York time, or 13:00 on scheduled early closes, and on weekends and scheduled NYSE holidays. This is expected. |
| Older than expected | A crypto quote older than 30 minutes, or a stock quote older than 30 minutes during the session |
| Simulated | An illustration, with the reason no feed supplied it |

Scheduled NYSE holidays and 1:00 pm early closes are computed from NYSE's observance rules. Unscheduled closures, such as a national day of mourning, are not known in advance, so a stock quote on one reads "Older than expected. Possibly a trading halt or an unscheduled closure."

The quote API sets `fallback` on simulated quotes:

| Value | Reason |
| --- | --- |
| `no-usd-feed` | International listing, kept simulated rather than showing a local-currency price as USD |
| `no-feed-key` | `FINNHUB_API_KEY` is not set on this deployment |
| `feed-unavailable` | The provider failed or the per-minute budget ran out. The API does not separate the two. |

## Research revisions

Asset pages show a revision history from `Asset.revisions`, newest first. Each entry needs a real date, author, summary and at least one source, with optional score changes. No revisions are recorded yet, so every page says so. Never add one without its real details; `AGENTS.md` has the same rule for review records.

## Blend sensitivity

With at least two scored assets, `/compare` counts who leads across all 215 whole-number weightings of the three scores from 0 to 5, and shows the order under equal, upside-only, safety-only and AI-only weights. It describes editorial opinions, not forecasts. Assets without scores are left out of the count.

## Export

| Where | How | Contains |
| --- | --- | --- |
| Research desk | Export CSV or JSON buttons, built in the browser | Every asset in the current view, with scores, review status, price, source and observation time |
| Comparison | `/compare/export?symbols=NVDA&symbols=CEG&format=csv` or `format=json` | Scores, thesis, reasons, risks and review status, without prices, because the comparison shows none |

Every file carries the disclaimer: the first line of a CSV, a `disclaimer` field in JSON. Simulated prices have no observation time and carry a note saying they are not observed. CSV text that starts with a formula character gets a leading apostrophe so a spreadsheet does not run it.

## Research notices

Once a reader has saved an asset, the desk offers an opt-in notice for research changes. The setting stays in this browser under `goldirham:research-notices`, and nothing is sent anywhere. A notice appears when a saved asset's latest revision is dated after the reader opted in or last dismissed it. Price moves never raise one.

No notice can appear until a revision is recorded. Email or push alerts are not built: they need a backend, recorded consent and a delivery service with an ongoing cost.
